import PropTypes from 'prop-types';
import React from 'react';
import {ViewPropTypes} from 'deprecated-react-native-prop-types';
import {runViewManagerCommand} from '../native/ViewManagerCommand';
import {
  requireNativeComponent,
  StyleSheet,
  Image,
  findNodeHandle
} from 'react-native';

// if ViewPropTypes is not defined fall back to View.propType (to support RN < 0.44)
const viewPropTypes = ViewPropTypes || View.propTypes;

const propTypes = {
  ...viewPropTypes,

  /**
   * The coordinate for the marker.
   */
  coordinate: PropTypes.shape({
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
  }).isRequired,

  /**
   * Default value is `false`
   */
  draggable: PropTypes.bool,

  /**
   * Sets the ground anchor point for the marker.
   */
  anchor: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }),

  /**
   * 
   */
  elevation: PropTypes.number,

  /**
   * 
   */
  rotation: PropTypes.number,

  /**
   * Sets the infor window anchor point for the marker.
   */
  infoWindowAnchor: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }),

  /**
   * The title of the marker.
   */
  title: PropTypes.string,

  /**
   * The snippet of the marker.
   */
  snippet: PropTypes.string,

  /**
   * Marker icon to render.
   */
  icon: PropTypes.shape({
    uri: PropTypes.any.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }),


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
   * Callback that is called when the user presses on the marker
   */
  onPress: PropTypes.func,

  /**
   * Callback that is called when the user presses on the info window
   */
  onPressInfoWindow: PropTypes.func,

  /**
   * Callback that is called when the user initiates a drag on this marker (if it is draggable)
   */
  onDragStart: PropTypes.func,

  /**
   * Callback called continuously as the marker is dragged
   */
  onDrag: PropTypes.func,

  /**
   * Callback that is called when a drag on this marker finishes. This is usually the point you
   * will want to setState on the marker's coordinate again
   */
  onDragEnd: PropTypes.func,
};


class MFMarker extends React.Component {
    constructor(props) {
      super(props);      
      this._onPress = this._onPress.bind(this)
      this._ref = this._ref.bind(this)
    }

    setCoordinate(location) {
        this._runCommand("setCoordinate", [location])
    }

    setRotation(rotation) {
      this._runCommand("setRotation", [rotation])
    }

    setTitle(title) {
      this._runCommand("setTitle", [title])
    }

    setSnippet(snippet) {
      this._runCommand("setSnippet", [snippet])
    }

    setDraggable(draggable) {
      this._runCommand("setDraggable", [draggable])
    }

    setZIndex(zIndex) {
      this._runCommand("setZIndex", [zIndex])
    }

    setVisible(visible) {
      this._runCommand("setVisible", [visible])
    }

    setInfoWindowAnchor(anchor) {
      this._runCommand("setInfoWindowAnchor", [anchor])
    }

    setElevation(elevation) {
      this._runCommand("setElevation", [elevation])
    }

    setUserData(userData) {
      this._runCommand("setUserData", [userData])
    }

    _getHandle() {
        return findNodeHandle(this.marker);
      }


    _runCommand(name, args) {
      return runViewManagerCommand({
        componentName: 'RMFMarker',
        moduleName: 'RMFMarker',
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
        this.marker = ref;
      }

      render() {
        let icon = {};
        if (this.props.icon) {
          let uri = Image.resolveAssetSource(this.props.icon.uri) || {uri: this.props.icon.uri};
          icon = {uri: uri.uri, width: this.props.icon.width, height: this.props.icon.height}
        }
        return <RMFMarker
          {...this.props}
          icon={icon}
          ref={this._ref}
          style={[styles.marker, this.props.style]}
          onPress={this._onPress}
        />;
      }
}

MFMarker.propTypes = propTypes;
var RMFMarker = requireNativeComponent(`RMFMarker`, MFMarker);

const styles = StyleSheet.create({
  marker: {
    position: 'absolute'
  },
});

export {MFMarker}
