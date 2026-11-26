import PropTypes from 'prop-types';
import React from 'react';
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
   * The coordinate of the center of the circle
   */
  center: PropTypes.shape({
    /**
     * Coordinates for the center of the circle.
     */
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
  }).isRequired,

  /**
   * The radius of the circle to be drawn (in meters)
   */
  radius: PropTypes.number.isRequired,

  /**
   * The stroke width to use for the circle.
   */
  strokeWidth: PropTypes.number,

  /**
   * The stroke color to use for the circle.
   */
  strokeColor: ColorPropType,

  /**
   * The fill color to use for the circle.
   */
  fillColor: ColorPropType,

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
   * Callback that is called when the user presses on the circle
   */
  onPress: PropTypes.func,
};

// const defaultProps = {
//   strokeColor: '#000',
//   strokeWidth: 1,
// };

class MFCircle extends React.Component {
  constructor(props) {
    super(props);
    this._onPress = this._onPress.bind(this)
    this._ref = this._ref.bind(this)
  }

  setCenter(center) {
    this._runCommand("setCenter", [center])
  }
  setRadius(radius) {
    this._runCommand("setRadius", [radius])
  }
  setFillColor(color) {
    this._runCommand("setFillColor", [processColor(color)])
  }
  setStrokeColor(color) {
    this._runCommand("setStrokeColor", [processColor(color)])
  }
  setStrokeWidth(width) {
    this._runCommand("setStrokeWidth", [width])
  }
  setUserData(userData) {
    this._runCommand("setUserData", [userData])
  }
  setZIndex(zIndex) {
    this._runCommand("setZIndex", [zIndex])
  }
  setVisible(visible) {
    this._runCommand("setVisible", [visible])
  }

  _getHandle() {
    return findNodeHandle(this.circle);
  }


  _runCommand(name, args) {
    return runViewManagerCommand({
      componentName: 'RMFCircle',
      moduleName: 'RMFCircle',
      commandName: name,
      args,
      reactTag: this._getHandle(),
    });
  }

  _onPress(event) {
    event.stopPropagation();
      if (this.props.onPress) {
        this.props.onPress(event);
    }
  }

  _ref(ref) {
    this.circle = ref;
  }

  render() {
    return <RMFCircle
      {...this.props}
      ref={this._ref}
      onPress={this._onPress}
    />;
  }
}

MFCircle.propTypes = propTypes;
// MFCircle.defaultProps = defaultProps;

var RMFCircle = requireNativeComponent(`RMFCircle`, MFCircle);

export {MFCircle}
