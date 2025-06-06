package com.reactnativemap4dmap;

import static androidx.core.content.PermissionChecker.checkSelfPermission;

import android.content.Context;
import android.graphics.Point;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.core.content.PermissionChecker;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.ThemedReactContext;

import java.util.Date;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import vn.map4d.map.core.*;
import vn.map4d.map.camera.*;
import vn.map4d.map.annotations.*;
import vn.map4d.map.overlays.MFTileOverlay;
import vn.map4d.types.MFLocationCoordinate;
import vn.map4d.utils.android.collections.MFMarkerManager;

public class RMFMapView extends MFMapView implements OnMapReadyCallback {

  public Map4D map;

  private boolean showUserLocation = false;

  private static final String[] PERMISSIONS = new String[]{
    "android.permission.ACCESS_FINE_LOCATION", "android.permission.ACCESS_COARSE_LOCATION"};

  private RMFMapViewManager manager;
  private LifecycleEventListener lifecycleListener;
  private boolean paused = false;
  private boolean destroyed = false;
  private final ThemedReactContext context;
  private final List<RMFFeature> features = new ArrayList<>();
  private final Map<MFMarker, RMFMarker> markerMap = new HashMap<>();
  private final Map<MFCircle, RMFCircle> circleMap = new HashMap<>();
  private final Map<MFPolyline, RMFPolyline> polylineMap = new HashMap<>();
  private final Map<MFPolygon, RMFPolygon> polygonMap = new HashMap<>();
  private final Map<MFBuilding, RMFBuilding> buildingMap = new HashMap<>();
  private final Map<Long, RMFPOI> poiMap = new HashMap<>();
  private final Map<MFTileOverlay, RMFTileOverlay> tileOverlayMap = new HashMap<>();
  private final Map<MFDirectionsRenderer, RMFDirectionsRenderer> directionsRendererMap = new HashMap<>();

  private MFMarkerManager.Collection markerCollection;

  private ViewAttacherGroup attacherGroup;

  private float touchPointX = 0.f;
  private float touchPointY = 0.f;
  private float dragPointX = 0.f;
  private float dragPointY = 0.f;

  private static boolean contextHasBug(Context context) {
    return context == null ||
      context.getResources() == null ||
      context.getResources().getConfiguration() == null;
  }

  private static Context getNonBuggyContext(ThemedReactContext reactContext,
                                            ReactApplicationContext appContext) {
    Context superContext = reactContext;
    if (!contextHasBug(appContext.getCurrentActivity())) {
      superContext = appContext.getCurrentActivity();
    } else if (contextHasBug(superContext)) {
      // we have the bug! let's try to find a better context to use
      if (!contextHasBug(reactContext.getCurrentActivity())) {
        superContext = reactContext.getCurrentActivity();
      } else if (!contextHasBug(reactContext.getApplicationContext())) {
        superContext = reactContext.getApplicationContext();
      } else {
      }
    }
    return superContext;
  }

  public RMFMapView(ThemedReactContext reactContext, ReactApplicationContext appContext, RMFMapViewManager manager) {
    super(getNonBuggyContext(reactContext, appContext), null);
    this.manager = manager;
    this.context = reactContext;

    super.onCreate(null);
    super.onStart();
    this.getMapAsync(this);

    // Set up a parent view for triggering visibility in subviews that depend on it.
    // Mainly ReactImageView depends on Fresco which depends on onVisibilityChanged() event
    attacherGroup = new ViewAttacherGroup(context);
    LayoutParams attacherLayoutParams = new LayoutParams(0, 0);
    attacherLayoutParams.width = 0;
    attacherLayoutParams.height = 0;
    attacherLayoutParams.leftMargin = 99999999;
    attacherLayoutParams.topMargin = 99999999;
    attacherGroup.setLayoutParams(attacherLayoutParams);
    addView(attacherGroup);
  }

  @Override
  public boolean onTouchEvent(MotionEvent event) {
    if (event.getAction() == MotionEvent.ACTION_DOWN) {
      touchPointX = event.getX();
      touchPointY = event.getY();
    }
    if (event.getAction() == MotionEvent.ACTION_MOVE) {
      dragPointX = event.getX();
      dragPointY = event.getY();
    }
    return super.onTouchEvent(event);
  }

