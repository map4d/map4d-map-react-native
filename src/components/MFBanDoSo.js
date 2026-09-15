import React from 'react';
import { Animated, Dimensions, Easing, Keyboard, View } from 'react-native';
import {
  DIRECTIONS_ACTION_LABEL,
  DIRECTIONS_DEFAULT_MODE,
  DIRECTIONS_ENDPOINT_ORIGIN,
  DIRECTIONS_LOADING_TEXT,
  DIRECTIONS_PICK_DESTINATION_TEXT,
  DIRECTIONS_PICK_ORIGIN_TEXT,
  EMPTY_DIRECTIONS_EDIT,
  PickOriginBanner,
} from './MFBanDoSo/directions';
import { attachDirectionsHandlers } from './MFBanDoSo/directions/handlers';
import {
  ADVANCED_TARGET_ZONE,
  AdvancedSearchButton,
  AdvancedSearchView,
  EMPTY_ADVANCED_FILTERS,
  EMPTY_ADVANCED_OPTIONS,
} from './MFBanDoSo/advancedSearch';
import { attachAdvancedSearchHandlers } from './MFBanDoSo/advancedSearch/handlers';
import { CompassButton } from './MFBanDoSo/controls';
import {
  LayerButton,
  SELECTOR_TITLE,
  SelectorDrawer,
  createCategoryGroupSections,
  createSelectedCategoryItemsSignature,
} from './MFBanDoSo/layers';
import { attachLayerHandlers } from './MFBanDoSo/layers/handlers';
import { LEGEND_TITLE, LegendButton, LegendDrawer } from './MFBanDoSo/legend';
import { attachLegendHandlers } from './MFBanDoSo/legend/handlers';
import { banDoSoPropTypes } from './MFBanDoSo/propTypes';
import { SearchBox } from './MFBanDoSo/search';
import { attachSearchHandlers } from './MFBanDoSo/search/handlers';
import { fetchJson } from './MFBanDoSo/shared/api';
import { DRAWER_TRANSLATE_X } from './MFBanDoSo/shared/constants';
import { sharedStyles } from './MFBanDoSo/shared/styles';
import {
  InvestmentSheet,
  SHEET_CLOSE_DURATION_MS,
  SHEET_EMPTY_TEXT,
  SHEET_FOCUS_PADDING,
  SHEET_HALF_SNAP_RATIO,
  SHEET_INITIAL_SNAP_RATIO,
  INFRA_FOCUS_DELTA,
  SHEET_INFRA_EMPTY_TEXT,
  SHEET_INFRA_LOADING_TEXT,
  SHEET_INFRA_TITLE,
  SHEET_KIND_INFRA,
  SHEET_KIND_ZONE,
  SHEET_LOADING_TEXT,
  SHEET_MARKER_ID,
  SHEET_OPEN_DURATION_MS,
  SHEET_TITLE,
  SHEET_ZONE_EMPTY_TEXT,
  SHEET_ZONE_LOADING_TEXT,
  SHEET_ZONE_TITLE,
  ZONE_HIGHLIGHT_FILL_COLOR,
  ZONE_HIGHLIGHT_STROKE_COLOR,
  ZONE_HIGHLIGHT_STROKE_WIDTH,
  ZONE_HIGHLIGHT_Z_INDEX,
  ZONE_POLYGON_ID_PREFIX,
  ZONE_PROJECTS_LOADING_TEXT,
  ZONE_PROJECT_KINDS,
  getInfraDetailUrl,
  getProvinceInvestmentInfoUrl,
  getZoneDetailUrl,
  getZoneProjectsUrl,
  resolveInfraDetailInfo,
  resolveProvinceInvestmentInfo,
  resolveZoneDetailInfo,
  resolveZoneFeatureId,
  resolveZoneProjects,
} from './MFBanDoSo/sheet';
import {
  areaGeometryToPolygonPaths,
  getViewboxFromGeometry,
} from './extends/area/AreaFocusGeometryUtils';
import { MFMapView } from './MFMapView';

const SHEET_KIND_PROVINCE = 'province';
// Handed to the drawer on the renders that skip the grouping work.
const EMPTY_GROUP_SECTIONS = [];

// A tap that hit a data source feature suppresses the plain map press that may
// follow it for the same tap.
const SHEET_FEATURE_PRESS_CLAIM_MS = 400;

