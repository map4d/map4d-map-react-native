import PropTypes from 'prop-types';
import React from 'react';
import {ViewPropTypes, ColorPropType} from 'deprecated-react-native-prop-types';
import {AreaFocusManager} from './extends/AreaFocusManager';
import {AreaFocuser} from './extends/AreaFocuser';
import {MFDirectionsRenderer} from './MFDirectionsRenderer';
import {MFMarker} from './MFMarker';
import {MFPolygon} from './MFPolygon';
import {getMap4dMapNativeModule} from '../native/Map4dMapNativeModule';
import {runViewManagerCommand} from '../native/ViewManagerCommand';
import {
  requireNativeComponent,
  Platform,
  findNodeHandle
} from 'react-native';

const CameraShape = PropTypes.shape({
  target: PropTypes.shape({
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
  }),
  zoom: PropTypes.number.isRequired,
  bearing: PropTypes.number.isRequired,
  tilt: PropTypes.number.isRequired,
});

// if ViewPropTypes is not defined fall back to View.propType (to support RN < 0.44)
const viewPropTypes = ViewPropTypes || View.propTypes;

/**
 * Identity of the route POIs, used as the renderer's key so that renaming an
 * end of the route remounts it.
 *
 * The Android SDK reads a POI's title once, on the branch of setupStartAndEndPoint that
 * creates that POI. Hand it a new title afterwards and setStartLabel does store
 * it and does ask for an update, but the update path finds the POI already
 * there and only repositions it — the label on screen stays whatever it was
 * drawn with. Rebuilding the renderer is what gets the POI created again, and
 * dropping it removes both POIs with it, so nothing is left behind.
 *
 * Only the titles go into the key. Positions the SDK does update in place, and
 * keying on those would throw the drawn route away on every re-route — a mode
 * change, say — for nothing.
 */
function resolveDirectionsKey(options) {
  const origin = options?.originPOIOptions?.title ?? '';
  const destination = options?.destinationPOIOptions?.title ?? '';

  return `directions:${origin}|${destination}`;
}

const propTypes = {
  ...viewPropTypes,

  /**
   * An opaque identifier for a custom map configuration.
   */
  mapID: PropTypes.string,

  /**
   *  Map style by string for a custom map configuration.
   */
  mapStyle: PropTypes.string,

  /**
   * If `false` hide the button to move map to the current user's location.
   * Default value is `false`.
   */
  showsMyLocationButton: PropTypes.bool,

  /**
   * If `true` the app will ask for the user's location.
   * Default value is `false`.
   */
  showsMyLocation: PropTypes.bool,

  /**
   * A Boolean indicating whether the map displays buildings.
   * Default value is `true`.
   */
  showsBuildings: PropTypes.bool,

  /**
   * A Boolean indicating whether the map displays POIs.
   * Default value is `true`.
   */
  showsPOIs: PropTypes.bool,

  /**
   * If `false` the user won't be able to zoom the map.
   * Default value is `true`.
   */
  zoomGesturesEnabled: PropTypes.bool,

  /**
   * If `false` the user won't be able to scroll the map.
   * Default value is `true`.
   */
  scrollGesturesEnabled: PropTypes.bool,

  /**
   * If `false` the user won't be able to pinch/rotate the map.
   * Default value is `true`.
   */
  rotateGesturesEnabled: PropTypes.bool,

  /**
   * If `false` the user won't be able to tilt the map.
   * Default value is `true`.
   */
  tiltGesturesEnabled: PropTypes.bool,

  /**
   * The camera view position.
   */
  camera: CameraShape,

  /**
   * Type of map tiles to be rendered.
   */
  mapType: PropTypes.oneOf(['roadmap', 'satellite', 'hybrid']),

  /**
   * Callback that is called once the map is fully loaded.
   * @platform android
   */
  onMapReady: PropTypes.func,

  /**
   * Callback that is called when user taps on the map.
   */
  onPress: PropTypes.func,

  /**
   * Callback that is called when user taps on the POIs
   */
  onPoiPress: PropTypes.func,

  /**
   * Callback that is called when user taps on the Buildings
   */
  onBuildingPress: PropTypes.func,

  /**
   * Callback that is called when user taps on the Places
   */
  onPlacePress: PropTypes.func,

  /**
   * Callback that is called when user taps on the Data Source Features
   */
  onDataSourceFeaturePress: PropTypes.func,

  /**
   * Callback that is called when moving camera
   */
  onCameraMove: PropTypes.func,

  /**
   * Callback that is called when camera start moving
   */
  onCameraMoveStart: PropTypes.func,

  /**
   * Callback that is called when camera idle
   */
  onCameraIdle: PropTypes.func,

  /**
   * Callback that is called when user taps on location Button
   */
  onMyLocationButtonPress: PropTypes.func,

};