  @Override
  public void onMapReady(final Map4D map) {
    if (destroyed) {
      return;
    }
    this.map = map;
    final RMFMapView view = this;
    MFMarkerManager markerManager = new MFMarkerManager(map);
    markerCollection = markerManager.newCollection();

    manager.pushEvent(getContext(), this, "onMapReady", new WritableNativeMap());

    markerCollection.setOnMarkerDragListener((new Map4D.OnMarkerDragListener() {
      @Override
      public void onMarkerDrag(MFMarker marker) {
        RMFMarker rctMarker = markerMap.get(marker);
        if (rctMarker == null) {
          return;
        }

        //Event for MFMapView
        WritableMap event = getMarkerEventData(marker, dragPointX, dragPointY);
        event.putString("action", "marker-drag");
        manager.pushEvent(getContext(), view, "onMarkerDrag", event);

        //Event for MFMarker
        event = getMarkerEventData(marker, dragPointX, dragPointY);
        event.putString("action", "marker-drag");
        manager.pushEvent(getContext(), rctMarker, "onDrag", event);
      }

      @Override
      public void onMarkerDragEnd(MFMarker marker) {
        RMFMarker rctMarker = markerMap.get(marker);
        if (rctMarker == null) {
          return;
        }
        WritableMap event = getMarkerEventData(marker, dragPointX, dragPointY);
        event.putString("action", "marker-drag-end");
        manager.pushEvent(getContext(), view, "onMarkerDrag", event);

        event = getMarkerEventData(marker, dragPointX, dragPointY);
        event.putString("action", "marker-drag-end");
        manager.pushEvent(getContext(), rctMarker, "onDragEnd", event);
      }

      @Override
      public void onMarkerDragStart(MFMarker marker) {
        RMFMarker rctMarker = markerMap.get(marker);
        if (rctMarker == null) {
          return;
        }
        WritableMap event = getMarkerEventData(marker, touchPointX, touchPointY);
        event.putString("action", "marker-drag-start");
        manager.pushEvent(getContext(), view, "onMarkerDrag", event);

        event = getMarkerEventData(marker, touchPointX, touchPointY);
        event.putString("action", "marker-drag-start");
        manager.pushEvent(getContext(), rctMarker, "onDragStart", event);
      }
    }));

    markerCollection.setOnMarkerClickListener(new Map4D.OnMarkerClickListener() {
      @Override
      public boolean onMarkerClick(MFMarker marker) {
        RMFMarker rctMarker = markerMap.get(marker);
        if (rctMarker == null) {
          return false;
        }
        WritableMap event = getMarkerEventData(marker, touchPointX, touchPointY);
        event.putString("action", "marker-press");
        manager.pushEvent(getContext(), view, "onMarkerPress", event);

        event = getMarkerEventData(marker, touchPointX, touchPointY);
        event.putString("action", "marker-press");
        manager.pushEvent(getContext(), rctMarker, "onPress", event);
        return false;
      }
    });

    markerCollection.setOnInfoWindowClickListener(new Map4D.OnInfoWindowClickListener() {
      @Override
      public void onInfoWindowClick(@NonNull MFMarker marker) {
        RMFMarker rctMarker = markerMap.get(marker);
        if (rctMarker == null) {
          return;
        }
        WritableMap event = getMarkerEventData(marker, touchPointX, touchPointY);
        event.putString("action", "marker-info-window-press");
        manager.pushEvent(getContext(), rctMarker, "onPressInfoWindow", event);
      }
    });

    map.setOnPolylineClickListener(new Map4D.OnPolylineClickListener() {
      @Override
      public void onPolylineClick(MFPolyline polyline) {
        RMFPolyline rctPolyline = polylineMap.get(polyline);
        if (rctPolyline == null) {
          return;
        }
        WritableMap event = getPolylineEventData(polyline);
        event.putString("action", "polyline-press");
        manager.pushEvent(getContext(), rctPolyline, "onPress", event);
      }
    });

    map.setOnPolygonClickListener(new Map4D.OnPolygonClickListener() {
      @Override
      public void onPolygonClick(final MFPolygon polygon) {
        RMFPolygon rctPolygon = polygonMap.get(polygon);
        if (rctPolygon == null) {
          return;
        }
        WritableMap event = getPolygonEventData(polygon);
        event.putString("action", "polygon-press");
        manager.pushEvent(getContext(), rctPolygon, "onPress", event);
      }
    });

    map.setOnDirectionsClickListener(new Map4D.OnDirectionsClickListener() {
      @Override
      public void onDirectionsClick(MFDirectionsRenderer directionsRenderer, int i) {
        RMFDirectionsRenderer rctDirectionsRenderer = directionsRendererMap.get(directionsRenderer);
        if (rctDirectionsRenderer == null) {
          return;
        }
        WritableMap event = getDirectionsRendererEventData(directionsRenderer, i);
        event.putString("action", "directions-press");
        manager.pushEvent(getContext(), rctDirectionsRenderer, "onPress", event);
      }
    });

    map.setOnCircleClickListener(new Map4D.OnCircleClickListener() {
      @Override
      public void onCircleClick(MFCircle circle) {
        RMFCircle rctCircle = circleMap.get(circle);
        if (rctCircle == null) {
          return;
        }

        WritableMap event = getCircleEventData(circle);
        event.putString("action", "circle-press");
        manager.pushEvent(getContext(), rctCircle, "onPress", event);
      }
    });

    map.setOnUserBuildingClickListener(building -> {
      RMFBuilding rctBuilding = buildingMap.get(building);
      if (rctBuilding == null) {
        return;
      }

      WritableMap event = getBuildingEventData(building);
      event.putString("action", "building-press");
      manager.pushEvent(getContext(), rctBuilding, "onPress", event);
    });

    map.setOnUserPOIClickListener(new Map4D.OnUserPOIClickListener() {
      @Override
      public void onUserPOIClick(MFPOI poi) {
        RMFPOI rctPOI = poiMap.get(poi.getId());
        if (rctPOI == null) {
          return;
        }

        WritableMap event = getPOIEventData(poi);
        event.putString("action", "poi-press");
        manager.pushEvent(getContext(), rctPOI, "onPress", event);
      }
    });

    map.setOnPOIClickListener(new Map4D.OnPOIClickListener() {
      @Override
      public void onPOIClick(String placeId, String title, MFLocationCoordinate location) {
        WritableMap event = new WritableNativeMap();
        WritableMap locationMap = new WritableNativeMap();

        event.putString("action", "map-poi-press");

        WritableMap poiData = new WritableNativeMap();
        poiData.putString("id", placeId);
        poiData.putString("title", title);
        WritableMap poiLocation = new WritableNativeMap();
        poiLocation.putDouble("latitude", location.getLatitude());
        poiLocation.putDouble("longitude", location.getLongitude());
        poiData.putMap("location", poiLocation);

        WritableMap screenCoordinate = new WritableNativeMap();
        screenCoordinate.putDouble("x", touchPointX);
        screenCoordinate.putDouble("y", touchPointY);

        MFLocationCoordinate coordinate =
          map.getProjection().coordinateForPoint(
            new Point((int) (touchPointX / MapContext.getDensity()), (int) (touchPointY / MapContext.getDensity()))
          );

        locationMap.putDouble("latitude", coordinate.getLatitude());
        locationMap.putDouble("longitude", coordinate.getLongitude());

        event.putMap("poi", poiData);
        event.putMap("location", locationMap);
        event.putMap("pixel", screenCoordinate);

        manager.pushEvent(getContext(), view, "onPoiPress", event);
      }
    });

    map.setOnBuildingClickListener(new Map4D.OnBuildingClickListener() {
      @Override
      public void onBuildingClick(String buildingId, String name, MFLocationCoordinate location) {
        WritableMap event = new WritableNativeMap();
        WritableMap locationMap = new WritableNativeMap();

        event.putString("action", "map-building-press");

        WritableMap buildingData = new WritableNativeMap();
        buildingData.putString("id", buildingId);
        buildingData.putString("name", name);
        WritableMap buildingLocation = new WritableNativeMap();
        buildingLocation.putDouble("latitude", location.getLatitude());
        buildingLocation.putDouble("longitude", location.getLongitude());
        buildingData.putMap("location", buildingLocation);

        WritableMap screenCoordinate = new WritableNativeMap();
        screenCoordinate.putDouble("x", touchPointX);
        screenCoordinate.putDouble("y", touchPointY);

        MFLocationCoordinate coordinate =
          map.getProjection().coordinateForPoint(
            new Point((int) (touchPointX / MapContext.getDensity()), (int) (touchPointY / MapContext.getDensity()))
          );

        locationMap.putDouble("latitude", coordinate.getLatitude());
        locationMap.putDouble("longitude", coordinate.getLongitude());

        event.putMap("building", buildingData);
        event.putMap("location", locationMap);
        event.putMap("pixel", screenCoordinate);

        manager.pushEvent(getContext(), view, "onBuildingPress", event);
      }
    });

    map.setOnPlaceClickListener(new Map4D.OnPlaceClickListener() {
      @Override
      public void onPlaceClick(@NonNull String name, @NonNull MFLocationCoordinate location) {
        WritableMap event = new WritableNativeMap();
        WritableMap locationMap = new WritableNativeMap();
        event.putString("action", "map-place-press");

        WritableMap placeData = new WritableNativeMap();
        placeData.putString("name", name);
        WritableMap placeLocation = new WritableNativeMap();
        placeLocation.putDouble("latitude", location.getLatitude());
        placeLocation.putDouble("longitude", location.getLongitude());
        placeData.putMap("location", placeLocation);

        WritableMap screenCoordinate = new WritableNativeMap();
        screenCoordinate.putDouble("x", touchPointX);
        screenCoordinate.putDouble("y", touchPointY);

        MFLocationCoordinate coordinate =
          map.getProjection().coordinateForPoint(
            new Point((int) (touchPointX / MapContext.getDensity()), (int) (touchPointY / MapContext.getDensity()))
          );

        locationMap.putDouble("latitude", coordinate.getLatitude());
        locationMap.putDouble("longitude", coordinate.getLongitude());

        event.putMap("place", placeData);
        event.putMap("location", locationMap);
        event.putMap("pixel", screenCoordinate);

        manager.pushEvent(getContext(), view, "onPlacePress", event);
      }
    });

    map.setOnDataSourceFeatureClickListener(new Map4D.OnDataSourceFeatureClickListener() {
      @Override
      public void onDataSourceFeatureClick(@NonNull MFDataSourceFeature dataSourceFeature,
                                           @NonNull MFLocationCoordinate location) {
        WritableMap event = new WritableNativeMap();
        event.putString("action", "data-source-feature-press");
        MFLocationCoordinate coordinate =
          map.getProjection().coordinateForPoint(
            new Point((int) (touchPointX / MapContext.getDensity()), (int) (touchPointY / MapContext.getDensity()))
          );
        WritableMap locationMap = new WritableNativeMap();
        locationMap.putDouble("latitude", coordinate.getLatitude());
        locationMap.putDouble("longitude", coordinate.getLongitude());
        event.putMap("location", locationMap);

        WritableMap screenCoordinate = new WritableNativeMap();
        screenCoordinate.putDouble("x", touchPointX);
        screenCoordinate.putDouble("y", touchPointY);
        event.putMap("pixel", screenCoordinate);

        WritableMap feature = new WritableNativeMap();

        feature.putString("source", dataSourceFeature.getSource());
        feature.putString("sourceLayer", dataSourceFeature.getSourceLayer());
        feature.putString("layerType", dataSourceFeature.getLayerType());

        WritableMap propertiesMap = new WritableNativeMap();
        Map<String, Object> properties = dataSourceFeature.getProperties();
        for (String key: properties.keySet()) {
          Object value = properties.get(key);
          if (value instanceof String) {
            propertiesMap.putString(key, (String) value);
          }
          else if (value instanceof Boolean) {
            propertiesMap.putBoolean(key, (Boolean) value);
          }
          else if (value instanceof Integer) {
            propertiesMap.putInt(key, (Integer) value);
          }
          else if (value instanceof Double) {
            propertiesMap.putDouble(key, (Double) value);
          }
        }
        feature.putMap("properties", propertiesMap);

        WritableMap featureLocation = new WritableNativeMap();
        featureLocation.putDouble("latitude", location.getLatitude());
        featureLocation.putDouble("longitude", location.getLongitude());
        feature.putMap("location", featureLocation);

        event.putMap("feature", feature);
        manager.pushEvent(getContext(), view, "onDataSourceFeaturePress", event);
      }
    });

    map.setOnMapClickListener(new Map4D.OnMapClickListener() {
      @Override
      public void onMapClick(MFLocationCoordinate mfLocationCoordinate) {
        WritableMap event = new WritableNativeMap();
        WritableMap location = new WritableNativeMap();
        event.putString("action", "map-press");
        location.putDouble("latitude", mfLocationCoordinate.getLatitude());
        location.putDouble("longitude", mfLocationCoordinate.getLongitude());

        WritableMap screenCoordinate = new WritableNativeMap();
        screenCoordinate.putDouble("x", touchPointX);
        screenCoordinate.putDouble("y", touchPointY);

        event.putMap("location", location);
        event.putMap("pixel", screenCoordinate);
        manager.pushEvent(getContext(), view, "onPress", event);
      }
    });

    map.setOnCameraMoveListener(new Map4D.OnCameraMoveListener() {
      @Override
      public void onCameraMove() {
        WritableMap event = getCameraMap();
        event.putString("action", "camera-move");
        manager.pushEvent(getContext(), view, "onCameraMove", event);
      }
    });

    map.setOnCameraIdleListener(new Map4D.OnCameraIdleListener() {
      @Override
      public void onCameraIdle() {
        WritableMap event = getCameraMap();
        event.putString("action", "camera-idle");
        manager.pushEvent(getContext(), view, "onCameraIdle", event);
      }
    });

    map.setOnCameraMoveStartedListener(new Map4D.OnCameraMoveStartedListener() {
      @Override
      public void onCameraMoveStarted(int reason) {
        WritableMap event = getCameraMap();
        event.putString("action", "camera-move-started");
        event.putBoolean("gesture", reason == 1);
        manager.pushEvent(getContext(), view, "onCameraMoveStart", event);
      }
    });

    map.setOnMyLocationButtonClickListener(new Map4D.OnMyLocationButtonClickListener() {
      @Override
      public boolean onMyLocationButtonClick() {
        WritableMap event = new WritableNativeMap();
        event.putString("action", "my-location-button-press");
        manager.pushEvent(getContext(), view, "onMyLocationButtonPress", event);
        return false;
      }
    });

    // We need to be sure to disable location-tracking when app enters background, in-case some
    // other module
    // has acquired a wake-lock and is controlling location-updates, otherwise, location-manager
    // will be left
    // updating location constantly, killing the battery, even though some other location-mgmt
    // module may
    // desire to shut-down location-services.
    lifecycleListener = new LifecycleEventListener() {
      @Override
      public void onHostResume() {
        if (hasPermissions() && map != null) {
          //noinspection MissingPermission
          map.setMyLocationEnabled(showUserLocation);
        }
        synchronized (RMFMapView.this) {
          if (!destroyed) {
            RMFMapView.this.onStart();
          }
          paused = false;
        }
      }

      @Override
      public void onHostPause() {
        if (hasPermissions() && map != null) {
          //noinspection MissingPermission
          map.setMyLocationEnabled(false);
        }
        synchronized (RMFMapView.this) {
          if (!destroyed) {
            RMFMapView.this.onStop();
          }
          paused = true;
        }
      }

      @Override
      public void onHostDestroy() {
        RMFMapView.this.doDestroy();
      }
    };

    context.addLifecycleEventListener(lifecycleListener);
  }

