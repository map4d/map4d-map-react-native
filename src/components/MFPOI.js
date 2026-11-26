import PropTypes from 'prop-types';
import React from 'react';
import {ViewPropTypes, ColorPropType} from 'deprecated-react-native-prop-types';
import {runViewManagerCommand} from '../native/ViewManagerCommand';
import {
  requireNativeComponent,
  Image,
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
  icon: PropTypes.shape({
    uri: PropTypes.any.isRequired
  }),

  /**
   * zIndex
   */
  zIndex: PropTypes.number,

  /**
   * visible
   */
  //TODO
  // visible: PropTypes.bool,

  /**
   * userData
   */
  userData:PropTypes.object,

  /**
   * Callback that is called when the user presses on the POI
   */
  onPress: PropTypes.func,
};

class MFPOI extends React.Component {
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
    this.poi = ref;
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
    let uri = Image.resolveAssetSource(icon.uri) || { uri: icon.uri }
    this._runCommand("setIcon", [ { uri: uri.uri } ])
  }
  setZIndex(zIndex) {
    this._runCommand("setZIndex", [zIndex])
  }
  // setVisible(visible) {
  //   this._runCommand("setVisible", [visible])
  // }
  setUserData(userData) {
    this._runCommand("setUserData", [userData])
  }

  _getHandle() {
    return findNodeHandle(this.poi);
  }


  _runCommand(name, args) {
    return runViewManagerCommand({
      componentName: 'RMFPOI',
      moduleName: 'RMFPOI',
      commandName: name,
      args,
      reactTag: this._getHandle(),
    });
  }

  render() {
    let icon = {}
    if (this.props.icon) {
      let uri = Image.resolveAssetSource(this.props.icon.uri) || {uri: this.props.icon.uri}
      icon = { uri: uri.uri }
    }
    return <RMFPOI
      {...this.props}
      icon={icon}
      ref={this._ref}
      onPress={this._onPress}
    />;
  }
}

MFPOI.propTypes = propTypes;

var RMFPOI = requireNativeComponent(`RMFPOI`, MFPOI);

export {MFPOI}
