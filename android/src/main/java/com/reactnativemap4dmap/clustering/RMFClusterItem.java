package com.reactnativemap4dmap.clustering;

import android.content.Context;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReadableMap;
import com.reactnativemap4dmap.RMFFeature;

import vn.map4d.map.core.Map4D;
import vn.map4d.types.MFLocationCoordinate;
import vn.map4d.utils.android.clustering.MFClusterItem;

public class RMFClusterItem extends RMFFeature implements MFClusterItem {

  private MFLocationCoordinate position;
  private String title;
  private String snippet;

  public RMFClusterItem(Context context) {
    super(context);
    position = new MFLocationCoordinate(0, 0);
    title = null;
    snippet = null;
  }

  @NonNull
  @Override
  public MFLocationCoordinate getPosition() {
    return position;
  }

  public void setPosition(ReadableMap data) {
    this.position = new MFLocationCoordinate(data.getDouble("latitude"), data.getDouble("longitude"));
  }

  @Nullable
  @Override
  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  @Nullable
  @Override
  public String getSnippet() {
    return snippet;
  }

  public void setSnippet(String snippet) {
    this.snippet = snippet;
  }

  @Override
  public void addToMap(Map4D map) {}

  @Override
  public void removeFromMap(Map4D map) {}

  @Override
  public Object getFeature() {
    return null;
  }
}
