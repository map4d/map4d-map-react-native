package com.reactnativemap4dmap;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.UIManager;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.uimanager.NativeViewHierarchyManager;
import com.facebook.react.uimanager.UIBlock;
import com.facebook.react.uimanager.UIManagerHelper;
import com.facebook.react.uimanager.UIManagerModule;

import android.view.View;
import android.util.Log;
import android.graphics.Point;
import android.location.Location;

import vn.map4d.map.camera.MFCameraPosition;
import vn.map4d.map.core.*;
import vn.map4d.types.MFLocationCoordinate;

interface ResolveViewCallback {
  void found(View view);
}

public class Map4dMapModule extends ReactContextBaseJavaModule {

  public static final String NAME = "Map4dMap";

    private final ReactApplicationContext reactContext;

    public Map4dMapModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
      return NAME;
    }

    private void getView(final int tag, final ResolveViewCallback callback) {
      final ReactApplicationContext context = getReactApplicationContext();

      final UIManager uiManager = UIManagerHelper.getUIManagerForReactTag(context, tag);
      if (uiManager != null) {
        UiThreadUtil.runOnUiThread(new Runnable() {
          @Override
          public void run() {
            View view = uiManager.resolveView(tag);
            if (view == null) {
              Log.e(getName(), "View with tag: " + tag + " was not found");
            }
            callback.found(view);
          }
        });
        return;
      }

      UIManagerModule legacyUIManager = context.getNativeModule(UIManagerModule.class);
      if (legacyUIManager == null) {
        Log.e(getName(), "Could not get UIManager to resolve tag: " + tag);
        callback.found(null);
        return;
      }

      legacyUIManager.addUIBlock(new UIBlock()
      {
        @Override
        public void execute(NativeViewHierarchyManager nvhm)
        {
          View view = nvhm.resolveView(tag);
          if (view == null) {
            Log.e(getName(), "View with tag: " + tag + " was not found");
          }
          callback.found(view);
        }
      });
    }

  @ReactMethod
  public void getCamera(final int tag, final Promise promise) {
    getView(tag, new ResolveViewCallback() {
      @Override
      public void found(View view) {
        RMFMapView mapView = (RMFMapView) view;
        if (!validateMapView(mapView, promise)) {
          return;
        }
        MFCameraPosition position = mapView.map.getCameraPosition();

        WritableMap centerJson = new WritableNativeMap();
        centerJson.putDouble("latitude", position.getTarget().getLatitude());
        centerJson.putDouble("longitude", position.getTarget().getLongitude());

        WritableMap cameraJson = new WritableNativeMap();
        cameraJson.putMap("center", centerJson);
        cameraJson.putDouble("bearing", (double)position.getBearing());
        cameraJson.putDouble("zoom", (double)position.getZoom());
        cameraJson.putDouble("tilt", (double)position.getTilt());

        promise.resolve(cameraJson);
      }
    });
  }

  @ReactMethod
  public void getBounds(final int tag, final Promise promise) {
    getView(tag, new ResolveViewCallback() {
      @Override
      public void found(View view) {
        RMFMapView mapView = (RMFMapView) view;
        if (!validateMapView(mapView, promise)) {
          return;
        }
        MFCoordinateBounds bounds = mapView.map.getBounds();
        WritableMap boundsJson = new WritableNativeMap();
        if (bounds == null) {
          boundsJson.putNull("southWest");
          boundsJson.putNull("northEast");
        }
        else {
          WritableMap southWest = new WritableNativeMap();
          southWest.putDouble("latitude", bounds.getSouthwest().getLatitude());
          southWest.putDouble("longitude", bounds.getSouthwest().getLongitude());

          WritableMap northEast = new WritableNativeMap();
          northEast.putDouble("latitude", bounds.getNortheast().getLatitude());
          northEast.putDouble("longitude", bounds.getNortheast().getLongitude());

          boundsJson.putMap("southWest", southWest);
          boundsJson.putMap("northEast", northEast);
        }
        promise.resolve(boundsJson);
      }
    });
  }

  @ReactMethod
  public void getMyLocation(final int tag, final Promise promise) {
    getView(tag, new ResolveViewCallback() {
      @Override
      public void found(View view) {
        RMFMapView mapView = (RMFMapView) view;
        if (!validateMapView(mapView, promise)) {
          return;
        }
        Location location = mapView.map.getMyLocation();

        WritableMap locationJson = new WritableNativeMap();
        if (location == null) {
          locationJson.putNull("coordinate");
          locationJson.putNull("altitude");
          locationJson.putNull("timestamp");
          locationJson.putNull("accuracy");
          locationJson.putNull("altitudeAccuracy");
          locationJson.putNull("speed");
          locationJson.putNull("heading");
        }
        else {
          WritableMap coordinateJson = new WritableNativeMap();
          coordinateJson.putDouble("latitude", location.getLatitude());
          coordinateJson.putDouble("longitude", location.getLongitude());
          locationJson.putMap("coordinate", coordinateJson);
          locationJson.putDouble("altitude", location.getAltitude());
          locationJson.putDouble("timestamp", location.getTime());
          locationJson.putDouble("accuracy", location.getAccuracy());
          locationJson.putDouble("altitudeAccuracy", location.getAccuracy());
          locationJson.putDouble("speed", location.getSpeed());
          locationJson.putDouble("heading", location.getBearing());
        }
        promise.resolve(locationJson);
      }
    });
  }

  @ReactMethod
  public void isMyLocationButtonEnabled(final int tag, final Promise promise) {
    getView(tag, new ResolveViewCallback(){
      @Override
      public void found(View view) {
        RMFMapView mapView = (RMFMapView) view;
        if (!validateMapView(mapView, promise)) {
          return;
        }
        promise.resolve(mapView.map.getUiSettings().isMyLocationButtonEnabled());
      }
    });
  }

  @ReactMethod
  public void pointForCoordinate(final int tag, ReadableMap coordinate, final Promise promise) {
    final MFLocationCoordinate coord = new MFLocationCoordinate(
            coordinate.hasKey("latitude") ? coordinate.getDouble("latitude") : 0.0,
            coordinate.hasKey("longitude") ? coordinate.getDouble("longitude") : 0.0
    );

    getView(tag, new ResolveViewCallback() {
      @Override
      public void found(View view) {
        RMFMapView mapView = (RMFMapView) view;
        if (!validateMapView(mapView, promise)) {
          return;
        }

        Point pt = mapView.map.getProjection().pointForCoordinate(coord);

        WritableMap ptJson = new WritableNativeMap();
        ptJson.putInt("x", pt.x);
        ptJson.putInt("y", pt.y);

        promise.resolve(ptJson);
      }
    });
  }

  @ReactMethod
  public void coordinateForPoint(final int tag, ReadableMap point, final Promise promise) {
    final Point pt = new Point(
            point.hasKey("x") ? (int)(point.getDouble("x")) : 0,
            point.hasKey("y") ? (int)(point.getDouble("y")) : 0
    );

    getView(tag, new ResolveViewCallback() {
      @Override
      public void found(View view) {
        RMFMapView mapView = (RMFMapView) view;
        if (!validateMapView(mapView, promise)) {
          return;
        }

        MFLocationCoordinate coord = mapView.map.getProjection().coordinateForPoint(pt);

        WritableMap coordJson = new WritableNativeMap();
        coordJson.putDouble("latitude", coord.getLatitude());
        coordJson.putDouble("longitude", coord.getLongitude());

        promise.resolve(coordJson);
      }
    });
  }

  @ReactMethod
  public void cameraForBounds(final int tag, ReadableMap boundData, final Promise promise) {
    final ReadableMap bounds = boundData.getMap("bounds");
    final ReadableMap padding = boundData.getMap("padding");

    getView(tag, new ResolveViewCallback() {
      @Override
      public void found(View view) {
        RMFMapView mapView = (RMFMapView) view;
        if (!validateMapView(mapView, promise)) {
          return;
        }

        ReadableMap southWest = bounds.getMap("southWest");
        ReadableMap northEast = bounds.getMap("northEast");

        MFCoordinateBounds.Builder builder = new MFCoordinateBounds.Builder();
        if (southWest != null) {
          double southWestLat = southWest.getDouble("latitude");
          double southWestLng = southWest.getDouble("longitude");
          builder.include(new MFLocationCoordinate(southWestLat, southWestLng));
        }

        if (northEast != null) {
          double northEastLat = northEast.getDouble("latitude");
          double northEastLng = northEast.getDouble("longitude");
          builder.include(new MFLocationCoordinate(northEastLat, northEastLng));
        }

        int paddingDefault = 10;
        int paddingLeft = padding != null && padding.hasKey("left") ? padding.getInt("left") : paddingDefault;
        int paddingRight = padding != null && padding.hasKey("right") ? padding.getInt("right") : paddingDefault;
        int paddingTop = padding != null && padding.hasKey("top") ? padding.getInt("top") : paddingDefault;
        int paddingBottom = padding != null && padding.hasKey("bottom") ? padding.getInt("bottom") : paddingDefault;

        MFCameraPosition cameraPosition = mapView.map.getCameraPositionForBounds(
          builder.build(), paddingLeft, paddingTop, paddingRight, paddingBottom);

        WritableMap data = new WritableNativeMap();
        data.putDouble("zoom", cameraPosition.getZoom());
        data.putDouble("bearing", cameraPosition.getBearing());
        data.putDouble("tilt", cameraPosition.getTilt());
        WritableMap target = new WritableNativeMap();
        target.putDouble("latitude", cameraPosition.getTarget().getLatitude());
        target.putDouble("longitude", cameraPosition.getTarget().getLongitude());
        data.putMap("center", target);

        promise.resolve(data);
      }
    });
  }

  private boolean validateMapView(final RMFMapView mapView, final Promise promise) {
    if (mapView == null) {
      promise.reject("Map4D Error", "RMFMapView not found");
      return false;
    }
    if (mapView.map == null) {
      promise.reject("Map4D Error", "RMFMapView.map is not valid");
      return false;
    }
    return true;
  }
}
