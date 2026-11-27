package com.reactnativemap4dmap;

import java.util.Arrays;
import java.util.List;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import com.reactnativemap4dmap.clustering.RMFClusterItemManager;
import com.reactnativemap4dmap.clustering.RMFMarkerClusterManager;

public class Map4dMapPackage implements ReactPackage {
    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        return Arrays.<NativeModule>asList(
            new Map4dMapModule(reactContext)
            );
    }

    @Override
    public List<ViewManager> createViewManagers(
                              ReactApplicationContext reactContext) {
      return Arrays.<ViewManager>asList(
        new Map4dMapViewManager(),
        new RMFMapViewManager(reactContext),
        new RMFMarkerManager(reactContext),
        new RMFCircleManager(),
        new RMFPolylineManager(reactContext),
        new RMFPOIManager(),
        new RMFPolygonManager(reactContext),
        new RMFBuildingManager(),
        new RMFDirectionsRendererManager(reactContext),
        new RMFTileOverlayManager(),
        new RMFMarkerClusterManager(),
        new RMFClusterItemManager()
      );
    }
}
