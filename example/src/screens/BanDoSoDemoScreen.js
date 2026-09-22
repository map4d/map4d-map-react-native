import { configureMFBanDoSo, MFBanDoSo } from 'react-native-map4d-map-dtqg';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

configureMFBanDoSo({ apiHost: 'https://cmcdtqg-gateway.dieuhanhso.vn' });

const INITIAL_CAMERA = {
  center: {
    latitude: 16.157436,
    longitude: 106.243699,
  },
  zoom: 6,
  bearing: 0,
  tilt: 0,
};

function BanDoSoScreen() {
  const onDataSourceFeaturePress = async (e) => {
    console.log('Press Data Source Feature:', e.nativeEvent);
  };

  // No 'top' edge: this screen is shown with a native-stack header, which
  // already accounts for the status bar. Adding it here would inset the map a
  // second time and leave a strip of background above it.
  return (
    <SafeAreaView style={styles.safeView} edges={['left', 'right', 'bottom']}>
      <MFBanDoSo
        style={styles.container}
        camera={INITIAL_CAMERA}
        mapType="roadmap"
        isStaging={true}
        onDataSourceFeaturePress={onDataSourceFeaturePress}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});

export default BanDoSoScreen;
