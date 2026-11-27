import PropTypes from 'prop-types';
import React from 'react';
import {ViewPropTypes} from 'deprecated-react-native-prop-types';
import {
  requireNativeComponent,
  Platform,
  NativeModules,
  findNodeHandle
} from 'react-native';

// if ViewPropTypes is not defined fall back to View.propType (to support RN < 0.44)
const viewPropTypes = ViewPropTypes || View.propTypes;

const propTypes = {
  ...viewPropTypes,

  // algorithm: PropTypes.string,

  /**
   * Callback that is called when the user presses on the marker cluster
   */
  onPressCluster: PropTypes.func,
};


class MFMarkerCluster extends React.Component {
  constructor(props) {
    super(props);      
    this._onPressCluster = this._onPressCluster.bind(this)
    this._ref = this._ref.bind(this)
  }

  _getHandle() {
    return findNodeHandle(this.cluster);
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
    const componentName = "RMFMarkerCluster";

    if (!UIManager.getViewManagerConfig) {
      // RN < 0.58
      return UIManager[componentName].Commands[name];
    }

    // RN >= 0.58        
    return UIManager.getViewManagerConfig(componentName).Commands[name];
  }
    
  _mapManagerCommand(name) {
    return NativeModules[`RMFMarkerCluster`][name];
  }

  _onPressCluster(event) {
    event.stopPropagation();
      if (this.props.onPressCluster) {
        this.props.onPressCluster(event);
    }
  }

  _ref(ref) {
    this.cluster = ref;
  }

  render() {
    console.log('RMFMarkerCluster | render')
    return <RMFMarkerCluster
      {...this.props}
      ref={this._ref}
      onPressCluster={this._onPressCluster}
    />;
  }
}

MFMarkerCluster.propTypes = propTypes;
var RMFMarkerCluster = requireNativeComponent(`RMFMarkerCluster`, MFMarkerCluster);

export {MFMarkerCluster}
