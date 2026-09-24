import { Keyboard } from 'react-native';
import { fetchJson } from '../shared/api';
import { ADVANCED_DEPENDENTS, EMPTY_ADVANCED_FILTERS } from './constants';
import {
  getAdvancedInfraSearchUrl,
  getAdvancedZoneSearchUrl,
  getInfraLayerOptionsUrl,
  getInfraTypeOptionsUrl,
  getProvinceOptionsUrl,
  getWardOptionsUrl,
  getZoneFormTypeOptionsUrl,
  getZoneTypeOptionsUrl,
} from './api';
import { ADVANCED_TARGET_ZONE } from './constants';
import {
  resolveInfraResults,
  resolveListOptions,
  resolveMapOptions,
  resolveZoneResults,
} from './results';

function openAdvancedSearch(self) {
  self.setState({ isAdvancedSearchVisible: true });
  self._loadAdvancedOptions();
}

function closeAdvancedSearch(self) {
  self.setState({ isAdvancedSearchVisible: false });
}

/**
 * The dictionaries behind the filters never change within a session, so they
 * are fetched once, the first time the screen is opened. A dictionary that
 * fails leaves its filter with an empty list rather than blocking the rest.
 */
async function loadAdvancedOptions(self) {
  if (self._hasAdvancedOptions) {
    return;
  }

  self._hasAdvancedOptions = true;
  const isStaging = self.props.isStaging;
  const sources = [
    ['zoneTypes', getZoneTypeOptionsUrl(isStaging), resolveListOptions],
    ['infraTypes', getInfraTypeOptionsUrl(isStaging), resolveListOptions],
    ['infraLayers', getInfraLayerOptionsUrl(isStaging), resolveListOptions],
    ['provinces', getProvinceOptionsUrl(isStaging), resolveMapOptions],
  ];

  const loaded = await Promise.all(
    sources.map(async ([name, url, resolve]) => {
      try {
        return [name, resolve(await fetchJson(url))];
      } catch (error) {
        self._reportApiError(`Cannot load ${name} options`, error);
        return [name, []];
      }
    })
  );

  if (!self._isMounted) {
    return;
  }

  self.setState((prevState) => ({
    advancedOptions: {
      ...prevState.advancedOptions,
      ...Object.fromEntries(loaded),
    },
  }));
}

/**
 * The two dependent lists. Each belongs to whatever its parent filter is set
 * to, so it is refetched whenever that moves, and a reply that arrives after
 * the parent has moved again is dropped rather than shown against the wrong
 * one.
 */
async function loadDependentOptions(
  self,
  name,
  parentName,
  parentValue,
  url,
  resolve
) {
  if (!Number.isFinite(parentValue)) {
    return;
  }

  try {
    const json = await fetchJson(url);

    if (
      !self._isMounted ||
      self.state.advancedFilters[parentName] !== parentValue
    ) {
      return;
    }

    self.setState((prevState) => ({
      advancedOptions: {
        ...prevState.advancedOptions,
        [name]: resolve(json),
      },
    }));
  } catch (error) {
    self._reportApiError(`Cannot load ${name} options`, error);
  }
}

function loadWardOptions(self, provinceId) {
  return self._loadDependentOptions(
    'wards',
    'provinceId',
    provinceId,
    getWardOptionsUrl(self.props.isStaging, provinceId),
    resolveMapOptions
  );
}

function loadFormTypeOptions(self, zoneTypeId) {
  return self._loadDependentOptions(
    'formTypes',
    'zoneTypeId',
    zoneTypeId,
    getZoneFormTypeOptionsUrl(self.props.isStaging, zoneTypeId),
    resolveListOptions
  );
}

// Results belong to the target they were asked for, so switching drops them.
function changeAdvancedTarget(self, target) {
  self.setState({ advancedTarget: target, advancedResults: null });
  self._advancedRequestId += 1;
  self._advancedScrollOffset = 0;
}

function onAdvancedScrollOffsetChange(self, offsetY) {
  self._advancedScrollOffset = offsetY;
}

function changeAdvancedFilter(self, name, value) {
  const dependent = ADVANCED_DEPENDENTS[name];

  self.setState((prevState) => {
    const advancedFilters = { ...prevState.advancedFilters, [name]: value };

    // A ward only means anything inside its province, and a form type only
    // inside its zone type — both are dropped when their parent moves.
    if (dependent) {
      advancedFilters[dependent.child] = null;
    }

    return {
      advancedFilters,
      advancedOptions: dependent
        ? { ...prevState.advancedOptions, [dependent.options]: [] }
        : prevState.advancedOptions,
    };
  });

  if (dependent) {
    self[dependent.load](value);
  }
}

