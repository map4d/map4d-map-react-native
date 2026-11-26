import {MFMapView, MFBuilding} from 'react-native-map4d-map';
import React from 'react';
import {StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

function App() {
  const camera = {latitude: 16.103254, longitude: 108.214835}

  const onDataSourceFeaturePress = async (e) => {
    console.log('Press Data Source Feature:', e.nativeEvent)
  }

  
  const onPressBuilding = async (e) => {
    console.log('Press Building:', e.nativeEvent)
  }

  return (
    <>
      <SafeAreaView style={styles.safeView}>
        <MFMapView style={styles.container}
          camera={{
            center: camera,
            zoom: 17,
            bearing: 0,
            tilt: 0,
          }}
          mapType='roadmap'
          ref={ref => map = ref}
          onDataSourceFeaturePress={onDataSourceFeaturePress}
        >
          <MFBuilding
            onPress={onPressBuilding}
            coordinate={{
              latitude: 16.103254,
              longitude: 108.214835,
            }}
            modelUrl="https://maptile.s3-sgn10.fptcloud.com/sdk/models/5db6b4798b4711141457d8a9.obj"
            textureUrl="https://maptile.s3-sgn10.fptcloud.com/sdk/textures/5db6b4798b4711141457d8ab.jpg"
            name="Building test"
            />
        </MFMapView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});

export default App;