  private boolean hasPermissions() {
    return checkSelfPermission(getContext(), PERMISSIONS[0]) == PermissionChecker.PERMISSION_GRANTED ||
      checkSelfPermission(getContext(), PERMISSIONS[1]) == PermissionChecker.PERMISSION_GRANTED;
  }

  public synchronized void doDestroy() {
    if (destroyed) {
      return;
    }
    destroyed = true;

    if (lifecycleListener != null && context != null) {
      context.removeLifecycleEventListener(lifecycleListener);
      lifecycleListener = null;
    }
    if (!paused) {
      onStop();
      paused = true;
    }
    map = null;
    onDestroy();
  }

  private WritableMap getCircleEventData(MFCircle circle) {
    WritableMap event = new WritableNativeMap();
    WritableMap location = new WritableNativeMap();

    WritableMap circleData = new WritableNativeMap();
    WritableMap circleCenter = new WritableNativeMap();
    circleCenter.putDouble("latitude", circle.getCenter().getLatitude());
    circleCenter.putDouble("longitude", circle.getCenter().getLongitude());
    circleData.putMap("center", circleCenter);
    circleData.putDouble("radius", circle.getRadius());
    Object userData = circle.getUserData();
    if (userData != null) {
      String userDataByString = "";
      userDataByString = userData.toString();
      int begin = userDataByString.indexOf(":") + 2;
      int end = userDataByString.length() - 2;
      userDataByString = userDataByString.substring(begin, end);
      circleData.putString("userData", userDataByString);
    }
    else {
      circleData.putMap("userData", new WritableNativeMap());
    }

    WritableMap screenCoordinate = new WritableNativeMap();
    screenCoordinate.putDouble("x", touchPointX);
    screenCoordinate.putDouble("y", touchPointY);

    MFLocationCoordinate coordinate =
      map.getProjection().coordinateForPoint(
        new Point((int) (touchPointX / MapContext.getDensity()), (int) (touchPointY / MapContext.getDensity()))
      );
    location.putDouble("latitude", coordinate.getLatitude());
    location.putDouble("longitude", coordinate.getLongitude());

    event.putMap("circle", circleData);
    event.putMap("location", location);
    event.putMap("pixel", screenCoordinate);

    return event;
  }