function resetAdvancedFilters(self) {
  self._advancedRequestId += 1;
  self._advancedScrollOffset = 0;
  self.setState((prevState) => ({
    advancedFilters: EMPTY_ADVANCED_FILTERS,
    advancedOptions: {
      ...prevState.advancedOptions,
      wards: [],
      formTypes: [],
    },
    advancedResults: null,
  }));
}

function runAdvancedSearch(self) {
  Keyboard.dismiss();
  self._advancedScrollOffset = 0;
  self._loadAdvancedPage(1);
}

function loadMoreAdvancedResults(self) {
  const results = self.state.advancedResults;
  if (!results?.hasMore) {
    return;
  }

  self._loadAdvancedPage(results.page + 1);
}

/**
 * One page of results. Page 1 replaces whatever was showing; later pages are
 * appended, so a scroll to the bottom grows the list rather than reloading it.
 */
async function loadAdvancedPage(self, page) {
  const requestId = self._advancedRequestId + 1;
  self._advancedRequestId = requestId;
  const isFirstPage = page <= 1;
  const isZone = self.state.advancedTarget === ADVANCED_TARGET_ZONE;
  const filters = self.state.advancedFilters;
  const url = isZone
    ? getAdvancedZoneSearchUrl(self.props.isStaging, filters, page)
    : getAdvancedInfraSearchUrl(self.props.isStaging, filters, page);

  self.setState({
    isAdvancedLoading: isFirstPage,
    isAdvancedLoadingMore: !isFirstPage,
    advancedResults: isFirstPage ? null : self.state.advancedResults,
  });

  try {
    const json = await fetchJson(url);
    const resolved = isZone
      ? resolveZoneResults(json, page)
      : resolveInfraResults(json, page);

    if (!self._isMounted || self._advancedRequestId !== requestId) {
      return;
    }

    self.setState((prevState) => ({
      isAdvancedLoading: false,
      isAdvancedLoadingMore: false,
      advancedResults: {
        ...resolved,
        items: isFirstPage
          ? resolved.items
          : [...(prevState.advancedResults?.items ?? []), ...resolved.items],
      },
    }));
  } catch (error) {
    if (!self._isMounted || self._advancedRequestId !== requestId) {
      return;
    }

    self._reportApiError('Cannot run advanced search', error);
    self.setState((prevState) => ({
      isAdvancedLoading: false,
      isAdvancedLoadingMore: false,
      advancedResults: isFirstPage
        ? { items: [], total: 0, page, hasMore: false, failed: true }
        : prevState.advancedResults,
    }));
  }
}

/**
 * Either hit opens the sheet on its own detail — the zone one a tap on the
 * map would open, or the connectivity one, which only this search reaches.
 */
function onSelectAdvancedResult(self, item) {
  self._closeAdvancedSearch();
  self._prepareSheetForTap(item.pin?.latitude, item.pin?.longitude);
  self._sheetOpenedFromAdvancedSearch = true;

  if (self.state.advancedTarget === ADVANCED_TARGET_ZONE) {
    self._loadZoneInfo(item.id);
    return;
  }

  self._loadInfraInfo(item.id);
}

/**
 * Wires the advanced-search handlers onto the component: opening the screen,
 * loading the option lists each filter draws from, and paging the results.
 * They are plain functions over the component rather than methods on it, so
 * that this screen's flow reads on its own instead of threaded through a class
 * that also owns the map, the sheet and the directions panel.
 */
function attachAdvancedSearchHandlers(self) {
  self._advancedRequestId = 0;
  // The option lists are the same for every search, so they are fetched
  // the first time the screen opens and not again.
  self._hasAdvancedOptions = false;
  self._openAdvancedSearch = () => openAdvancedSearch(self);
  self._closeAdvancedSearch = () => closeAdvancedSearch(self);
  self._loadAdvancedOptions = () => loadAdvancedOptions(self);
  self._loadDependentOptions = (name, parentName, parentValue, url, resolve) =>
    loadDependentOptions(self, name, parentName, parentValue, url, resolve);
  self._loadWardOptions = (provinceId) => loadWardOptions(self, provinceId);
  self._loadFormTypeOptions = (zoneTypeId) =>
    loadFormTypeOptions(self, zoneTypeId);
  self._changeAdvancedTarget = (target) => changeAdvancedTarget(self, target);
  self._onAdvancedScrollOffsetChange = (offsetY) =>
    onAdvancedScrollOffsetChange(self, offsetY);
  self._changeAdvancedFilter = (name, value) =>
    changeAdvancedFilter(self, name, value);
  self._resetAdvancedFilters = () => resetAdvancedFilters(self);
  self._runAdvancedSearch = () => runAdvancedSearch(self);
  self._loadMoreAdvancedResults = () => loadMoreAdvancedResults(self);
  self._loadAdvancedPage = (page) => loadAdvancedPage(self, page);
  self._onSelectAdvancedResult = (item) => onSelectAdvancedResult(self, item);
}

export { attachAdvancedSearchHandlers };
