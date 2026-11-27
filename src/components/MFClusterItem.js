import PropTypes from 'prop-types';
import React from 'react';
import {ViewPropTypes} from 'deprecated-react-native-prop-types';
import {
  requireNativeComponent,
  StyleSheet,
  Platform,
  Image,
  NativeModules,
  findNodeHandle
} from 'react-native';

// if ViewPropTypes is not defined fall back to View.propType (to support RN < 0.44)
const viewPropTypes = ViewPropTypes || View.propTypes;

const propTypes = {
  ...viewPropTypes,

  /**
   * The coordinate for the marker cluster item.
   */
  coordinate: PropTypes.shape({
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
  }).isRequired,

  /**
   * The title of the marker cluster item.
   */
  title: PropTypes.string,

  /**
   * The snippet of the marker cluster item.
   */
  snippet: PropTypes.string,

  /**
   * Callback that is called when the user presses on the marker cluster item.
   */
  onPress: PropTypes.func,

  /**
   * Callback that is called when the user presses on the info window of marker cluster item.
   */
  onPressInfoWindow: PropTypes.func,
};


class MFClusterItem extends React.Component {
  constructor(props) {
    super(props);
    this._onPress = this._onPress.bind(this)
    this._ref = this._ref.bind(this)
  }

  _getHandle() {
    return findNodeHandle(this.clusterItem);
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
        //this.getMapManagerCommand(name)(this._getHandle(), ...args);
        this._mapManagerCommand(name)(this._getHandle(), ...args);
        break;

      default:
        break;
    }
  }

  _uiManagerCommand(name) {
    const UIManager = NativeModules.UIManager;
    const componentName = "RMFClusterItem";

    if (!UIManager.getViewManagerConfig) {
      // RN < 0.58
      return UIManager[componentName].Commands[name];
    }

    // RN >= 0.58        
    return UIManager.getViewManagerConfig(componentName).Commands[name];
  }

  _mapManagerCommand(name) {
    return NativeModules[`RMFClusterItem`][name];
  }

  _onPress(event) {
    event.stopPropagation();
    if (this.props.onPress) {
      this.props.onPress(event);
    }
  }

  _ref(ref) {
    this.clusterItem = ref;
  }

  render() {
    return <RMFClusterItem
      {...this.props}
      ref={this._ref}
      onPress={this._onPress}
    />;
  }
}

MFClusterItem.propTypes = propTypes;
var RMFClusterItem = requireNativeComponent(`RMFClusterItem`, MFClusterItem);

export { MFClusterItem }
