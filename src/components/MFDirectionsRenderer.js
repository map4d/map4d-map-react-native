import React from 'react';
import PropTypes from 'prop-types';
import {ViewPropTypes, ColorPropType} from 'deprecated-react-native-prop-types';
import {runViewManagerCommand} from '../native/ViewManagerCommand';
import {
  requireNativeComponent,
  Image,
  findNodeHandle,
  processColor
} from 'react-native';

const viewPropTypes = ViewPropTypes || View.propTypes;

const propTypes = {
  ...viewPropTypes,

  /**
   * The directions to display on the map,
   * retrieved as an array of array of coordinates to describe the routes.
   * Similar to directions prop but has higher priority
   */
  routes: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        latitude: PropTypes.number.isRequired,
        longitude: PropTypes.number.isRequired,
      })
    )
  ),

  /**
   * The directions to display on the map,
   * retrieved as a json string from Get route Map4D API (/sdk/route).
   * Similar to routes prop but with lower priority
   */
  directions: PropTypes.string,

  /**
   * The index of the main route, default value is 0.
   */
  activedIndex: PropTypes.number,

  /**
   * The active route stroke width.
   */
  activeStrokeWidth: PropTypes.number,

  /**
   * The active route color.
   */
  activeStrokeColor: ColorPropType,

  /**
   * The active route outline stroke width.
   */
  activeOutlineWidth: PropTypes.number,

  /**
   * The active route outline color.
   */
  activeOutlineColor: ColorPropType,

  /**
   * The inactive route stroke width.
   */
  inactiveStrokeWidth: PropTypes.number,

  /**
   * The inactive route color.
   */
  inactiveStrokeColor: ColorPropType,

  /**
   * The inactive route outline stroke width.
   */
  inactiveOutlineWidth: PropTypes.number,

  /**
   * The inactive route outline color.
   */
  inactiveOutlineColor: ColorPropType,

  /**
   * The options of the origin POI.
   */
  originPOIOptions: PropTypes.shape({
    coordinate: PropTypes.shape({
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired,
    }),

    icon: PropTypes.shape({
      uri: PropTypes.any.isRequired
    }),

    title: PropTypes.string,

    titleColor: ColorPropType,

    visible: PropTypes.bool,
  }),

  /**
   * The options of the destination POI.
   */
  destinationPOIOptions: PropTypes.shape({
    coordinate: PropTypes.shape({
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired,
    }),

    icon: PropTypes.shape({
      uri: PropTypes.any.isRequired
    }),

    title: PropTypes.string,

    titleColor: ColorPropType,

    visible: PropTypes.bool,
  }),

  /**
   * Callback that is called when the user presses on the routes.
   */
  onPress: PropTypes.func,
};

class MFDirectionsRenderer extends React.Component {
  constructor(props) {
    super(props)
    this._ref = this._ref.bind(this)
    this._onPress = this._onPress.bind(this)
  }

  setActivedIndex(index) {
    this._runCommand("setActivedIndex", [index])
  }

  setRoutes(routes) {
    this._runCommand("setRoutes", [routes])
  }

  setDirections(directions) {
    this._runCommand("setDirections", [directions])
  }

  render() {
    let originPOIOptions = this._resolvePOIOptions(this.props.originPOIOptions)
    let destinationPOIOptions = this._resolvePOIOptions(this.props.destinationPOIOptions)

    return <RMFDirectionsRenderer
      {...this.props}
      originPOIOptions={originPOIOptions}
      destinationPOIOptions={destinationPOIOptions}
      ref={this._ref}
      onPress={this._onPress}
    />;
  }

  /**
   * Returns a converted copy of the POI options, never a modified original.
   *
   * Writing back into the prop broke twice over. React Native deep-freezes
   * props it has handed to a native view in dev, so the second render threw
   * "attempted to set the key `titleColor` ... has been frozen". And even
   * unfrozen it was wrong: `processColor` turns '#1D4ED8' into a signed int,
   * which is outside the range it accepts as input, so feeding its own output
   * back in returns undefined and the colour silently disappears. Converting
   * from the untouched prop every time avoids both.
   */
  _resolvePOIOptions(options) {
    if (!options) {
      return options
    }

    const resolved = {...options}

    if (resolved.titleColor != null) {
      resolved.titleColor = processColor(resolved.titleColor)
    }

    if (resolved.icon) {
      let uri = Image.resolveAssetSource(resolved.icon.uri) || {uri: resolved.icon.uri};
      resolved.icon = {uri: uri.uri}
    }

    return resolved
  }

  _ref(ref) {
    this.renderer = ref;
  }

  _onPress(event) {
    event.stopPropagation();
      if (this.props.onPress) {
        this.props.onPress(event);
    }
  }

  _runCommand(name, args) {
    return runViewManagerCommand({
      componentName: 'RMFDirectionsRenderer',
      moduleName: 'RMFDirectionsRenderer',
      commandName: name,
      args,
      reactTag: this._getHandle(),
    });
  }

  _getHandle() {
    return findNodeHandle(this.renderer);
  }

}

MFDirectionsRenderer.propTypes = propTypes;

var RMFDirectionsRenderer = requireNativeComponent(`RMFDirectionsRenderer`, MFDirectionsRenderer);

export { MFDirectionsRenderer }
