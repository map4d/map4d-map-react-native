import { Keyboard } from 'react-native';
import {
  SHEET_FULL_SNAP_RATIO,
  SHEET_HALF_SNAP_RATIO,
  SHEET_MARKER_ID,
  ZONE_HIGHLIGHT_Z_INDEX,
} from '../sheet/constants';
import { SHEET_MARKER_ICON } from '../sheet/markerIcon';
import { getRouteUrl, getSuggestUrl } from './api';
import {
  EMPTY_DIRECTIONS_EDIT,
  EMPTY_DIRECTIONS_ROUTES,
  DIRECTIONS_ACTIVE_OUTLINE_COLOR,
  DIRECTIONS_ACTIVE_OUTLINE_WIDTH,
  DIRECTIONS_ACTIVE_STROKE_COLOR,
  DIRECTIONS_ACTIVE_STROKE_WIDTH,
  DIRECTIONS_DESTINATION_LABEL,
  DIRECTIONS_DESTINATION_POI_COLOR,
  DIRECTIONS_EMPTY_TEXT,
  DIRECTIONS_ENDPOINT_ORIGIN,
  DIRECTIONS_INACTIVE_OUTLINE_COLOR,
  DIRECTIONS_INACTIVE_OUTLINE_WIDTH,
  DIRECTIONS_INACTIVE_STROKE_COLOR,
  DIRECTIONS_INACTIVE_STROKE_WIDTH,
  DIRECTIONS_LOADING_TEXT,
  DIRECTIONS_MY_LOCATION_TEXT,
  DIRECTIONS_ORIGIN_POI_COLOR,
  DIRECTIONS_PICKED_POINT_TEXT,
  DIRECTIONS_PICK_ORIGIN_TEXT,
  DIRECTIONS_SUGGEST_DEBOUNCE_MS,
  DIRECTIONS_SUGGEST_MIN_LENGTH,
} from './constants';
import {
  DIRECTIONS_DESTINATION_ICON,
  DIRECTIONS_ORIGIN_ICON,
} from './poiIcons';
import { resolveRoutes } from './route';
import { resolveSuggestions } from './suggestions';

/**
 * The destination is whatever the sheet's marker sits on: the point it was
 * opened from — the tapped spot or a picked search result, since the province
 * payload carries no coordinate of its own — or, once a zone's detail has
 * arrived, that zone's own pin. It is kept outside state because it survives
 * sheet reloads.
 */
async function startDirections(self) {
  if (!self._sheetPin) {
    return;
  }

  const destination = {
    coordinate: self._sheetPin,
    label: self.state.sheetInfo?.name ?? DIRECTIONS_DESTINATION_LABEL,
  };
  const deviceCoordinate = await self._getDeviceCoordinate();
  const origin = deviceCoordinate
    ? { coordinate: deviceCoordinate, label: DIRECTIONS_MY_LOCATION_TEXT }
    : null;

  // The renderer marks both ends of the route itself, so the sheet's own
  // marker would just sit on top of the destination POI.
  self._removeMarker(SHEET_MARKER_ID);

  // Without a fix there is nothing to route from yet, so the panel opens on
  // the endpoints alone and the map supplies the missing one.
  self.setState({
    isDirectionsVisible: true,
    directionsOrigin: origin,
    directionsDestination: destination,
    ...EMPTY_DIRECTIONS_ROUTES,
    isDirectionsLoading: origin != null,
    directionsStatusText: origin
      ? DIRECTIONS_LOADING_TEXT
      : DIRECTIONS_PICK_ORIGIN_TEXT,
    pickingEndpoint: origin ? null : DIRECTIONS_ENDPOINT_ORIGIN,
  });

  if (origin) {
    self._loadRoute(origin, destination, self.state.directionsMode);
    return;
  }

  // Same reason as _pickDirectionsEndpoint: the map has to be reachable for
  // the tap that supplies the missing point.
  self._snapSheetTo(SHEET_HALF_SNAP_RATIO);
}

/**
 * Collapsing is not cosmetic here: a fully open sheet covers the whole map,
 * leaving nowhere to tap for the point being picked — and the prompt banner
 * would sit over the sheet's own header, so there would be no way back
 * either.
 */
