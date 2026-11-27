package com.reactnativemap4dmap.clustering;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.*;
import com.facebook.react.common.MapBuilder;

import java.util.Map;

public class RMFClusterItemManager extends ViewGroupManager<RMFClusterItem> {

  @Override
  public String getName() {
    return "RMFClusterItem";
  }

  @Override
  protected RMFClusterItem createViewInstance(ThemedReactContext reactContext) {
    return new RMFClusterItem(reactContext);
  }

  @Override
  public Map getExportedCustomDirectEventTypeConstants() {
    Map<String, Map<String, String>> map = MapBuilder.of(
      "onPress", MapBuilder.of("registrationName", "onPress"),
      "onPressInfoWindow", MapBuilder.of("registrationName", "onPressInfoWindow")
    );
    return map;
  }

  @ReactProp(name = "coordinate")
  public void setPosition(RMFClusterItem view, ReadableMap map) {
    view.setPosition(map);
  }

  @ReactProp(name = "title")
  public void setTitle(RMFClusterItem view, String title) {
    view.setTitle(title);
  }

  @ReactProp(name = "snippet")
  public void setSnippet(RMFClusterItem view, String snippet) {
    view.setSnippet(snippet);
  }
}