  private WritableMap getPOIEventData(MFPOI poi) {
    WritableMap event = new WritableNativeMap();
    WritableMap location = new WritableNativeMap();

    WritableMap poiData = new WritableNativeMap();
    poiData.putString("title", poi.getTitle());
    WritableMap poiLocation = new WritableNativeMap();
    poiLocation.putDouble("latitude", poi.getPosition().getLatitude());
    poiLocation.putDouble("longitude", poi.getPosition().getLongitude());
    poiData.putMap("location", poiLocation);
    Object userData = poi.getUserData();
    if (userData != null) {
      String userDataByString = "";
      userDataByString = userData.toString();
      int begin = userDataByString.indexOf(":") + 2;
      int end = userDataByString.length() - 2;
      userDataByString = userDataByString.substring(begin, end);
      poiData.putString("userData", userDataByString);
    }
    else {
      poiData.putMap("userData", new WritableNativeMap());
    }

    WritableMap screenCoordinate = new WritableNativeMap();
    screenCoordinate.putDouble("x", touchPointX);
    screenCoordinate.putDouble("y", touchPointY);

    MFLocationCoordinate coordinate =
      map.getProjection().coordinateForPoint(
        new Point((int) (touchPointX / MapContext.getDensity()), (int) (touchPointY / MapContext.getDensity()))
      );
    location.putDouble("latitude", coordinate.getLatitude());
    location.putDouble("longitude", coordinate.getLongitude());

    event.putMap("poi", poiData);
    event.putMap("location", location);
    event.putMap("pixel", screenCoordinate);

    return event;
  }