function pickDirectionsEndpoint(self, endpoint) {
  // The map is the other way of naming this end, so whatever was being typed
  // into the field is done with — and its keyboard is in the way of the map.
  Keyboard.dismiss();
  self._cancelPendingSuggest();
  self._suggestRequestId += 1;

  self.setState({
    ...EMPTY_DIRECTIONS_EDIT,
    pickingEndpoint: endpoint,
  });
  self._snapSheetTo(SHEET_HALF_SNAP_RATIO);
}

function cancelPendingSuggest(self) {
  if (self._suggestDebounceTimer != null) {
    clearTimeout(self._suggestDebounceTimer);
    self._suggestDebounceTimer = null;
  }
}

/**
 * Typing in one of the endpoint fields. Same shape as the map's own search
 * box: a pause before asking, and every keystroke invalidating whatever is
 * already in flight, so a slow answer for an earlier prefix cannot land on a
 * later one.
 */
function onDirectionsQueryChange(self, endpoint, text) {
  self._cancelPendingSuggest();
  self._suggestRequestId += 1;

  const trimmed = text.trim();
  const canSuggest = trimmed.length >= DIRECTIONS_SUGGEST_MIN_LENGTH;

  self.setState({
    directionsEditingEndpoint: endpoint,
    directionsQuery: text,
    isDirectionsSuggestLoading: canSuggest,
    // Keeping the old rows under a query too short to ask about would leave
    // them looking like an answer to it.
    directionsSuggestions: canSuggest ? self.state.directionsSuggestions : [],
    pickingEndpoint: null,
  });

  if (!canSuggest) {
    return;
  }

  self._suggestDebounceTimer = setTimeout(() => {
    self._suggestDebounceTimer = null;
    self._loadDirectionsSuggestions(trimmed);
  }, DIRECTIONS_SUGGEST_DEBOUNCE_MS);
}

/**
 * A field taking focus starts from an empty query rather than from what the
 * row shows: the label an endpoint carries — "Vị trí của bạn", the name of a
 * zone — is not something the suggest service could be asked for.
 */
function onDirectionsEndpointFocus(self, endpoint) {
  if (self.state.directionsEditingEndpoint === endpoint) {
    return;
  }

  self._cancelPendingSuggest();
  self._suggestRequestId += 1;

  self.setState({
    ...EMPTY_DIRECTIONS_EDIT,
    directionsEditingEndpoint: endpoint,
    pickingEndpoint: null,
  });

  // The list needs the room, and the keyboard is about to take the bottom
  // half of the screen.
  self._snapSheetTo(SHEET_FULL_SNAP_RATIO);
}

function stopEditingDirectionsEndpoint(self) {
  self._cancelPendingSuggest();
  self._suggestRequestId += 1;
  self.setState(EMPTY_DIRECTIONS_EDIT);
}

/**
 * A picked suggestion carries its own coordinate, so it sets its end of the
 * route the same way a tap on the map does — and keeps its name, which is
 * more use on the row than "Điểm bạn đã chọn".
 */
function onSelectDirectionsSuggestion(self, item) {
  const endpoint = self.state.directionsEditingEndpoint;

  if (endpoint == null || !item?.coordinate) {
    return;
  }

  Keyboard.dismiss();
  self._stopEditingDirectionsEndpoint();
  self._setDirectionsEndpoint(endpoint, item.coordinate, item.name);
}

async function loadDirectionsSuggestions(self, text) {
  const requestId = self._suggestRequestId + 1;
  self._suggestRequestId = requestId;

  const isCurrentRequest = () =>
    self._isMounted && requestId === self._suggestRequestId;

  try {
    const response = await fetch(
      getSuggestUrl(self.props.isStaging, text, self._cameraCenter)
    );
    if (!response.ok) {
      throw new Error(`Failed to suggest places: ${response.status}`);
    }

    const json = await response.json();
    if (!isCurrentRequest()) {
      return;
    }

    self.setState({
      directionsSuggestions: resolveSuggestions(json),
      isDirectionsSuggestLoading: false,
    });
  } catch (error) {
    if (!isCurrentRequest()) {
      return;
    }

    self._reportApiError('Cannot suggest places', error);
    self.setState({
      directionsSuggestions: [],
      isDirectionsSuggestLoading: false,
    });
  }
}

/**
 * Replaces one end of the route and keeps the other, then re-routes once both
 * ends are known. Reading the next pair here rather than from state avoids
 * routing against the value `setState` has not applied yet.
 */
