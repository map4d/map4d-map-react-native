import {
  buildGeojsonStyle,
  createBaseStyle,
} from '../../internal/GeojsonStyleUtils';
import { Animated, Easing } from 'react-native';
import {
  DRAWER_CLOSE_DURATION_MS,
  DRAWER_OPEN_DURATION_MS,
} from '../shared/constants';
import { getCategoryConfigUrl, getSourceUrl } from './api';
import {
  createCategoryGroupSections,
  getSelectedCategoryItems,
  normalizeCategoryItems,
  reconcileExpandedGroupKeys,
  resolveCategoryGroupMetadataFromResponse,
  resolveItemsFromCategoryResponse,
  toggleCategoryGroupChecked,
  toggleCategoryItemChecked,
} from './categories';

async function loadCategoryItems(self) {
  const requestId = self._categoryRequestId + 1;
  self._categoryRequestId = requestId;

  try {
    const response = await fetch(getCategoryConfigUrl(self.props.isStaging));
    if (!response.ok) {
      throw new Error(`Failed to fetch category config: ${response.status}`);
    }

    const json = await response.json();
    const nextItems = resolveItemsFromCategoryResponse(json);
    const groupMetadata = resolveCategoryGroupMetadataFromResponse(json);

    if (!self._isMounted || requestId !== self._categoryRequestId) {
      return;
    }

    self.setState((prevState) => {
      const categoryItems = normalizeCategoryItems(nextItems);
      const groupSections = createCategoryGroupSections(
        categoryItems,
        groupMetadata.titleByKey,
        groupMetadata.orderedKeys
      );

      return {
        categoryItems,
        groupTitleByKey: groupMetadata.titleByKey,
        groupOrderedKeys: groupMetadata.orderedKeys,
        expandedGroupKeys: reconcileExpandedGroupKeys(
          groupSections,
          prevState.expandedGroupKeys
        ),
      };
    });
  } catch (error) {
    if (requestId !== self._categoryRequestId) {
      return;
    }
    console.warn('Cannot load category items', error);
  }
}

function toggleItem(self, targetKey, targetIndex) {
  self.setState((prevState) => ({
    categoryItems: toggleCategoryItemChecked(
      prevState.categoryItems,
      targetKey,
      targetIndex
    ),
  }));
}

function toggleGroup(self, groupKey) {
  if (typeof groupKey !== 'string' || groupKey.length === 0) {
    return;
  }

  self.setState((prevState) => ({
    expandedGroupKeys: {
      ...prevState.expandedGroupKeys,
      [groupKey]: !(prevState.expandedGroupKeys[groupKey] !== false),
    },
  }));
}

function toggleGroupChecked(self, groupKey, checkedValue) {
  self.setState((prevState) => ({
    categoryItems: toggleCategoryGroupChecked(
      prevState.categoryItems,
      groupKey,
      checkedValue
    ),
  }));
}

function toggleSelectorVisibility(self) {
  if (self.state.isSelectorVisible) {
    self._closeSelector();
    return;
  }

  self._openSelector();
}

