# react-native-map4d-map

Map4dMap SDK for React Native

## Installation

```sh
npm install react-native-map4d-map
```

## TurboModule compatibility

This library supports React Native New Architecture module resolution for `Map4dMap` by using `TurboModuleRegistry` with automatic fallback to `NativeModules`.

The package now also includes a TurboModule codegen spec (`src/specs/NativeMap4dMap.js`) and `codegenConfig` in `package.json` so React Native apps can generate module bindings in New Architecture builds.

What this means:
- On React Native apps with New Architecture enabled, map native module lookup works with TurboModule resolution.
- On older React Native versions, the library keeps using legacy bridge resolution.
- No public JavaScript API changes are required for existing apps.
- Native `Map4dMap` APIs (`getCamera`, `getBounds`, `getMyLocation`, `pointForCoordinate`, `coordinateForPoint`, `cameraForBounds`) are implemented in both Android and iOS modules to align with the TurboModule spec.

## Usage

```javascript
import {MFMapView} from 'react-native-map4d-map';
import React from 'react';
import {
  SafeAreaView,
  StyleSheet
} from 'react-native';

function App() {
  return (
    <>
      <SafeAreaView style={styles.safeView}>
        <MFMapView style={styles.container}/>
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
```

## Samples

https://github.com/map4d/react-native-samples