function setDirectionsEndpoint(self, endpoint, coordinate, label) {
  const picked = { coordinate, label: label ?? DIRECTIONS_PICKED_POINT_TEXT };
  const isOrigin = endpoint === DIRECTIONS_ENDPOINT_ORIGIN;
  const origin = isOrigin ? picked : self.state.directionsOrigin;
  const destination = isOrigin ? self.state.directionsDestination : picked;

  self.setState({
    directionsOrigin: origin,
    directionsDestination: destination,
    pickingEndpoint: null,
  });

  if (origin && destination) {
    self._loadRoute(origin, destination, self.state.directionsMode);
  }
}

/**
 * Turns the route around. Only reachable with both ends known: with one of
 * them still missing there is nothing to trade places with, and the swap
 * would just move the single point to the other slot.
 */
function swapDirectionsEndpoints(self) {
  const origin = self.state.directionsDestination;
  const destination = self.state.directionsOrigin;

  if (!origin || !destination) {
    return;
  }

  self.setState({
    directionsOrigin: origin,
    directionsDestination: destination,
  });
  self._loadRoute(origin, destination, self.state.directionsMode);
}

/**
 * Each mode is a route of its own — a motorbike and a car are not given the
 * same streets — so picking one asks the service again rather than re-reading
 * what is already drawn. The mode is passed on rather than read back off
 * state, which `setState` has not applied yet.
 */
function changeDirectionsMode(self, mode) {
  if (mode === self.state.directionsMode) {
    return;
  }

  self.setState({ directionsMode: mode });

  const origin = self.state.directionsOrigin;
  const destination = self.state.directionsDestination;

  if (origin && destination) {
    self._loadRoute(origin, destination, mode);
  }
}

async function getDeviceCoordinate(self) {
  try {
    const location = await self.getMyLocation();
    const coordinate = location?.coordinate;

    return typeof coordinate?.latitude === 'number' &&
      typeof coordinate?.longitude === 'number'
      ? coordinate
      : null;
  } catch (error) {
    // Permission denied or my-location not enabled: not an error worth
    // reporting, the caller falls back to picking a point.
    return null;
  }
}

function cancelPickOrigin(self) {
  self.setState({ pickingEndpoint: null });
}

function closeDirections(self) {
  self._routeRequestId += 1;
  self._cancelPendingSuggest();
  self._suggestRequestId += 1;
  self._clearDirections();

  // Back on the detail view the sheet owns the map again, so its marker comes
  // back to the point the info belongs to.
  if (self._sheetPin) {
    self._addMarker({
      id: SHEET_MARKER_ID,
      coordinate: self._sheetPin,
      icon: SHEET_MARKER_ICON,
      anchor: { x: 0.5, y: 1.0 },
      zIndex: ZONE_HIGHLIGHT_Z_INDEX,
    });
  }

  self.setState({
    isDirectionsVisible: false,
    ...EMPTY_DIRECTIONS_ROUTES,
    directionsOrigin: null,
    directionsDestination: null,
    pickingEndpoint: null,
    ...EMPTY_DIRECTIONS_EDIT,
  });
}

