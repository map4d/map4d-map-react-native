package com.reactnativemap4dmap.clustering;

import android.graphics.Point;
import android.view.View;

import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.events.RCTEventEmitter;
import com.reactnativemap4dmap.RMFFeature;

import java.util.HashMap;
import java.util.Map;

import vn.map4d.map.core.Map4D;
import vn.map4d.map.core.MapContext;
import vn.map4d.types.MFLocationCoordinate;
import vn.map4d.utils.android.clustering.MFCluster;
import vn.map4d.utils.android.clustering.MFClusterManager;

public class RMFMarkerCluster extends RMFFeature {

  private MFClusterManager<RMFClusterItem> clusterManager;
  private ThemedReactContext reactContext;
  private final Map<Integer, RMFClusterItem> clusterItemMap;
  private Map4D map;
  private float touchPointX = 0.f;
  private float touchPointY = 0.f;

  public RMFMarkerCluster(ThemedReactContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
    clusterItemMap = new HashMap<>();
  }

  public void setClusterManager(MFClusterManager<RMFClusterItem> clusterManager) {
    this.clusterManager = clusterManager;
  }

  @Override
  public void addToMap(Map4D map) {
    this.map = map;
    if (clusterManager == null) {
      return;
    }

    clusterManager.setOnClusterClickListener(mfCluster -> {
      WritableMap event = getClusterClickEventData(mfCluster);
      event.putString("action", "marker-cluster-press");
      reactContext.getJSModule(RCTEventEmitter.class)
        .receiveEvent(getId(), "onPressCluster", event);
      return false;
    });

    clusterManager.getMarkerCollection().setOnInfoWindowClickListener(mfMarker -> {
      RMFClusterItem clusterItem = (RMFClusterItem) mfMarker.getUserData();
      if (clusterItem == null) {
        return;
      }
      WritableMap event = getClusterItemInfoWindowClickEventData(clusterItem);
      event.putString("action", "cluster-item-info-window-press");
      reactContext.getJSModule(RCTEventEmitter.class)
        .receiveEvent(clusterItem.getId(), "onPressInfoWindow", event);
    });

    clusterManager.getMarkerCollection().setOnMarkerClickListener(mfMarker -> {
      RMFClusterItem clusterItem = (RMFClusterItem) mfMarker.getUserData();
      if (clusterItem == null) {
        return false;
      }
      WritableMap event = getClusterItemClickEventData(clusterItem);
      event.putString("action", "cluster-item-press");
      reactContext.getJSModule(RCTEventEmitter.class)
        .receiveEvent(clusterItem.getId(), "onPress", event);
      return false;
    });

    clusterManager.addItems(clusterItemMap.values());
  }

  @Override
  public void removeFromMap(Map4D map) {
    clusterManager.clearItems();
    clusterItemMap.clear();
  }

  @Override
  public Object getFeature() {
    return null;
  }

  public void addFeature(View child, int index) {
    if (child instanceof RMFClusterItem) {
      RMFClusterItem clusterItem = (RMFClusterItem) child;
      clusterItemMap.put(clusterItem.getId(), clusterItem);
    }
  }

  public void setTouchPoint(float touchPointX, float touchPointY) {
    this.touchPointX = touchPointX;
    this.touchPointY = touchPointY;
  }

  private WritableMap getClusterClickEventData(MFCluster<RMFClusterItem> clusterItem) {
    WritableMap event = new WritableNativeMap();
    WritableMap eventData = new WritableNativeMap();

    WritableMap location = new WritableNativeMap();
    location.putDouble("latitude", clusterItem.getPosition().getLatitude());
    location.putDouble("longitude", clusterItem.getPosition().getLongitude());

    eventData.putMap("location", location);
    eventData.putInt("size", clusterItem.getSize());

    event.putMap("cluster", eventData);
    return event;
  }

  private WritableMap getClusterItemClickEventData(RMFClusterItem clusterItem) {
    WritableMap event = new WritableNativeMap();
    WritableMap eventData = new WritableNativeMap();

    WritableMap location = new WritableNativeMap();
    location.putDouble("latitude", clusterItem.getPosition().getLatitude());
    location.putDouble("longitude", clusterItem.getPosition().getLongitude());
    eventData.putMap("location", location);

    event.putMap("clusterItem", eventData);

    WritableMap locationMap = new WritableNativeMap();
    MFLocationCoordinate coordinate =
      map.getProjection().coordinateForPoint(
        new Point((int) (touchPointX / MapContext.getDensity()), (int) (touchPointY / MapContext.getDensity()))
      );
    locationMap.putDouble("latitude", coordinate.getLatitude());
    locationMap.putDouble("longitude", coordinate.getLongitude());
    event.putMap("location", locationMap);

    WritableMap screenCoordinate = new WritableNativeMap();
    screenCoordinate.putDouble("x", touchPointX);
    screenCoordinate.putDouble("y", touchPointY);
    event.putMap("pixel", screenCoordinate);
    return event;
  }

  private WritableMap getClusterItemInfoWindowClickEventData(RMFClusterItem clusterItem) {
    WritableMap event = new WritableNativeMap();
    WritableMap eventData = new WritableNativeMap();

    WritableMap location = new WritableNativeMap();
    location.putDouble("latitude", clusterItem.getPosition().getLatitude());
    location.putDouble("longitude", clusterItem.getPosition().getLongitude());
    eventData.putMap("location", location);

    event.putMap("clusterItem", eventData);

    WritableMap locationMap = new WritableNativeMap();
    MFLocationCoordinate coordinate =
      map.getProjection().coordinateForPoint(
        new Point((int) (touchPointX / MapContext.getDensity()), (int) (touchPointY / MapContext.getDensity()))
      );
    locationMap.putDouble("latitude", coordinate.getLatitude());
    locationMap.putDouble("longitude", coordinate.getLongitude());
    event.putMap("location", locationMap);

    WritableMap screenCoordinate = new WritableNativeMap();
    screenCoordinate.putDouble("x", touchPointX);
    screenCoordinate.putDouble("y", touchPointY);
    event.putMap("pixel", screenCoordinate);
    return event;
  }
}