  private WritableMap getMarkerEventData(MFMarker marker, float touchPointX, float touchPointY) {
    WritableMap event = new WritableNativeMap();
    WritableMap location = new WritableNativeMap();

    WritableMap markerData = new WritableNativeMap();
    WritableMap markerLocation = new WritableNativeMap();
    markerLocation.putDouble("latitude", marker.getPosition().getLatitude());
    markerLocation.putDouble("longitude", marker.getPosition().getLongitude());
    markerData.putMap("location", markerLocation);
    Object userData = marker.getUserData();
    if (userData != null) {
      String userDataByString = "";
      userDataByString = userData.toString();
      int begin = userDataByString.indexOf(":") + 2;
      int end = userDataByString.length() - 2;
      userDataByString = userDataByString.substring(begin, end);
      markerData.putString("userData", userDataByString);
    }
    else {
      markerData.putMap("userData", new WritableNativeMap());
    }

    WritableMap screenCoordinate = new WritableNativeMap();
    screenCoordinate.putDouble("x", touchPointX);
    screenCoordinate.putDouble("y", touchPointY);

    MFLocationCoordinate coordinate =
      map.getProjection().coordinateForPoint(
        new Point((int) (touchPointX / MapContext.getDensity()), (int) (touchPointY / MapContext.getDensity()))
      );
    location.putDouble("latitude", coordinate.getLatitude());
    location.putDouble("longitude", coordinate.getLongitude());

    event.putMap("marker", markerData);
    event.putMap("location", location);
    event.putMap("pixel", screenCoordinate);

    return event;
  }

  private WritableMap getPolylineEventData(MFPolyline polyline) {
    WritableMap event = new WritableNativeMap();
    WritableMap location = new WritableNativeMap();

    WritableMap polylineData = new WritableNativeMap();
    Object userData = polyline.getUserData();
    if (userData != null) {
      String userDataByString = "";
      userDataByString = userData.toString();
      int begin = userDataByString.indexOf(":") + 2;
      int end = userDataByString.length() - 2;
      userDataByString = userDataByString.substring(begin, end);
      polylineData.putString("userData", userDataByString);
    }
    else {
      polylineData.putMap("userData", new WritableNativeMap());
    }

    WritableMap screenCoordinate = new WritableNativeMap();
    screenCoordinate.putDouble("x", touchPointX);
    screenCoordinate.putDouble("y", touchPointY);

    MFLocationCoordinate coordinate =
      map.getProjection().coordinateForPoint(
        new Point((int) (touchPointX / MapContext.getDensity()), (int) (touchPointY / MapContext.getDensity()))
      );
    location.putDouble("latitude", coordinate.getLatitude());
    location.putDouble("longitude", coordinate.getLongitude());

    event.putMap("polyline", polylineData);
    event.putMap("location", location);
    event.putMap("pixel", screenCoordinate);

    return event;
  }