class MFBanDoSo extends MFMapView {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this._sheetRequestId = 0;
    this._hasFocusedFromSheet = false;
    // Set only by picking a result out of advanced search, so closing the
    // sheet knows to reopen that screen rather than just dropping to the map
    // — a tap on the map itself never sets it, and never returns to it.
    this._sheetOpenedFromAdvancedSearch = false;
    this._sheetPanelHeight = 0;
    this._featurePressAt = 0;
    this._zonePolygonIds = [];
    this._zoneProjectsRequestId = 0;
    this._routeRequestId = 0;
    // Where the map is looking, kept off state: it only biases the place
    // suggestions, and re-rendering on every frame of a pan to follow it would
    // be absurd.
    this._cameraCenter = null;
    // The results list's scroll offset, kept outside state since redrawing on
    // every scroll tick would be wasteful — read back only once, to restore
    // the list where it was when its screen is reopened after a detail visit.
    this._advancedScrollOffset = 0;
    this._sheetPin = null;
    this._selectorAnim = new Animated.Value(0);
    this._legendAnim = new Animated.Value(0);
    this._sheetAnim = new Animated.Value(0);
    // Same values, same ranges, every render — so the interpolations are built
    // here once instead of as four fresh nodes on every state change.
    this._selectorBackdropStyle = {
      opacity: this._selectorAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
    };
    this._selectorPanelStyle = {
      transform: [
        {
          translateX: this._selectorAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [DRAWER_TRANSLATE_X, 0],
          }),
        },
      ],
    };
    // The legend rides its own value so the two drawers animate independently.
    this._legendBackdropStyle = {
      opacity: this._legendAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
    };
    this._legendPanelStyle = {
      transform: [
        {
          translateX: this._legendAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [DRAWER_TRANSLATE_X, 0],
          }),
        },
      ],
    };
    this.state = {
      ...this.state,
      categoryItems: [],
      expandedGroupKeys: {},
      groupTitleByKey: {},
      groupOrderedKeys: [],
      legendSections: [],
      isLegendVisible: false,
      isLegendMounted: false,
      isSelectorVisible: false,
      isSelectorMounted: false,
      sheetInfo: null,
      sheetKind: SHEET_KIND_PROVINCE,
      sheetStatusText: SHEET_LOADING_TEXT,
      isSheetLoading: false,
      isSheetMounted: false,
      sheetSnapValue: SHEET_INITIAL_SNAP_RATIO,
      projectsKind: null,
      zoneProjects: [],
      zoneProjectsStatusText: ZONE_PROJECTS_LOADING_TEXT,
      isZoneProjectsLoading: false,
      searchKeyword: '',
      searchSections: [],
      isSearchLoading: false,
      isSearchOpen: false,
      isDirectionsVisible: false,
      isDirectionsLoading: false,
      directionsRoute: null,
      directionsStatusText: DIRECTIONS_LOADING_TEXT,
      directionsOrigin: null,
      directionsDestination: null,
      // Kept across openings of the panel: the mode says how the user travels,
      // which is not something about the place being routed to.
      directionsMode: DIRECTIONS_DEFAULT_MODE,
      ...EMPTY_DIRECTIONS_EDIT,
      pickingEndpoint: null,
      mapBearing: 0,
      isAdvancedSearchVisible: false,
      advancedTarget: ADVANCED_TARGET_ZONE,
      advancedFilters: EMPTY_ADVANCED_FILTERS,
      advancedOptions: EMPTY_ADVANCED_OPTIONS,
      advancedResults: null,
      isAdvancedLoading: false,
      isAdvancedLoadingMore: false,
    };

    this._closeSheet = this._closeSheet.bind(this);
    this._focusProvinceFromSheet = this._focusProvinceFromSheet.bind(this);
    this._onSheetPanelHeightChange = this._onSheetPanelHeightChange.bind(this);
    this._openZoneProjects = this._openZoneProjects.bind(this);
    this._closeZoneProjects = this._closeZoneProjects.bind(this);
    this._snapSheetTo = this._snapSheetTo.bind(this);
    this._resetBearing = this._resetBearing.bind(this);

    // Each feature's handlers live with that feature and are wired on here.
    // What stays a method above is what the map itself owns: the sheet it
    // opens, and the two overlays that answer to nothing else.
    attachSearchHandlers(this);
    attachDirectionsHandlers(this);
    attachLayerHandlers(this);
    attachLegendHandlers(this);
    attachAdvancedSearchHandlers(this);
  }

  componentDidMount() {
    this._isMounted = true;
    this._loadCategoryItems();
    this._loadLegendItems();
    this._syncGeojsonStyle();
  }

  componentDidUpdate(prevProps, prevState) {
    const mapReadyChanged = prevState.isReady !== this.state.isReady;
    const mapStyleChanged = prevProps.mapStyle !== this.props.mapStyle;
    const isStagingChanged = prevProps.isStaging !== this.props.isStaging;

    if (mapReadyChanged && this.state.isReady) {
      // The map's own style is what the layers get spliced into, so it is read
      // before the first sync writes over it.
      this._loadMapStyle();
    }

    if (isStagingChanged) {
      this._loadCategoryItems();
      this._loadLegendItems();
    }

    // The same array cannot hold a different selection, and the array is only
    // ever replaced wholesale — so the reference check spares two passes over
    // the items on every unrelated update. The signature still decides the
    // rest: a toggle and its undo make a new array but no new selection.
    const itemsChanged =
      prevState.categoryItems !== this.state.categoryItems &&
      createSelectedCategoryItemsSignature(prevState.categoryItems) !==
        createSelectedCategoryItemsSignature(this.state.categoryItems);

    if (
      mapReadyChanged ||
      mapStyleChanged ||
      isStagingChanged ||
      itemsChanged
    ) {
      this._syncGeojsonStyle();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    this._cancelPendingSearch();
    this._cancelPendingSuggest();
    this._cancelMapStyleRetry();
  }

  async _loadInfraInfo(infraId) {
    const isCurrentRequest = this._beginSheetRequest(
      SHEET_KIND_INFRA,
      SHEET_INFRA_LOADING_TEXT
    );

    try {
      const json = await fetchJson(
        getInfraDetailUrl(this.props.isStaging, infraId)
      );
      const info = resolveInfraDetailInfo(json);

      if (isCurrentRequest() && info?.pin) {
        // The detail's own point wins over whatever the result carried, the
        // same way a zone's pin replaces the point that opened its sheet.
        this._sheetPin = info.pin;
        this._addMarker({ id: SHEET_MARKER_ID, coordinate: info.pin });
        this._fitCameraToInfra(info.pin);
      }

      this._resolveSheetResult(isCurrentRequest, info, SHEET_INFRA_EMPTY_TEXT);
    } catch (error) {
      if (!isCurrentRequest()) {
        return;
      }

      console.warn('Cannot load infrastructure detail', error);
      this._resolveSheetResult(isCurrentRequest, null, SHEET_INFRA_EMPTY_TEXT);
    }
  }

  /**
   * A point has no extent to frame, so a small box is put around it and fitted
   * like any other — which is what keeps it clear of the sheet.
   */
  _fitCameraToInfra(pin) {
    this._fitCameraToBounds({
      minLat: pin.latitude - INFRA_FOCUS_DELTA,
      minLng: pin.longitude - INFRA_FOCUS_DELTA,
      maxLat: pin.latitude + INFRA_FOCUS_DELTA,
      maxLng: pin.longitude + INFRA_FOCUS_DELTA,
    });
  }

  _onPress(event) {
    super._onPress(event);

    // While suggestions are up, a tap on the map is a dismissal — the same way
    // it reads in any search UI — rather than a request for a new sheet.
    if (this.state.isSearchOpen) {
      this._closeSearchResults();
      return;
    }

    // A tap on a zone can reach the SDK's plain map-click listener as well as
    // its feature-click listener. The feature press is the more specific of the
    // two, so once it has claimed a tap the map press for it is ignored.
    if (Date.now() - this._featurePressAt < SHEET_FEATURE_PRESS_CLAIM_MS) {
      return;
    }

    const location = event?.nativeEvent?.location;
    const latitude = location?.latitude;
    const longitude = location?.longitude;

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return;
    }

    // While an end of the route is being picked, a tap supplies that point
    // instead of opening a sheet for wherever was tapped.
    if (this.state.pickingEndpoint) {
      this._setDirectionsEndpoint(this.state.pickingEndpoint, {
        latitude,
        longitude,
      });
      return;
    }

    this._prepareSheetForTap(latitude, longitude);
    this._loadProvinceInfo(latitude, longitude);
  }

  _onDataSourceFeaturePress(event) {
    super._onDataSourceFeaturePress(event);

    const feature = event?.nativeEvent?.feature;
    const zoneId = resolveZoneFeatureId(feature);
    const location = feature?.location ?? event?.nativeEvent?.location;
    const latitude = location?.latitude;
    const longitude = location?.longitude;

    // Picking an end of the route wins over opening anything: a tap that landed
    // on a zone is still a tap on a place the route can run to or from.
    if (this.state.pickingEndpoint) {
      if (typeof latitude === 'number' && typeof longitude === 'number') {
        this._featurePressAt = Date.now();
        this._setDirectionsEndpoint(this.state.pickingEndpoint, {
          latitude,
          longitude,
        });
      }
      return;
    }

    if (zoneId != null) {
      this._featurePressAt = Date.now();
      this._prepareSheetForTap(latitude, longitude);
      this._loadZoneInfo(zoneId);
      return;
    }

    // The feature carries no id the detail endpoint can be called with, so fall
    // back to what a tap on bare map does. Doing nothing instead would leave
    // taps on non-zone layers dead, since the SDK may route them here rather
    // than to its plain map-click listener. The claim is only taken once there
    // is something to show, so an unusable feature press cannot swallow the map
    // press that may follow it.
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      this._featurePressAt = Date.now();
      this._prepareSheetForTap(latitude, longitude);
      this._loadProvinceInfo(latitude, longitude);
    }
  }

  /**
   * Shared setup for both tap flows: drop a stale highlight, move the marker to
   * the tapped spot and bring the sheet up before its request is started.
   */
  _prepareSheetForTap(latitude, longitude) {
    // Dismissing the keyboard before the sheet opens
    Keyboard.dismiss();

    // Reachable while the sheet is already open, since the map stays
    // interactive: drop the previous highlights so they cannot outlive the info
    // they belong to.
    if (this._hasFocusedFromSheet) {
      this._hasFocusedFromSheet = false;
      this.clearFocusedArea();
    }

    // Same reachable-while-open case as above: a tap that repurposes the
    // sheet for something new disowns wherever the previous content came
    // from, or closing it would reopen advanced search behind a detail it
    // never produced.
    this._sheetOpenedFromAdvancedSearch = false;

    this._clearZoneOverlays();

    if (typeof latitude === 'number' && typeof longitude === 'number') {
      this._sheetPin = { latitude, longitude };
      this._addMarker({
        id: SHEET_MARKER_ID,
        coordinate: this._sheetPin,
      });
    } else {
      // Nothing to point at yet — a zone picked from search, whose pin only
      // arrives with its detail. The previous target has to go all the same, or
      // the marker and the directions destination would still belong to it.
      this._sheetPin = null;
      this._removeMarker(SHEET_MARKER_ID);
    }

    this._openSheet();
  }

  /**
   * Draws the tapped zone with the geometry the detail endpoint returned, and
   * moves the marker from the point the user hit onto the zone's own pin.
   */
  _renderZoneOverlays(info) {
    this._clearZoneOverlays();

    if (!info) {
      return;
    }

    if (info.pin) {
      // The zone's own pin replaces the point the user hit as what the sheet is
      // about, so routing to it aims at the zone rather than at wherever inside
      // it the tap happened to land.
      this._sheetPin = info.pin;
      this._addMarker({
        id: SHEET_MARKER_ID,
        coordinate: info.pin,
      });
    }

    areaGeometryToPolygonPaths(info.geometry).forEach((coordinates, index) => {
      const id = `${ZONE_POLYGON_ID_PREFIX}-${index}`;

      this._addPolygon({
        id,
        coordinates,
        fillColor: ZONE_HIGHLIGHT_FILL_COLOR,
        strokeColor: ZONE_HIGHLIGHT_STROKE_COLOR,
        strokeWidth: ZONE_HIGHLIGHT_STROKE_WIDTH,
        zIndex: ZONE_HIGHLIGHT_Z_INDEX,
      });
      this._zonePolygonIds.push(id);
    });
  }

  _clearZoneOverlays() {
    this._zonePolygonIds.forEach((id) => this._removePolygon(id));
    this._zonePolygonIds = [];
  }

  /**
   * Starts a sheet request, invalidating whatever was in flight. Both sources
   * share one request id so a province tap cannot be overwritten by a zone
   * response that was already on its way, or the other way round.
   */
  _beginSheetRequest(kind, loadingText) {
    const requestId = this._sheetRequestId + 1;
    this._sheetRequestId = requestId;
    // Whatever the sheet was showing belonged to the previous target — the
    // drilled-down project list and any drawn route included.
    this._zoneProjectsRequestId += 1;
    this._routeRequestId += 1;
    this._clearDirections();

    this.setState({
      sheetKind: kind,
      sheetInfo: null,
      sheetStatusText: loadingText,
      isSheetLoading: true,
      projectsKind: null,
      zoneProjects: [],
      isDirectionsVisible: false,
      directionsRoute: null,
      ...EMPTY_DIRECTIONS_EDIT,
    });

    return () => this._isMounted && requestId === this._sheetRequestId;
  }

  _resolveSheetResult(isCurrentRequest, info, emptyText) {
    if (!isCurrentRequest()) {
      return;
    }

    this.setState({
      sheetInfo: info,
      sheetStatusText: info ? '' : emptyText,
      isSheetLoading: false,
    });
  }

  async _loadProvinceInfo(latitude, longitude, options) {
    const isCurrentRequest = this._beginSheetRequest(
      SHEET_KIND_PROVINCE,
      SHEET_LOADING_TEXT
    );

    try {
      const json = await fetchJson(
        getProvinceInvestmentInfoUrl(this.props.isStaging, latitude, longitude),
        'investment info'
      );
      const info = resolveProvinceInvestmentInfo(json);

      this._resolveSheetResult(isCurrentRequest, info, SHEET_EMPTY_TEXT);

      if (options?.highlightProvince && info && isCurrentRequest()) {
        this._focusProvince(info.focusProvince);
      }
    } catch (error) {
      if (!isCurrentRequest()) {
        return;
      }

      console.warn('Cannot load investment info', error);
      this._resolveSheetResult(isCurrentRequest, null, SHEET_EMPTY_TEXT);
    }
  }

  async _loadZoneInfo(zoneId) {
    const isCurrentRequest = this._beginSheetRequest(
      SHEET_KIND_ZONE,
      SHEET_ZONE_LOADING_TEXT
    );

    try {
      const json = await fetchJson(
        getZoneDetailUrl(this.props.isStaging, zoneId),
        'zone detail'
      );
      const info = resolveZoneDetailInfo(json);

      if (isCurrentRequest()) {
        this._renderZoneOverlays(info);
        this._fitCameraToZone(info);
      }

      this._resolveSheetResult(isCurrentRequest, info, SHEET_ZONE_EMPTY_TEXT);
    } catch (error) {
      if (!isCurrentRequest()) {
        return;
      }

      console.warn('Cannot load zone detail', error);
      this._resolveSheetResult(isCurrentRequest, null, SHEET_ZONE_EMPTY_TEXT);
    }
  }

  /**
   * A project list is a drill-down inside the same sheet: the zone detail stays
   * in state so going back needs no refetch, and the list keeps its own request
   * id so a slow list response cannot land on a different zone — or on the
   * other list, since both kinds share this one slot.
   */
  _openZoneProjects(kind) {
    const zoneId = this.state.sheetInfo?.id;
    const url = getZoneProjectsUrl(this.props.isStaging, zoneId, kind);

    if (zoneId == null || !url) {
      return;
    }

    this.setState({ projectsKind: kind });
    this._loadZoneProjects(url, kind);
  }

  _closeZoneProjects() {
    this._zoneProjectsRequestId += 1;
    this.setState({ projectsKind: null });
  }

  async _loadZoneProjects(url, kind) {
    const requestId = this._zoneProjectsRequestId + 1;
    this._zoneProjectsRequestId = requestId;
    const emptyText = ZONE_PROJECT_KINDS[kind].emptyText;

    this.setState({
      zoneProjects: [],
      zoneProjectsStatusText: ZONE_PROJECTS_LOADING_TEXT,
      isZoneProjectsLoading: true,
    });

    const isCurrentRequest = () =>
      this._isMounted && requestId === this._zoneProjectsRequestId;

    try {
      const json = await fetchJson(url, 'zone projects');
      if (!isCurrentRequest()) {
        return;
      }

      this.setState({
        zoneProjects: resolveZoneProjects(json),
        zoneProjectsStatusText: emptyText,
        isZoneProjectsLoading: false,
      });
    } catch (error) {
      if (!isCurrentRequest()) {
        return;
      }

      console.warn('Cannot load zone projects', error);
      this.setState({
        zoneProjects: [],
        zoneProjectsStatusText: emptyText,
        isZoneProjectsLoading: false,
      });
    }
  }

  _animateSheetTo(toValue, duration, easing, onDone) {
    Animated.timing(this._sheetAnim, {
      toValue,
      duration,
      easing,
      useNativeDriver: true,
    }).start(onDone);
  }

  _openSheet() {
    this.setState(
      {
        isSheetMounted: true,
        sheetSnapValue: SHEET_INITIAL_SNAP_RATIO,
      },
      () => {
        this._animateSheetTo(
          SHEET_INITIAL_SNAP_RATIO,
          SHEET_OPEN_DURATION_MS,
          Easing.out(Easing.cubic)
        );
      }
    );
  }

  /**
   * Settles the sheet on one of its open anchors (see SHEET_HALF_SNAP_RATIO).
   * It never closes the sheet: dismissing is the close button's job alone, and
   * goes through `_closeSheet`, which also unmounts.
   */
  _snapSheetTo(snapValue) {
    if (typeof snapValue !== 'number' || snapValue <= 0) {
      return;
    }

    this.setState({ sheetSnapValue: snapValue });
    this._animateSheetTo(
      snapValue,
      SHEET_OPEN_DURATION_MS,
      Easing.out(Easing.cubic)
    );
  }

  _closeSheet() {
    this._sheetRequestId += 1;
    this._zoneProjectsRequestId += 1;
    this._routeRequestId += 1;
    this._sheetPin = null;
    this._removeMarker(SHEET_MARKER_ID);
    this._clearZoneOverlays();
    this._clearDirections();

    this._animateSheetTo(
      0,
      SHEET_CLOSE_DURATION_MS,
      Easing.in(Easing.cubic),
      () => {
        if (!this._isMounted) {
          return;
        }

        const reopenAdvancedSearch = this._sheetOpenedFromAdvancedSearch;
        this._sheetOpenedFromAdvancedSearch = false;

        this.setState({
          sheetInfo: null,
          isSheetLoading: false,
          isSheetMounted: false,
          sheetSnapValue: SHEET_INITIAL_SNAP_RATIO,
          projectsKind: null,
          zoneProjects: [],
          isDirectionsVisible: false,
          directionsRoute: null,
          directionsOrigin: null,
          directionsDestination: null,
          pickingEndpoint: null,
          ...EMPTY_DIRECTIONS_EDIT,
          // A result picked from advanced search closes back into it, the way
          // picking one from the plain search box closes back onto the map —
          // each returns to what it was opened from.
          ...(reopenAdvancedSearch ? { isAdvancedSearchVisible: true } : null),
        });
      }
    );

    if (this._hasFocusedFromSheet) {
      this._hasFocusedFromSheet = false;
      this.clearFocusedArea();
    }
  }

  _onSheetPanelHeightChange(panelHeight) {
    this._sheetPanelHeight =
      typeof panelHeight === 'number' && panelHeight > 0 ? panelHeight : 0;
  }

  /**
   * fitBounds padding is in dp on both platforms, so the measured layout
   * heights can be handed over as they are.
   */
  _getFocusPadding(snapValue) {
    const panelHeight =
      this._sheetPanelHeight || Dimensions.get('window').height;
    // Nothing is covering the map when the sheet is not up, so a camera fit
    // asked for from elsewhere — search, say — gets the plain margin.
    const coveredHeight = this.state.isSheetMounted
      ? Math.max(0, Math.round(panelHeight * snapValue))
      : 0;

    return {
      top: SHEET_FOCUS_PADDING,
      left: SHEET_FOCUS_PADDING,
      right: SHEET_FOCUS_PADDING,
      bottom: coveredHeight + SHEET_FOCUS_PADDING,
    };
  }

  /**
   * Gets the map ready to frame something the sheet must not cover: fitting a
   * camera into the strip of map left uncovered only makes sense if there is
   * one, so a fully open sheet is collapsed first. Returns the padding the fit
   * needs to clear whatever the sheet still hides.
   */
  _makeRoomForCameraFit() {
    const snapValue = Math.min(
      this.state.sheetSnapValue,
      SHEET_HALF_SNAP_RATIO
    );

    if (this.state.sheetSnapValue > snapValue) {
      this._snapSheetTo(snapValue);
    }

    return this._getFocusPadding(snapValue);
  }

  _fitCameraToZone(info) {
    this._fitCameraToBounds(getViewboxFromGeometry(info?.geometry));
  }

  _fitCameraToBounds(bounds) {
    if (!bounds) {
      return;
    }

    this.fitBounds({
      bounds: {
        southWest: {
          latitude: bounds.minLat,
          longitude: bounds.minLng,
        },
        northEast: {
          latitude: bounds.maxLat,
          longitude: bounds.maxLng,
        },
      },
      padding: this._makeRoomForCameraFit(),
    });
  }

  /**
   * Turns the map back to north. Tilt is left alone — the needle only speaks
   * for the bearing, and a 3D view the user set up is not ours to flatten.
   */
  _resetBearing() {
    this.animateCamera({ bearing: 0 });
  }

  /**
   * Follows the camera so the compass needle can hold north. Panning and
   * zooming leave the bearing alone, so this settles into no work at all
   * outside an actual rotation.
   */
  _onCameraMove(event) {
    super._onCameraMove(event);

    const center = event?.nativeEvent?.center;
    if (
      typeof center?.latitude === 'number' &&
      typeof center?.longitude === 'number'
    ) {
      this._cameraCenter = {
        latitude: center.latitude,
        longitude: center.longitude,
      };
    }

    const bearing = event?.nativeEvent?.bearing;
    if (typeof bearing !== 'number' || !Number.isFinite(bearing)) {
      return;
    }

    if (Math.abs(bearing - this.state.mapBearing) >= 0.5) {
      this.setState({ mapBearing: bearing });
    }
  }

  /**
   * Takes the province to draw as an argument rather than reading it off state,
   * so it can also be called straight after a response lands — at that point
   * the `setState` carrying it has not been applied yet.
   */
  _focusProvince(focusProvince) {
    if (!focusProvince || !this.areaFocusManager) {
      return;
    }

    this._hasFocusedFromSheet = true;
    this.areaFocusManager.focus({
      type: 'province',
      name: focusProvince.name,
      display: focusProvince.highlight === true ? 'highlight' : 'normal',
      padding: this._makeRoomForCameraFit(),
    });
  }

  _focusProvinceFromSheet() {
    this._focusProvince(this.state.sheetInfo?.focusProvince);
  }

  render() {
    const items = this.state.categoryItems;
    const legendGroupSections = this.state.legendSections;
    const hasItems = Array.isArray(items) && items.length > 0;
    const hasLegendItems = legendGroupSections.length > 0;
    const showLayerButton = hasItems;
    const showSelector = this.state.isSelectorMounted && hasItems;
    // Grouping walks the items and sorts them, and only the drawer reads the
    // result — no reason to do it on the renders where the drawer is closed,
    // which is most of them.
    const groupSections = showSelector
      ? createCategoryGroupSections(
          items,
          this.state.groupTitleByKey,
          this.state.groupOrderedKeys
        )
      : EMPTY_GROUP_SECTIONS;
    const showLegendButton = hasLegendItems;
    const showLegend = this.state.isLegendMounted && hasLegendItems;
    const selectorTitle = SELECTOR_TITLE;
    const legendTitle = LEGEND_TITLE;
    const isZoneSheet = this.state.sheetKind === SHEET_KIND_ZONE;
    const projectsConfig = ZONE_PROJECT_KINDS[this.state.projectsKind];
    const showProjects = isZoneSheet && projectsConfig != null;
    const zoneTitle = showProjects ? projectsConfig.title : SHEET_ZONE_TITLE;
    const showDirections = this.state.isDirectionsVisible;
    const detailTitle = isZoneSheet
      ? zoneTitle
      : this.state.sheetKind === SHEET_KIND_INFRA
      ? SHEET_INFRA_TITLE
      : SHEET_TITLE;
    const sheetTitle = showDirections ? DIRECTIONS_ACTION_LABEL : detailTitle;
    // Only one drill-down is open at a time, so one back handler covers both.
    const projectsBack = showProjects ? this._closeZoneProjects : null;
    const backHandler = showDirections ? this._closeDirections : projectsBack;
    // Pinning the overlays to the map's own frame keeps them aligned with it
    // even when the parent pads the map inward — a SafeAreaView with default
    // edges, for one, which otherwise left the sheet short of the map's bottom.
    const mapFrame = this.state.mapFrame;
    const overlayRootStyle = mapFrame
      ? {
          position: 'absolute',
          left: mapFrame.x,
          top: mapFrame.y,
          width: mapFrame.width,
          height: mapFrame.height,
        }
      : sharedStyles.mapOverlayRoot;
    const pickingEndpoint = this.state.pickingEndpoint;
    // Nothing to turn around until both ends are known.
    const canSwapEndpoints =
      this.state.directionsOrigin != null &&
      this.state.directionsDestination != null;
    // The sheet only decides whether the directions view is showing; every
    // other part of it belongs to DirectionsBody. Handing them over as one
    // bundle keeps the sheet out of the business of naming them twice, and
    // means a new field here never touches the sheet at all.
    const directions = {
      loading: this.state.isDirectionsLoading,
      statusText: this.state.directionsStatusText,
      route: this.state.directionsRoute,
      mode: this.state.directionsMode,
      originText: this.state.directionsOrigin?.label,
      destinationText: this.state.directionsDestination?.label,
      pickingEndpoint,
      canSwapEndpoints,
      editingEndpoint: this.state.directionsEditingEndpoint,
      query: this.state.directionsQuery,
      suggestions: this.state.directionsSuggestions,
      suggestLoading: this.state.isDirectionsSuggestLoading,
      onPickEndpoint: this._pickDirectionsEndpoint,
      onSwapEndpoints: this._swapDirectionsEndpoints,
      onChangeMode: this._changeDirectionsMode,
      onChangeQuery: this._onDirectionsQueryChange,
      onFocusEndpoint: this._onDirectionsEndpointFocus,
      onSelectSuggestion: this._onSelectDirectionsSuggestion,
    };
    // Same bundle for the drilled-down project list. The zone's name is part
    // of it because the list heads itself with it, not because the sheet has
    // any use for it.
    const zoneProjects = {
      zoneName: this.state.sheetInfo?.name,
      loading: this.state.isZoneProjectsLoading,
      statusText: this.state.zoneProjectsStatusText,
      projects: Array.isArray(this.state.zoneProjects)
        ? this.state.zoneProjects
        : [],
    };
    const pickHintText =
      pickingEndpoint === DIRECTIONS_ENDPOINT_ORIGIN
        ? DIRECTIONS_PICK_ORIGIN_TEXT
        : DIRECTIONS_PICK_DESTINATION_TEXT;

    return (
      <React.Fragment>
        {super.render()}
        <View style={overlayRootStyle} pointerEvents="box-none">
          <LayerButton
            show={showLayerButton}
            isActive={this.state.isSelectorVisible}
            onPress={this._toggleSelectorVisibility}
          />
          <LegendButton
            show={showLegendButton}
            isActive={this.state.isLegendVisible}
            onPress={this._toggleLegendVisibility}
          />
          <CompassButton
            bearing={this.state.mapBearing}
            onPress={this._resetBearing}
          />
          {/* Searching for somewhere else is not what the directions view is
              for, and its pick-a-point banner takes the slot anyway. */}
          <SearchBox
            show={!showDirections}
            keyword={this.state.searchKeyword}
            sections={this.state.searchSections}
            loading={this.state.isSearchLoading}
            showResults={this.state.isSearchOpen}
            trailing={
              <AdvancedSearchButton
                isActive={this.state.isAdvancedSearchVisible}
                onPress={this._openAdvancedSearch}
              />
            }
            onChangeKeyword={this._onSearchKeywordChange}
            onClear={this._clearSearch}
            onFocus={this._onSearchFocus}
            onSelectResult={this._onSelectSearchResult}
          />
          <SelectorDrawer
            show={showSelector}
            title={selectorTitle}
            groupSections={groupSections}
            expandedGroupKeys={this.state.expandedGroupKeys}
            dragAnim={this._selectorAnim}
            backdropAnimatedStyle={this._selectorBackdropStyle}
            panelAnimatedStyle={this._selectorPanelStyle}
            onClose={this._toggleSelectorVisibility}
            onDragCancel={this._snapSelectorOpen}
            onToggleGroup={this._toggleGroup}
            onToggleGroupChecked={this._toggleGroupChecked}
            onToggleItem={this._toggleItem}
          />
          <LegendDrawer
            show={showLegend}
            title={legendTitle}
            groupSections={legendGroupSections}
            dragAnim={this._legendAnim}
            backdropAnimatedStyle={this._legendBackdropStyle}
            panelAnimatedStyle={this._legendPanelStyle}
            onClose={this._closeLegend}
            onDragCancel={this._snapLegendOpen}
          />
          <InvestmentSheet
            show={this.state.isSheetMounted}
            title={sheetTitle}
            kind={this.state.sheetKind}
            loading={this.state.isSheetLoading}
            statusText={this.state.sheetStatusText}
            info={this.state.sheetInfo}
            showProjects={showProjects}
            zoneProjects={zoneProjects}
            showDirections={showDirections}
            directions={directions}
            dragAnim={this._sheetAnim}
            snapValue={this.state.sheetSnapValue}
            onClose={this._closeSheet}
            onBack={backHandler}
            onSnapTo={this._snapSheetTo}
            onPanelHeightChange={this._onSheetPanelHeightChange}
            onFocusProvince={this._focusProvinceFromSheet}
            onPressProjects={this._openZoneProjects}
            onPressDirections={this._startDirections}
          />
          <PickOriginBanner
            show={pickingEndpoint != null}
            text={pickHintText}
            onCancel={this._cancelPickOrigin}
          />
          {/* Last, so it covers everything else: it is a screen, not a panel. */}
          <AdvancedSearchView
            show={this.state.isAdvancedSearchVisible}
            target={this.state.advancedTarget}
            filters={this.state.advancedFilters}
            options={this.state.advancedOptions}
            results={this.state.advancedResults}
            loading={this.state.isAdvancedLoading}
            loadingMore={this.state.isAdvancedLoadingMore}
            onClose={this._closeAdvancedSearch}
            onChangeTarget={this._changeAdvancedTarget}
            onChangeFilter={this._changeAdvancedFilter}
            onReset={this._resetAdvancedFilters}
            onSearch={this._runAdvancedSearch}
            onLoadMore={this._loadMoreAdvancedResults}
            onSelectResult={this._onSelectAdvancedResult}
            scrollOffset={this._advancedScrollOffset}
            onScrollOffsetChange={this._onAdvancedScrollOffsetChange}
          />
        </View>
      </React.Fragment>
    );
  }
}

MFBanDoSo.propTypes = banDoSoPropTypes;
MFBanDoSo.defaultProps = {
  ...MFMapView.defaultProps,
  isStaging: false,
};

export { MFBanDoSo };