function openSelector(self) {
  self.setState(
    {
      isSelectorMounted: true,
      isSelectorVisible: true,
    },
    () => {
      Animated.timing(self._selectorAnim, {
        toValue: 1,
        duration: DRAWER_OPEN_DURATION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  );
}

function closeSelector(self) {
  Animated.timing(self._selectorAnim, {
    toValue: 0,
    duration: DRAWER_CLOSE_DURATION_MS,
    easing: Easing.in(Easing.cubic),
    useNativeDriver: true,
  }).start(() => {
    if (!self._isMounted) {
      return;
    }

    self.setState({
      isSelectorVisible: false,
      isSelectorMounted: false,
    });
  });
}

function snapSelectorOpen(self) {
  Animated.timing(self._selectorAnim, {
    toValue: 1,
    duration: DRAWER_OPEN_DURATION_MS,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  }).start();
}

// A ready map is a built map, not a styled one: on iOS onMapReady fires on the
// first drawn frame, so the SDK can still answer with nothing while the style
// is being parsed. Retried a few times before the bundled roadmap is accepted
// as the answer, since that choice sticks for the rest of the session.
const MAP_STYLE_RETRY_DELAY_MS = 300;
const MAP_STYLE_RETRY_LIMIT = 5;

function isUsableMapStyle(mapStyle) {
  if (typeof mapStyle === 'string') {
    return mapStyle.trim().length > 0;
  }

  return mapStyle != null && typeof mapStyle === 'object';
}

// The style the map itself is showing, read from the SDK once the map is ready.
// Read once and kept: from the first sync on, the SDK holds the style we wrote,
// so reading again would build on our own output.
async function loadMapStyle(self) {
  if (self._isMapStyleLoaded || self._isMapStyleLoading || !self._isMounted) {
    return;
  }

  self._isMapStyleLoading = true;
  let mapStyle = null;

  try {
    mapStyle = await self.getMapStyle();
  } catch (error) {
    // Nothing to build on but the bundled roadmap, which createBaseStyle
    // falls back to on a null style.
    console.warn('Cannot read map style', error);
  }

  self._isMapStyleLoading = false;

  if (!self._isMounted) {
    return;
  }

  if (
    !isUsableMapStyle(mapStyle) &&
    self._mapStyleAttempts < MAP_STYLE_RETRY_LIMIT
  ) {
    self._mapStyleAttempts += 1;
    self._mapStyleRetryTimer = setTimeout(
      () => loadMapStyle(self),
      MAP_STYLE_RETRY_DELAY_MS
    );
    return;
  }

  self._sdkMapStyle = isUsableMapStyle(mapStyle) ? mapStyle : null;
  self._isMapStyleLoaded = true;
  self._syncGeojsonStyle();
}

function cancelMapStyleRetry(self) {
  clearTimeout(self._mapStyleRetryTimer);
  self._mapStyleRetryTimer = null;
}

function syncGeojsonStyle(self) {
  if (!self.state.isReady) {
    return;
  }

  // A mapStyle the caller gave wins and needs no wait; without one the SDK's
  // style has to arrive first — loadMapStyle syncs again once it does.
  if (self.props.mapStyle == null && !self._isMapStyleLoaded) {
    return;
  }

  const baseStyle = createBaseStyle(
    self.props.mapStyle ?? self._sdkMapStyle,
    getSourceUrl(self.props.isStaging)
  );
  const items = getSelectedCategoryItems(self.state.categoryItems);
  const geojsonStyle = buildGeojsonStyle(baseStyle, items);

  if (!geojsonStyle || geojsonStyle === self._appliedGeojsonStyle) {
    return;
  }

  self._appliedGeojsonStyle = geojsonStyle;
  self._runCommand('setMapStyle', [geojsonStyle]);
}

/**
 * Wires the layer-drawer handlers onto the component: loading the category
 * config, the checkbox and group toggles, opening and closing the drawer, and
 * pushing the resulting selection to the map's style. Plain functions over the
 * component rather than methods on it, so the drawer reads in one file.
 */
function attachLayerHandlers(self) {
  // The style last pushed to the map, so an unchanged selection does not
  // push it again.
  self._appliedGeojsonStyle = null;
  self._categoryRequestId = 0;
  // The SDK's own style, and whether the read has finished.
  self._sdkMapStyle = null;
  self._isMapStyleLoaded = false;
  self._isMapStyleLoading = false;
  self._mapStyleAttempts = 0;
  self._mapStyleRetryTimer = null;
  self._cancelMapStyleRetry = () => cancelMapStyleRetry(self);
  self._loadMapStyle = () => loadMapStyle(self);
  self._loadCategoryItems = () => loadCategoryItems(self);
  self._toggleItem = (targetKey, targetIndex) =>
    toggleItem(self, targetKey, targetIndex);
  self._toggleGroup = (groupKey) => toggleGroup(self, groupKey);
  self._toggleGroupChecked = (groupKey, checkedValue) =>
    toggleGroupChecked(self, groupKey, checkedValue);
  self._toggleSelectorVisibility = () => toggleSelectorVisibility(self);
  self._openSelector = () => openSelector(self);
  self._closeSelector = () => closeSelector(self);
  self._snapSelectorOpen = () => snapSelectorOpen(self);
  self._syncGeojsonStyle = () => syncGeojsonStyle(self);
}

export { attachLayerHandlers };