  private WritableMap getPolygonEventData(MFPolygon polygon) {
    WritableMap event = new WritableNativeMap();
    WritableMap location = new WritableNativeMap();

    WritableMap polygonData = new WritableNativeMap();
    Object userData = polygon.getUserData();
    if (userData != null) {
      String userDataByString = "";
      userDataByString = userData.toString();
      int begin = userDataByString.indexOf(":") + 2;
      int end = userDataByString.length() - 2;
      userDataByString = userDataByString.substring(begin, end);
      polygonData.putString("userData", userDataByString);
    }
    else {
      polygonData.putMap("userData", new WritableNativeMap());
    }

    WritableMap screenCoordinate = new WritableNativeMap();
    screenCoordinate.putDouble("x", touchPointX);
    screenCoordinate.putDouble("y", touchPointY);

    MFLocationCoordinate coordinate =
      map.getProjection().coordinateForPoint(
        new Point((int) (touchPointX / MapContext.getDensity()), (int) (touchPointY / MapContext.getDensity()))
      );
    location.putDouble("latitude", coordinate.getLatitude());
    location.putDouble("longitude", coordinate.getLongitude());

    event.putMap("polygon", polygonData);
    event.putMap("location", location);
    event.putMap("pixel", screenCoordinate);

    return event;
  }

  private WritableMap getDirectionsRendererEventData(MFDirectionsRenderer directionsRenderer, int i) {
    WritableMap event = new WritableNativeMap();
    WritableMap location = new WritableNativeMap();

    WritableMap screenCoordinate = new WritableNativeMap();
    screenCoordinate.putDouble("x", touchPointX);
    screenCoordinate.putDouble("y", touchPointY);

    MFLocationCoordinate coordinate =
      map.getProjection().coordinateForPoint(
        new Point((int) (touchPointX / MapContext.getDensity()), (int) (touchPointY / MapContext.getDensity()))
      );
    location.putDouble("latitude", coordinate.getLatitude());
    location.putDouble("longitude", coordinate.getLongitude());

    event.putMap("location", location);
    event.putMap("pixel", screenCoordinate);
    event.putInt("routeIndex", i);

    return event;
  }

  private WritableMap getBuildingEventData(MFBuilding building) {
    WritableMap event = new WritableNativeMap();
    WritableMap location = new WritableNativeMap();

    WritableMap buildingData = new WritableNativeMap();
    buildingData.putString("name", building.getName());
    WritableMap buildingLocation = new WritableNativeMap();
    buildingLocation.putDouble("latitude", building.getLocation().getLatitude());
    buildingLocation.putDouble("longitude", building.getLocation().getLongitude());
    buildingData.putMap("location", buildingLocation);
    Object userData = building.getUserData();
    if (userData != null) {
      String userDataByString = "";
      userDataByString = userData.toString();
      int begin = userDataByString.indexOf(":") + 2;
      int end = userDataByString.length() - 2;
      userDataByString = userDataByString.substring(begin, end);
      buildingData.putString("userData", userDataByString);
    }
    else {
      buildingData.putMap("userData", new WritableNativeMap());
    }

    WritableMap screenCoordinate = new WritableNativeMap();
    screenCoordinate.putDouble("x", touchPointX);
    screenCoordinate.putDouble("y", touchPointY);

    MFLocationCoordinate coordinate =
      map.getProjection().coordinateForPoint(
        new Point((int) (touchPointX / MapContext.getDensity()), (int) (touchPointY / MapContext.getDensity()))
      );
    location.putDouble("latitude", coordinate.getLatitude());
    location.putDouble("longitude", coordinate.getLongitude());

    event.putMap("building", buildingData);
    event.putMap("location", location);
    event.putMap("pixel", screenCoordinate);

    return event;
  }

  private WritableMap getCameraMap() {
    WritableMap event = new WritableNativeMap();
    MFCameraPosition pos = map.getCameraPosition();
    event.putDouble("zoom", pos.getZoom());
    event.putDouble("bearing", pos.getBearing());
    event.putDouble("tilt", pos.getTilt());
    WritableMap target = new WritableNativeMap();
    target.putDouble("latitude", pos.getTarget().getLatitude());
    target.putDouble("longitude", pos.getTarget().getLongitude());
    event.putMap("center", target);
    return event;
  }

  private MFCameraPosition parseCamera(ReadableMap camera) {
    MFCameraPosition.Builder builder = new MFCameraPosition.Builder(map.getCameraPosition());
    if (camera.hasKey("zoom")) {
      builder.zoom(camera.getDouble("zoom"));
    }
    if (camera.hasKey("bearing")) {
      builder.bearing(camera.getDouble("bearing"));
    }
    if (camera.hasKey("tilt")) {
      builder.tilt(camera.getDouble("tilt"));
    }
    if (camera.hasKey("center")) {
      ReadableMap center = camera.getMap("center");
      builder.target(new MFLocationCoordinate(center.getDouble("latitude"), center.getDouble("longitude")));
    }
    return builder.build();
  }

