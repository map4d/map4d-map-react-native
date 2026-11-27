# react-native-map4d-map
[![map4d](https://img.shields.io/badge/map4d-map-orange)](https://map4d.vn/)
[![platform](https://img.shields.io/badge/platform-reactnative-61dafb.svg)](https://reactnative.dev/)
[![npm](https://img.shields.io/npm/v/react-native-map4d-map)](https://www.npmjs.com/package/react-native-map4d-map)

Map4dMap SDK for React Native

## Installation

```sh
npm install react-native-map4d-map
```

On iOS, install the native dependencies from your app's iOS directory:

```sh
cd ios && pod install
```

Rebuild your Android or iOS app after installation so the native modules are included.

## New Architecture compatibility

The library includes a `Map4dMap` TurboModule codegen spec and native module implementations for Android and iOS. Native module lookup uses `TurboModuleRegistry` with a fallback to legacy `NativeModules` when the TurboModule is unavailable.

Map views continue to use native view managers through React Native's interoperability layer. Existing apps can keep using the exported map components and methods.

## Usage

```javascript
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {MFMapView} from 'react-native-map4d-map';

export default function App() {
  return (
    <View style={styles.container}>
      <MFMapView
        style={styles.container}
        mapType="roadmap"
        showsBuildings={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

## Samples

<https://github.com/map4d/react-native-samples>