class MFMapView extends React.Component {
  constructor(props) {
    super(props);
    this.areaFocusManager = new AreaFocusManager(this);
    this.areaFocuser = new AreaFocuser(this.areaFocusManager);
    this.state = {
      isReady: false,
      managedPolygons: {},
      managedMarkers: {},
      managedDirections: null,
      mapFrame: null,
    };

    this._onMapReady = this._onMapReady.bind(this);
    this._onMapLayout = this._onMapLayout.bind(this);
    this._onPress = this._onPress.bind(this);
    this._onDataSourceFeaturePress = this._onDataSourceFeaturePress.bind(this);
    this._onCameraMove = this._onCameraMove.bind(this);
    this._ref = this._ref.bind(this);
  }

  _addPolygon(polygon) {
    if (polygon == null || typeof polygon !== 'object') {
      return null;
    }

    const id =
      typeof polygon.id === 'string' && polygon.id.trim().length > 0
        ? polygon.id
        : 'polygon-highlight-id-default';

    const _polygon = {
      ...polygon,
      id,
    };

    this.setState((prevState) => ({
      managedPolygons: {
        ...prevState.managedPolygons,
        [id]: _polygon,
      },
    }));

    return id;
  }

  _removePolygon(id) {
    if (typeof id !== 'string' || id.trim().length === 0) {
      return;
    }

    this.setState((prevState) => {
      if (!prevState.managedPolygons[id]) {
        return null;
      }

      const managedPolygons = {
        ...prevState.managedPolygons,
      };
      delete managedPolygons[id];

      return {
        managedPolygons,
      };
    });
  }

  _clearManagedPolygons() {
    this.setState({
      managedPolygons: {},
    });
  }

  /**
   * Markers owned by the component itself rather than passed in as children,
   * mirroring the managed polygons above.
   */
  _addMarker(marker) {
    if (marker == null || typeof marker !== 'object') {
      return null;
    }

    const id =
      typeof marker.id === 'string' && marker.id.trim().length > 0
        ? marker.id
        : 'marker-managed-id-default';

    const _marker = {
      ...marker,
      id,
    };

    this.setState((prevState) => ({
      managedMarkers: {
        ...prevState.managedMarkers,
        [id]: _marker,
      },
    }));

    return id;
  }

  _removeMarker(id) {
    if (typeof id !== 'string' || id.trim().length === 0) {
      return;
    }

    this.setState((prevState) => {
      if (!prevState.managedMarkers[id]) {
        return null;
      }

      const managedMarkers = {
        ...prevState.managedMarkers,
      };
      delete managedMarkers[id];

      return {
        managedMarkers,
      };
    });
  }

  /**
   * A route the component draws itself, in the same spirit as the managed
   * polygons and markers above. `directions` is the raw `/sdk/route` response
   * string, which the native renderer decodes on its own.
   */
  _setDirections(directions, options) {
    if (typeof directions !== 'string' || directions.trim().length === 0) {
      return;
    }

    this.setState({
      managedDirections: {
        directions,
        options: options && typeof options === 'object' ? options : {},
      },
    });
  }

  _clearDirections() {
    if (this.state.managedDirections == null) {
      return;
    }

    this.setState({
      managedDirections: null,
    });
  }

  _onMapReady() {
    const { onMapReady } = this.props;
    this.setState({ isReady: true }, () => {
      if (onMapReady) {
        onMapReady();
      }
    });
  }

