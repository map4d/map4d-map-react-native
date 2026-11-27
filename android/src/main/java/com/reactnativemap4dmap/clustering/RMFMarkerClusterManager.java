package com.reactnativemap4dmap.clustering;

import android.view.View;

import androidx.annotation.NonNull;

import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;

import java.util.Map;

public class RMFMarkerClusterManager extends ViewGroupManager<RMFMarkerCluster> {

  @NonNull
  @Override
  public String getName() {
    return "RMFMarkerCluster";
  }

  @NonNull
  @Override
  protected RMFMarkerCluster createViewInstance(@NonNull ThemedReactContext reactContext) {
    return new RMFMarkerCluster(reactContext);
  }

  @Override
  public void addView(RMFMarkerCluster parent, View child, int index) {
    parent.addFeature(child, index);
  }

  @Override
  public Map getExportedCustomDirectEventTypeConstants() {
    Map<String, Map<String, String>> map = MapBuilder.of(
      "onPressCluster", MapBuilder.of("registrationName", "onPressCluster")
    );
    return map;
  }
}
