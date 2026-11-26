import {MFMapView, MFBuilding} from 'react-native-map4d-map'
import React, {useRef} from 'react'
import {StyleSheet, View, Text, Button, Alert, Platform, ToastAndroid} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

function BasicMapScreen() {
  const mapRef = useRef(null)
  const camera = {latitude: 16.088377222167768, longitude: 108.22961691829235}

  const showMessage = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT)
      return
    }
    Alert.alert('Camera', message)
  }

  const onDataSourceFeaturePress = async (e) => {
    console.log('Press Data Source Feature:', e.nativeEvent)
  }

  const onPressBuilding = async (e) => {
    console.log('Press Building:', e.nativeEvent)
  }

  const onGetCamera = async () => {
    const mapView = mapRef.current
    if (!mapView || typeof mapView.getCamera !== 'function') {
      showMessage('Map chua san sang')
      return
    }

    try {
      const camera = await mapView.getCamera()
      const center = camera?.center || camera?.target || {}
      const lat = Number(center.latitude || 0).toFixed(6)
      const lng = Number(center.longitude || 0).toFixed(6)
      const zoom = Number(camera?.zoom || 0).toFixed(2)
      const tilt = Number(camera?.tilt || 0).toFixed(2)
      const bearing = Number(camera?.bearing || 0).toFixed(2)
      showMessage(`Lat: ${lat}, Lng: ${lng}, Zoom: ${zoom}, Tilt: ${tilt}, Bearing: ${bearing}`)
    } catch (error) {
      console.warn('getCamera failed:', error)
      showMessage('getCamera failed')
    }
  }

  return (
    <SafeAreaView style={styles.safeView} edges={['left', 'right', 'bottom']}>
      <View style={styles.topActions}>
        <Button title="Get Camera" onPress={onGetCamera} />
      </View>

      <MFMapView
        style={styles.container}
        ref={mapRef}
        camera={{
          center: camera,
          zoom: 15,
          bearing: 0,
          tilt: 0,
        }}
        mapType="roadmap"
        onDataSourceFeaturePress={onDataSourceFeaturePress}
      >
        <MFBuilding
          onPress={onPressBuilding}
          coordinate={{
            latitude: 16.088377222167768,
            longitude: 108.22961691829235,
          }}
          modelUrl="https://maptile.s3-sgn10.fptcloud.com/sdk/models/5db6b4798b4711141457d8a9.obj"
          textureUrl="https://maptile.s3-sgn10.fptcloud.com/sdk/textures/5db6b4798b4711141457d8ab.jpg"
          name="Building test"
        />
      </MFMapView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeView: {
    flex: 1,
    backgroundColor: '#eef2f7',
  },
  container: {
    flex: 1,
  },
  topActions: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    zIndex: 3,
    elevation: 3,
  },
})

export default BasicMapScreen