  /**
   * The map's own frame within its parent. Subclasses draw overlays as siblings
   * of the map, and a sibling cannot infer that frame from the parent: padding
   * on the parent (a SafeAreaView with default edges, say) shifts the two apart.
   * Measuring the map itself is the only account that always matches.
   */
  _onMapLayout(event) {
    const { onLayout } = this.props;
    if (onLayout) {
      onLayout(event);
    }

    const layout = event?.nativeEvent?.layout;
    if (!layout) {
      return;
    }

    const next = {
      x: layout.x,
      y: layout.y,
      width: layout.width,
      height: layout.height,
    };

    this.setState((prevState) => {
      const frame = prevState.mapFrame;
      const unchanged =
        frame != null &&
        Math.abs(frame.x - next.x) < 1 &&
        Math.abs(frame.y - next.y) < 1 &&
        Math.abs(frame.width - next.width) < 1 &&
        Math.abs(frame.height - next.height) < 1;

      return unchanged ? null : { mapFrame: next };
    });
  }

  _onPress(event) {
    const { onPress } = this.props;
    if (onPress) {
      onPress(event);
    }
  }

  _onDataSourceFeaturePress(event) {
    const { onDataSourceFeaturePress } = this.props;
    if (onDataSourceFeaturePress) {
      onDataSourceFeaturePress(event);
    }
  }

  /**
   * Carries the camera the map moved to: `{center, zoom, bearing, tilt}`.
   * Routed through here rather than straight from the props so a subclass can
   * follow the camera without taking the callback away from its own user.
   */
  _onCameraMove(event) {
    const { onCameraMove } = this.props;
    if (onCameraMove) {
      onCameraMove(event);
    }
  }

  _ref(ref) {
    this.map = ref;
  }

  getCamera() {
    if (Platform.OS === 'android') {
      return this._runMap4dMapModuleMethod('getCamera', [this._getHandle()]);
    } else if (Platform.OS === 'ios') {
      return this._runCommand('getCamera', []);
    }
    return Promise.reject('Function not supported on this platform');
  }

  getBounds() {
    if (Platform.OS === 'android') {
      return this._runMap4dMapModuleMethod('getBounds', [this._getHandle()]);
    } else if (Platform.OS === 'ios') {
      return this._runCommand('getBounds', []);
    }
    return Promise.reject('Function not supported on this platform');
  }

  getMyLocation() {
    if (Platform.OS === 'android') {
      return this._runMap4dMapModuleMethod('getMyLocation', [this._getHandle()]);
    } else if (Platform.OS === 'ios') {
      return this._runCommand('getMyLocation', []);
    }
    return Promise.reject('Function not supported on this platform');
  }

  getMapStyle() {
    if (Platform.OS === 'android') {
      return this._runMap4dMapModuleMethod('getMapStyle', [this._getHandle()]);
    } else if (Platform.OS === 'ios') {
      return this._runCommand('getMapStyle', []);
    }
    return Promise.reject('Function not supported on this platform');
  }

  animateCamera(camera) {
    this._runCommand('animateCamera', [camera]);
  }

  moveCamera(camera) {
    this._runCommand('moveCamera', [camera]);
  }

  setMyLocationEnabled(enable) {
    this._runCommand('setMyLocationEnabled', [enable]);
  }

  showsMyLocationButton(enable) {
    this._runCommand('showsMyLocationButton', [enable]);
  }

  setPOIsEnabled(enable) {
    this._runCommand('setPOIsEnabled', [enable]);
  }

  setZoomGesturesEnabled(enable) {
    this._runCommand('setZoomGesturesEnabled', [enable]);
  }

  setScrollGesturesEnabled(enable) {
    this._runCommand('setScrollGesturesEnabled', [enable]);
  }

  setRotateGesturesEnabled(enable) {
    this._runCommand('setRotateGesturesEnabled', [enable]);
  }

  setTiltGesturesEnabled(enable) {
    this._runCommand('setTiltGesturesEnabled', [enable]);
  }

  setAllGesturesEnabled(enable) {
    this._runCommand('setAllGesturesEnabled', [enable]);
  }

  setTime(time) {
    let t = Date.parse(time)
    if (isNaN(t)) {
      console.log('time invalid')
    }
    else {
      this._runCommand('setTime', [t]);
    }
  }

  fitBounds(boundsData) {
    this._runCommand("fitBounds", [boundsData])
  }

  cameraForBounds(boundsData) {
    if (Platform.OS === 'android') {
      return this._runMap4dMapModuleMethod('cameraForBounds', [
        this._getHandle(),
        boundsData
      ]);
    } else if (Platform.OS === 'ios') {
      return this._runCommand('cameraForBounds', [boundsData]);
    }
    return Promise.reject('cameraForBounds not supported on this platform');
  }