async function loadRoute(self, origin, destination, mode) {
  const url = getRouteUrl(
    self.props.isStaging,
    origin?.coordinate,
    destination?.coordinate,
    mode
  );
  if (!url) {
    return;
  }

  const requestId = self._routeRequestId + 1;
  self._routeRequestId = requestId;

  self.setState({
    pickingEndpoint: null,
    isDirectionsVisible: true,
    isDirectionsLoading: true,
    ...EMPTY_DIRECTIONS_ROUTES,
    directionsStatusText: DIRECTIONS_LOADING_TEXT,
  });

  const isCurrentRequest = () =>
    self._isMounted && requestId === self._routeRequestId;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch route: ${response.status}`);
    }

    // The renderer decodes the payload natively, so the untouched response
    // text is what gets handed to it — no polyline decoding in JS.
    const text = await response.text();
    const routes = resolveRoutes(JSON.parse(text));

    if (!isCurrentRequest()) {
      return;
    }

    const route = routes[0];

    if (route) {
      self._setDirections(text, {
        activedIndex: route.index,
        activeStrokeColor: DIRECTIONS_ACTIVE_STROKE_COLOR,
        activeStrokeWidth: DIRECTIONS_ACTIVE_STROKE_WIDTH,
        activeOutlineColor: DIRECTIONS_ACTIVE_OUTLINE_COLOR,
        activeOutlineWidth: DIRECTIONS_ACTIVE_OUTLINE_WIDTH,
        inactiveStrokeColor: DIRECTIONS_INACTIVE_STROKE_COLOR,
        inactiveStrokeWidth: DIRECTIONS_INACTIVE_STROKE_WIDTH,
        inactiveOutlineColor: DIRECTIONS_INACTIVE_OUTLINE_COLOR,
        inactiveOutlineWidth: DIRECTIONS_INACTIVE_OUTLINE_WIDTH,
        onPress: self._onDirectionsRoutePress,
        originPOIOptions: {
          coordinate: origin.coordinate,
          icon: { uri: DIRECTIONS_ORIGIN_ICON },
          title: origin.label,
          titleColor: DIRECTIONS_ORIGIN_POI_COLOR,
          visible: true,
        },
        destinationPOIOptions: {
          coordinate: destination.coordinate,
          icon: { uri: DIRECTIONS_DESTINATION_ICON },
          title: destination.label,
          titleColor: DIRECTIONS_DESTINATION_POI_COLOR,
          visible: true,
        },
      });
      self._fitCameraToBounds(route.bounds);
    }

    self.setState({
      directionsRoutes: routes,
      directionsRouteIndex: route ? route.index : null,
      directionsStatusText: DIRECTIONS_EMPTY_TEXT,
      isDirectionsLoading: false,
    });
  } catch (error) {
    if (!isCurrentRequest()) {
      return;
    }

    self._reportApiError('Cannot load route', error);
    self.setState({
      ...EMPTY_DIRECTIONS_ROUTES,
      directionsStatusText: DIRECTIONS_EMPTY_TEXT,
      isDirectionsLoading: false,
    });
  }
}

function selectDirectionsRoute(self, index) {
  if (typeof index !== 'number' || index === self.state.directionsRouteIndex) {
    return;
  }

  const route = self.state.directionsRoutes.find(
    (item) => item.index === index
  );

  if (!route) {
    return;
  }

  self.setState({ directionsRouteIndex: index });
  self._setDirectionsActiveIndex(index);
}

// The renderer reports the tap but keeps drawing the route it was told to,
// so the active one is switched from here.
function onDirectionsRoutePress(self, event) {
  // A tap meant for the point being picked is not a tap on the route it
  // happened to land on.
  if (self.state.pickingEndpoint != null) {
    return;
  }

  selectDirectionsRoute(self, event?.nativeEvent?.routeIndex);
}

/**
 * Wires the directions handlers onto the component. They are plain functions
 * over the component rather than methods on it so that the panel's whole flow
 * — picking an end, typing one, routing between them — reads in one file
 * instead of as a seam through a class that also owns the map and the sheet.
 */
function attachDirectionsHandlers(self) {
  self._suggestRequestId = 0;
  self._suggestDebounceTimer = null;
  self._startDirections = () => startDirections(self);
  self._pickDirectionsEndpoint = (endpoint) =>
    pickDirectionsEndpoint(self, endpoint);
  self._cancelPendingSuggest = () => cancelPendingSuggest(self);
  self._onDirectionsQueryChange = (endpoint, text) =>
    onDirectionsQueryChange(self, endpoint, text);
  self._onDirectionsEndpointFocus = (endpoint) =>
    onDirectionsEndpointFocus(self, endpoint);
  self._stopEditingDirectionsEndpoint = () =>
    stopEditingDirectionsEndpoint(self);
  self._onSelectDirectionsSuggestion = (item) =>
    onSelectDirectionsSuggestion(self, item);
  self._loadDirectionsSuggestions = (text) =>
    loadDirectionsSuggestions(self, text);
  self._setDirectionsEndpoint = (endpoint, coordinate, label) =>
    setDirectionsEndpoint(self, endpoint, coordinate, label);
  self._swapDirectionsEndpoints = () => swapDirectionsEndpoints(self);
  self._changeDirectionsMode = (mode) => changeDirectionsMode(self, mode);
  self._getDeviceCoordinate = () => getDeviceCoordinate(self);
  self._cancelPickOrigin = () => cancelPickOrigin(self);
  self._closeDirections = () => closeDirections(self);
  self._loadRoute = (origin, destination, mode) =>
    loadRoute(self, origin, destination, mode);
  self._selectDirectionsRoute = (index) => selectDirectionsRoute(self, index);
  self._onDirectionsRoutePress = (event) => onDirectionsRoutePress(self, event);
}

export { attachDirectionsHandlers };
