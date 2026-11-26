import React from 'react';
import PropTypes from 'prop-types';
import {ViewPropTypes, ColorPropType} from 'deprecated-react-native-prop-types';
import {runViewManagerCommand} from '../native/ViewManagerCommand';
import {
  requireNativeComponent,
  findNodeHandle,
  processColor
} from 'react-native';

// if ViewPropTypes is not defined fall back to View.propType (to support RN < 0.44)
const viewPropTypes = ViewPropTypes || View.propTypes;

const propTypes = {
  ...viewPropTypes,

  /**
   * An array of coordinates to describe the polyline
   */
  coordinates: PropTypes.arrayOf(
    PropTypes.shape({
      /**
       * Latitude/Longitude coordinates
       */
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired,
    })
  ),

  /**
   * The color to use for the path.
   */
  color: ColorPropType,

  /**
   * The stroke width to use for the path.
   */
  width: PropTypes.number,

  /**
   * The default style is `solid`.
   */
  lineStyle: PropTypes.oneOf(['solid', 'dotted']),

  /**
   * zIndex
   */
  zIndex: PropTypes.number,

  /**
   * visible
   */
  visible: PropTypes.bool,

  /**
   * userData
   */
  userData:PropTypes.object,

  /**
   * Callback that is called when the user presses on the polyline
   */
  onPress: PropTypes.func,
};


class MFPolyline extends React.Component {
  constructor(props) {
    super(props);
    this._onPress = this._onPress.bind(this)
    this._ref = this._ref.bind(this)
  }

  _onPress(event) {
    event.stopPropagation();
      if (this.props.onPress) {
        this.props.onPress(event);
    }
  }

  _ref(ref) {
    this.polyline = ref;
  }

  // TODO - bug
  setCoordinates(coordinates) {
    this._runCommand("setCoordinates", [coordinates])
  }

  setWidth(width) {
    this._runCommand("setWidth", [width])
  }

  setColor(color) {
    this._runCommand("setColor", [processColor(color)])
  }

  setVisible(visible) {
    this._runCommand("setVisible", [visible])
  }

  setTouchable(touchable) {
    this._runCommand("setTouchable", [touchable])
  }

  setZIndex(zIndex) {
    this._runCommand("setZIndex", [zIndex])
  }

  setLineStyle(style) {
    this._runCommand("setLineStyle", [style])
  }

  setUserData(userData) {
    this._runCommand("setUserData", [userData])
  }

  _getHandle() {
    return findNodeHandle(this.polyline);
  }

  _runCommand(name, args) {
    return runViewManagerCommand({
      componentName: 'RMFPolyline',
      moduleName: 'RMFPolyline',
      commandName: name,
      args,
      reactTag: this._getHandle(),
    });
  }

  render() {
    return <RMFPolyline
      {...this.props}
      ref={this._ref}
      onPress={this._onPress}
    />;
  }
}

MFPolyline.propTypes = propTypes;

var RMFPolyline = requireNativeComponent(`RMFPolyline`, MFPolyline);

export { MFPolyline }