  /**
   * Convert a map coordinate to screen point
   *
   * @param coordinate Coordinate
   * @param [coordinate.latitude] Latitude
   * @param [coordinate.longitude] Longitude
   *
   * @return Promise Promise with the point ({ x: Number, y: Number })
   */
  pointForCoordinate(coordinate) {
    if (Platform.OS === 'android') {
      return this._runMap4dMapModuleMethod('pointForCoordinate', [
        this._getHandle(),
        coordinate
      ]);
    } else if (Platform.OS === 'ios') {
      return this._runCommand('pointForCoordinate', [coordinate]);
    }
    return Promise.reject('pointForCoordinate not supported on this platform');
  }

  /**
   * Convert a screen point to a map coordinate
   *
   * @param point Point
   * @param [point.x] X
   * @param [point.x] Y
   *
   * @return Promise Promise with the coordinate ({ latitude: Number, longitude: Number })
   */
  coordinateForPoint(point) {
    if (Platform.OS === 'android') {
      return this._runMap4dMapModuleMethod('coordinateForPoint', [
        this._getHandle(),
        point
      ]);
    } else if (Platform.OS === 'ios') {
      return this._runCommand('coordinateForPoint', [point]);
    }
    return Promise.reject('coordinateForPoint not supported on this platform');
  }

  focusArea(focusOptions) {
    if (!this.areaFocusManager) {
      return Promise.resolve(null)
    }

    return this.areaFocusManager.focus(focusOptions)
  }

  clearFocusedArea() {
    if (!this.areaFocusManager) {
      return
    }
    this.areaFocusManager.clear()
  }

  _getHandle() {
    return findNodeHandle(this.map);
  }

  _runMap4dMapModuleMethod(name, args) {
    const map4dMapNativeModule = getMap4dMapNativeModule();

    if (
      !map4dMapNativeModule ||
      typeof map4dMapNativeModule[name] !== 'function'
    ) {
      return Promise.reject(
        `Map4dMap native method "${name}" is unavailable`
      );
    }

    return map4dMapNativeModule[name](...args);
  }

  _runCommand(name, args) {
    return runViewManagerCommand({
      componentName: 'RMFMapView',
      moduleName: 'RMFMapView',
      commandName: name,
      args,
      reactTag: this._getHandle(),
      platform: Platform.OS,
      rejectOnError: true,
    });
  }

  render() {
    let props;
    const { children, ...restProps } = this.props;
    const managedPolygons = Object.values(this.state.managedPolygons);
    const managedMarkers = Object.values(this.state.managedMarkers);

    if (this.state.isReady) {
      props = {
        style: this.props.style,
        onMapReady: this._onMapReady,
        ...restProps,
        onLayout: this._onMapLayout,
        onPress: this._onPress,
        onDataSourceFeaturePress: this._onDataSourceFeaturePress,
        onCameraMove: this._onCameraMove,
        children: (
          <React.Fragment>
            {children}
            {managedPolygons.map((polygon) => (
              <MFPolygon
                key={polygon.id}
                coordinates={polygon.coordinates}
                holes={polygon.holes}
                fillColor={polygon.fillColor}
                strokeColor={polygon.strokeColor}
                strokeWidth={polygon.strokeWidth}
                zIndex={polygon.zIndex}
              />
            ))}
            {this.state.managedDirections ? (
              <MFDirectionsRenderer
                key={resolveDirectionsKey(
                  this.state.managedDirections.options
                )}
                directions={this.state.managedDirections.directions}
                {...this.state.managedDirections.options}
              />
            ) : null}
            {managedMarkers.map((marker) => (
              <MFMarker
                key={marker.id}
                coordinate={marker.coordinate}
                icon={marker.icon}
                title={marker.title}
                snippet={marker.snippet}
                anchor={marker.anchor}
                elevation={marker.elevation}
                zIndex={marker.zIndex}
              />
            ))}
          </React.Fragment>
        ),
      };
    } else {
      props = {
        style: this.props.style,
        onMapReady: this._onMapReady
      };
    }

    return <RMFMapView
      {...props}
      ref={this._ref}
    />;
  }
}

MFMapView.propTypes = propTypes;
var RMFMapView = requireNativeComponent(`RMFMapView`, MFMapView);


export { MFMapView }