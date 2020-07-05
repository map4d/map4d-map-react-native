import PropTypes from 'prop-types';
import React from 'react';
import {
  requireNativeComponent,
  Platform,
  NativeModules,
  ViewPropTypes,
  ColorPropType,
  findNodeHandle,
  processColor
} from 'react-native';

// if ViewPropTypes is not defined fall back to View.propType (to support RN < 0.44)
const viewPropTypes = ViewPropTypes || View.propTypes;

const propTypes = {
  ...viewPropTypes,

    /**
   * The coordinate for the POI.
   */
  coordinate: PropTypes.shape({
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
  }).isRequired,

  /**
   * The title of the POI.
   */
  title: PropTypes.string,

  /**
   * The color of the title.
   */
  titleColor: ColorPropType,

  /**
   * The subtile of the POI.
   */
  subtitle: PropTypes.string,

  /**
   * The type of POI
   */
  //poiType: PropTypes.oneOf(['cafe', 'atm', 'bank']),
  poiType: PropTypes.string,

  /**
   * POI icon to render.
   */
  icon: PropTypes.any,

  /**
   * Callback that is called when the user presses on the POI
   */
  onPress: PropTypes.func,
};

class MFPOI extends React.Component {
  constructor(props) {
    super(props);
  }

  setCoordinate(coordinate) {
    this._runCommand("setCoordinate", [coordinate])
  }
  setTitle(title) {
    this._runCommand("setTitle", [title])
  }
  setTitleColor(color) {
    this._runCommand("setTitleColor", [processColor(color)])
  }
  setSubTitle(subtitle) {
    this._runCommand("setSubTitle", [subtitle])
  }
  setPoiType(type) {
    this._runCommand("setPoiType", [type])
  }
  setIcon(icon) {
    this._runCommand("setIcon", [icon])
  }

  _getHandle() {
    return findNodeHandle(this.poi);
  }


  _runCommand(name, args) {
    switch (Platform.OS) {
      case 'android':
        NativeModules.UIManager.dispatchViewManagerCommand(
          this._getHandle(),
          this._uiManagerCommand(name),
          args
        );
        break;

      case 'ios':
        this._mapManagerCommand(name)(this._getHandle(), ...args);
        break;

      default:
        break;
    }
  }

  _uiManagerCommand(name) {
    const UIManager = NativeModules.UIManager;
    const componentName = "RMFPOI";

    if (!UIManager.getViewManagerConfig) {
      // RN < 0.58
      return UIManager[componentName].Commands[name];
    }

    // RN >= 0.58        
    return UIManager.getViewManagerConfig(componentName).Commands[name];
  }
  
  _mapManagerCommand(name) {
    return NativeModules[`RMFPOI`][name];
  }

  render() {
    let icon = {};
    if (this.props.icon) {
      icon = Image.resolveAssetSource(this.props.icon) || {};
    }
    return <RMFPOI
      {...this.props}
      icon={icon.uri}
      ref={ref => {this.poi = ref;}}
      onPress={event => {
        if (this.props.onPress) {
          this.props.onPress(event);
        }
      }}
    />;
  }
}

MFPOI.propTypes = propTypes;

var RMFPOI = requireNativeComponent(`RMFPOI`, MFPOI);

export {MFPOI}
