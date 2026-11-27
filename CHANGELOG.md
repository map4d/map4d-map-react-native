## 3.1.0

### Added

* Support React Native New Architecture with a `Map4dMap` TurboModule codegen spec and native module implementations on Android and iOS.
* Resolve native modules through `TurboModuleRegistry`, with fallback to legacy `NativeModules`.
* Add `getMapStyle()` to `MFMapView` and the native map modules.
* Add internal helpers for managed polygons, markers, and directions, with map layout tracking for overlays.

### Changed

* [Android] Integrate the React Native Gradle plugin and generated codegen sources for New Architecture builds; raise default compile and target SDK versions to 33.
* [iOS] Integrate React Native codegen dependencies in the library podspec.

### Fixed

* Route native view commands and Android events through APIs compatible with the New Architecture.
* Improve native map method availability checks and iOS view lookup error handling.

## 3.0.0

Changed the approach to 3D mode.
Instead of requiring the 3D map type to render 3D objects, developers can now manually enable or disable 3D buildings via the `showsBuildings` property.
This feature is supported on both `roadmap` and `hybrid` map types, allowing full customization of the map style even when 3D rendering is enabled.

* Support set map style by `mapStyle` property of the `MFMapView`
* Add `hybrid` map type

### Breaking changes

* The map type `raster`, `map3D` has been removed
* The `enable3DMode` and `is3DMode` method has been removed from `MFMapView`. 3D buildings can now be shown using the `showsBuildings` property of the `MFMapView`
* The `onModeChange`, `onShouldChangeMapMode`, `onReachLimitedZoom` callback has been removed from the `MFMapView`

## 2.8.0

* [iOS] Remove bitcode
* [iOS] Support iOS >= 11

## 2.7.0

* Add mapID prop & onDataSourceFeaturePress callback
* Update version Map4dMap SDK to 2.6+

## 2.6.3

### Changed

* Change ViewPropTypes, ColorPropType export from deprecated prop types

## 2.6.2

### Fixed

* [Android] Update to avoid error when build example for react native map4d map sdk
* [Android] Fixed crash app because mapNative was detroyed before removed child Annotations

### 2.6.1

### Fixed

* Fixed crash when long press on cluster item

## 2.6.0

### Changed

* Update version Map4dMap SDK to 2.4+