  public void moveCamera(ReadableMap camera) {
    if (map == null) return;
    MFCameraPosition cameraPosition = parseCamera(camera);
    MFCameraUpdate cameraUpdate = MFCameraUpdateFactory.newCameraPosition(cameraPosition);
    map.moveCamera(cameraUpdate);
  }

  public void animateCamera(ReadableMap camera) {
    if (map == null) return;
    MFCameraPosition cameraPosition = parseCamera(camera);
    MFCameraUpdate cameraUpdate = MFCameraUpdateFactory.newCameraPosition(cameraPosition);
    map.animateCamera(cameraUpdate);
  }

  public void setMapType(String mapType) {
    if (map == null) return;
    if (mapType.equals("roadmap")) {
      map.setMapType(MFMapType.ROADMAP);
    }
    else if (mapType.equals("satellite")) {
      map.setMapType(MFMapType.SATELLITE);
    }
    else if (mapType.equals("hybrid")) {
      map.setMapType(MFMapType.HYBRID);
    }
  }

  public void setMapId(String mapId) {
    if (map == null) return;
    map.setMapId(mapId);
  }

  public void setMapStyle(String style) {
    if (map == null) return;
    map.setMapStyle(new MFMapStyleOptions(style));
  }

  public void setZoomGesturesEnabled(boolean enable) {
    if (map == null) return;
    map.setZoomGesturesEnabled(enable);
  }

  public void setScrollGesturesEnabled(boolean enable) {
    if (map == null) return;
    map.setScrollGesturesEnabled(enable);
  }

  public void setRotateGesturesEnabled(boolean enable) {
    if (map == null) return;
    map.setRotateGesturesEnabled(enable);
  }

  public void setTiltGesturesEnabled(boolean enable) {
    if (map == null) return;
    map.setTiltGesturesEnabled(enable);
  }

  public void setAllGesturesEnabled(boolean enable) {
    if (map == null) return;
    map.setAllGesturesEnabled(enable);
  }

  public void setPOIsEnabled(Boolean enable) {
    if (map == null) return;
    map.setPOIsEnabled(enable);
  }

  public void setMyLocationEnabled(Boolean enable) {
    this.showUserLocation = enable; // hold onto this for lifecycle handling
    if (map == null) return;
    if (hasPermissions()) {
      map.setMyLocationEnabled(enable);
    }
  }

  public void setShowsMyLocationButton(boolean showMyLocationButton) {
    if (map == null) return;
    if (hasPermissions()) {
      map.getUiSettings().setMyLocationButtonEnabled(showMyLocationButton);
    }
  }

  public void setBuildingsEnabled(boolean buildingsEnable) {
    if (map == null) return;
    map.setBuildingsEnabled(buildingsEnable);
  }

  public void setTime(double time) {
    if (map == null) return;
    map.setTime(new Date((long) time));
  }

  public void fitBounds(ReadableMap boundData) {
    if (map == null) return;
    ReadableMap bounds = boundData.getMap("bounds");
    ReadableMap southWest = bounds.getMap("southWest");
    ReadableMap northEast = bounds.getMap("northEast");

    MFCoordinateBounds.Builder builder = new MFCoordinateBounds.Builder();
    double southWestLat = southWest.getDouble("latitude");
    double southWestLng = southWest.getDouble("longitude");
    builder.include(new MFLocationCoordinate(southWestLat, southWestLng));

    double northEastLat = northEast.getDouble("latitude");
    double northEastLng = northEast.getDouble("longitude");
    builder.include(new MFLocationCoordinate(northEastLat, northEastLng));

    int paddingDefault = 10;
    int paddingLeft = paddingDefault;
    int paddingRight = paddingDefault;
    int paddingTop = paddingDefault;
    int paddingBottom = paddingDefault;
    if (boundData.hasKey("padding")) {
      ReadableMap padding = boundData.getMap("padding");
      if (padding.hasKey("left")) {
        paddingLeft = padding.getInt("left");
      }
      if (padding.hasKey("right")) {
        paddingRight = padding.getInt("right");
      }
      if (padding.hasKey("top")) {
        paddingTop = padding.getInt("top");
      }
      if (padding.hasKey("bottom")) {
        paddingBottom = padding.getInt("bottom");
      }
    }
    MFCameraPosition cameraPosition = map.getCameraPositionForBounds(
      builder.build(), paddingLeft, paddingTop, paddingRight, paddingBottom);
    map.moveCamera(MFCameraUpdateFactory.newCameraPosition(cameraPosition));
  }

  public void addFeature(View child, int index) {
    if (child instanceof RMFMarker) {
      RMFMarker annotation = (RMFMarker) child;
      /** Must set marker collection first then add RMFMarker to map **/
      annotation.setMarkerCollection(markerCollection);
      annotation.addToMap(map);
      features.add(index, annotation);

      // Remove from a view group if already present, prevent "specified child
      // already had a parent" error.
      ViewGroup annotationParent = (ViewGroup)annotation.getParent();
      if (annotationParent != null) {
        annotationParent.removeView(annotation);
      }

      // Add to the parent group
      attacherGroup.addView(annotation);

      MFMarker marker = (MFMarker) annotation.getFeature();
      markerMap.put(marker, annotation);
    } else if (child instanceof RMFCircle) {
      RMFCircle annotation = (RMFCircle) child;
      annotation.addToMap(map);
      features.add(index, annotation);

      // Remove from a view group if already present, prevent "specified child
      // already had a parent" error.
      ViewGroup annotationParent = (ViewGroup)annotation.getParent();
      if (annotationParent != null) {
        annotationParent.removeView(annotation);
      }

      MFCircle circle = (MFCircle) annotation.getFeature();
      circleMap.put(circle, annotation);
    } else if (child instanceof RMFPolyline) {
      RMFPolyline annotation = (RMFPolyline) child;
      annotation.addToMap(map);
      features.add(index, annotation);

      // Remove from a view group if already present, prevent "specified child
      // already had a parent" error.
      ViewGroup annotationParent = (ViewGroup)annotation.getParent();
      if (annotationParent != null) {
        annotationParent.removeView(annotation);
      }

      MFPolyline polyline = (MFPolyline) annotation.getFeature();
      polylineMap.put(polyline, annotation);
    } else if (child instanceof RMFPolygon) {
      RMFPolygon annotation = (RMFPolygon) child;
      annotation.addToMap(map);
      features.add(index, annotation);

      // Remove from a view group if already present, prevent "specified child
      // already had a parent" error.
      ViewGroup annotationParent = (ViewGroup)annotation.getParent();
      if (annotationParent != null) {
        annotationParent.removeView(annotation);
      }

      MFPolygon polygon = (MFPolygon) annotation.getFeature();
      polygonMap.put(polygon, annotation);
    } else if (child instanceof RMFBuilding) {
      RMFBuilding annotation = (RMFBuilding) child;
      annotation.addToMap(map);
      features.add(index, annotation);

      // Remove from a view group if already present, prevent "specified child
      // already had a parent" error.
      ViewGroup annotationParent = (ViewGroup) annotation.getParent();
      if (annotationParent != null) {
        annotationParent.removeView(annotation);
      }

      MFBuilding building = (MFBuilding) annotation.getFeature();
      buildingMap.put(building, annotation);
    }  else if (child instanceof RMFPOI) {
      RMFPOI annotation = (RMFPOI) child;
      annotation.addToMap(map);
      features.add(index, annotation);

      // Remove from a view group if already present, prevent "specified child
      // already had a parent" error.
      ViewGroup annotationParent = (ViewGroup) annotation.getParent();
      if (annotationParent != null) {
        annotationParent.removeView(annotation);
      }

      MFPOI poi = (MFPOI) annotation.getFeature();
      poiMap.put(poi.getId(), annotation);
    }
    else if (child instanceof RMFDirectionsRenderer) {
      RMFDirectionsRenderer annotation = (RMFDirectionsRenderer) child;
      annotation.addToMap(map);
      features.add(index, annotation);

      // Remove from a view group if already present, prevent "specified child
      // already had a parent" error.
      ViewGroup annotationParent = (ViewGroup) annotation.getParent();
      if (annotationParent != null) {
        annotationParent.removeView(annotation);
      }

      MFDirectionsRenderer directionsRenderer = (MFDirectionsRenderer) annotation.getFeature();
      directionsRendererMap.put(directionsRenderer, annotation);
    }
    else if (child instanceof RMFTileOverlay) {
      RMFTileOverlay annotation = (RMFTileOverlay) child;
      annotation.addToMap(map);
      features.add(index, annotation);

      // Remove from a view group if already present, prevent "specified child
      // already had a parent" error.
      ViewGroup annotationParent = (ViewGroup) annotation.getParent();
      if (annotationParent != null) {
        annotationParent.removeView(annotation);

        MFTileOverlay tileOverlay = (MFTileOverlay) annotation.getFeature();
        tileOverlayMap.put(tileOverlay, annotation);
      }
    }
    else if (child instanceof ViewGroup) {
      ViewGroup children = (ViewGroup) child;
      for (int i = 0; i < children.getChildCount(); i++) {
        addFeature(children.getChildAt(i), index);
      }
    } else {
      addView(child, index);
    }
  }

  public int getFeatureCount() {
    return features.size();
  }

  public View getFeatureAt(int index) {
    return features.get(index);
  }

  public void removeFeatureAt(int index) {
    if (destroyed) {
      return;
    }
    RMFFeature feature = features.remove(index);
    if (feature instanceof RMFMarker) {
        markerMap.remove(feature.getFeature());
    } else if (feature instanceof RMFCircle) {
      circleMap.remove(feature.getFeature());
    }
    else if (feature instanceof RMFPolyline) {
      polylineMap.remove(feature.getFeature());
    }
    else if (feature instanceof RMFPolygon) {
      polygonMap.remove(feature.getFeature());
    }
    else if (feature instanceof RMFBuilding) {
      buildingMap.remove(feature.getFeature());
    }
    else if (feature instanceof RMFPOI) {
      MFPOI poi = (MFPOI) feature.getFeature();
      poiMap.remove(poi.getId());
    }
    else if (feature instanceof RMFTileOverlay) {
      tileOverlayMap.remove(feature.getFeature());
    }
    else if (feature instanceof RMFDirectionsRenderer) {
      directionsRendererMap.remove(feature.getFeature());
    }
    feature.removeFromMap(map);
  }
}
