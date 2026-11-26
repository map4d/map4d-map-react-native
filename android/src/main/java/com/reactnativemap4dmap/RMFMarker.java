package com.reactnativemap4dmap;

import android.content.Context;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.Canvas;
import android.graphics.drawable.Drawable;
import android.view.View;
import android.graphics.drawable.Animatable;
import android.graphics.Bitmap;
import android.net.Uri;

import com.facebook.react.bridge.ReadableMap;

import com.facebook.common.references.CloseableReference;
import com.facebook.datasource.DataSource;
import com.facebook.drawee.backends.pipeline.Fresco;
import com.facebook.drawee.view.DraweeHolder;
import com.facebook.drawee.interfaces.DraweeController;
import com.facebook.drawee.controller.ControllerListener;
import com.facebook.drawee.controller.BaseControllerListener;
import com.facebook.drawee.generic.GenericDraweeHierarchy;
import com.facebook.drawee.generic.GenericDraweeHierarchyBuilder;
import com.facebook.drawee.drawable.ScalingUtils;
import com.facebook.imagepipeline.image.CloseableImage;
import com.facebook.imagepipeline.image.ImageInfo;
import com.facebook.imagepipeline.request.ImageRequest;
import com.facebook.imagepipeline.request.ImageRequestBuilder;
import com.facebook.imagepipeline.image.CloseableStaticBitmap;
import com.facebook.imagepipeline.core.ImagePipeline;
import com.facebook.imagepipeline.common.ResizeOptions;

import vn.map4d.map.core.*;
import vn.map4d.map.annotations.*;

import vn.map4d.types.MFLocationCoordinate;
import vn.map4d.utils.android.collections.MFMarkerManager;

import javax.annotation.Nullable;

public class RMFMarker extends RMFFeature {
  private MFMarkerOptions markerOptions;
  private MFLocationCoordinate position;
  private double rotation;
  private String title;
  private String snippet;
  private boolean draggable;
  private float zIndex;
  private boolean visible;
  private float windowAnchorU;
  private float windowAnchorV;
  private double anchorU;
  private double anchorV;
  private double elevation;
  private MFBitmapDescriptor iconBitmapDescriptor;
  private Bitmap iconBitmap;
  private Bitmap mLastBitmapCreated = null;
  private String userData;
  private MFMarker marker;

  private boolean hasCustomMarkerView = false;
  private boolean tracksViewChangesActive = false;

  private int width;
  private int height;

  // The size requested for a data:/http(s):/file:/asset: icon, kept around so
  // the async decode callback below can scale the bitmap it gets back — a
  // Fresco ResizeOptions hint on the request is not reliably honored (it
  // requires downsampling to be enabled, and even then only approximates the
  // size), so the final bitmap is resized explicitly instead.
  private int iconWidth;
  private int iconHeight;

  private MFMarkerManager.Collection markerCollection;

  private final DraweeHolder<?> logoHolder;
  private DataSource<CloseableReference<CloseableImage>> dataSource;
  private final ControllerListener<ImageInfo> mLogoControllerListener =
    new BaseControllerListener<ImageInfo>() {
      @Override
      public void onFinalImageSet(
          String id,
          @Nullable final ImageInfo imageInfo,
          @Nullable Animatable animatable) {
        CloseableReference<CloseableImage> imageReference = null;
        try {
          imageReference = dataSource.getResult();
          if (imageReference != null) {
            CloseableImage image = imageReference.get();
            if (image != null && image instanceof CloseableStaticBitmap) {
              CloseableStaticBitmap closeableStaticBitmap = (CloseableStaticBitmap) image;
              Bitmap bitmap = closeableStaticBitmap.getUnderlyingBitmap();
              if (bitmap != null) {
                bitmap = bitmap.copy(Bitmap.Config.ARGB_8888, true);
                if (iconWidth > 0 && iconHeight > 0 &&
                    (bitmap.getWidth() != iconWidth || bitmap.getHeight() != iconHeight)) {
                  bitmap = Bitmap.createScaledBitmap(bitmap, iconWidth, iconHeight, true);
                }
                iconBitmap = bitmap;
                iconBitmapDescriptor = MFBitmapDescriptorFactory.fromBitmap(bitmap);
              }
            }
          }
        } finally {
          dataSource.close();
          if (imageReference != null) {
            CloseableReference.closeSafely(imageReference);
          }
        }

        if (RMFMarker.this.marker != null) {
          RMFMarker.this.marker.setIcon(iconBitmapDescriptor);
        }
      }
    };

  public RMFMarker(Context context) {
    super(context);
    this.position = new MFLocationCoordinate(0, 0);
    this.rotation = 0.0;
    this.title = "";
    this.snippet = "";
    this.draggable = false;
    this.zIndex = 0.0f;
    this.visible = true;
    this.windowAnchorU = 0.5f;
    this.windowAnchorV = 0.0f;
    this.anchorU = 0.5;
    this.anchorV = 0.5;
    this.elevation = 0.0;
    this.userData = null;

    logoHolder = DraweeHolder.create(createDraweeHierarchy(), context);
    logoHolder.onAttach();
  }

  private GenericDraweeHierarchy createDraweeHierarchy() {
    return new GenericDraweeHierarchyBuilder(getResources())
      .setActualImageScaleType(ScalingUtils.ScaleType.FIT_CENTER)
      .setFadeDuration(0)
      .build();
  }

  public void setIcon(String uri, int width, int height) {
    if (uri == null) {
      iconBitmapDescriptor = null;
    }
    else if (uri.startsWith("http://") || uri.startsWith("https://") ||
      uri.startsWith("file://") || uri.startsWith("asset://") || uri.startsWith("data:")) {
      this.iconWidth = width;
      this.iconHeight = height;
      ImageRequestBuilder builder = ImageRequestBuilder.newBuilderWithSource(Uri.parse(uri));
      if (width != 0 && height != 0) {
        builder.setResizeOptions(ResizeOptions.forDimensions(width, height));
      }
      ImageRequest imageRequest = builder.build();
      ImagePipeline imagePipeline = Fresco.getImagePipeline();
      dataSource = imagePipeline.fetchDecodedImage(imageRequest, this);
      DraweeController controller = Fresco.newDraweeControllerBuilder()
        .setImageRequest(imageRequest)
        .setControllerListener(mLogoControllerListener)
        .setOldController(logoHolder.getController())
        .build();
      logoHolder.setController(controller);
    }
    else {
      iconBitmapDescriptor = ImageUtils.getBitmapByName(this, uri, width, height);
      if (iconBitmapDescriptor != null) {
        int drawableId = ImageUtils.getDrawableResourceByName(this, uri);
        iconBitmap = BitmapFactory.decodeResource(getResources(), drawableId);
        if (iconBitmap == null) { // VectorDrawable or similar
          Drawable drawable = getResources().getDrawable(drawableId);
          iconBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
          drawable.setBounds(0, 0, width, height);
          Canvas canvas = new Canvas(iconBitmap);
          drawable.draw(canvas);
        }
      }
    }
  }

  public void setPosition(ReadableMap data) {
    this.position = new MFLocationCoordinate(data.getDouble("latitude"), data.getDouble("longitude"));
    if (marker != null) {
      marker.setPosition(this.position);
    }
  }

  public void setRotation(double rotation) {
    this.rotation = rotation;
    if (marker != null) {
      marker.setRotation(this.rotation);
    }
  }

  public void setTitle(String title) {
    this.title = title;
    if (marker != null) {
      marker.setTitle(this.title);
    }
  }

  public void setSnippet(String snippet) {
    this.snippet = snippet;
    if (marker != null) {
      marker.setSnippet(this.snippet);
    }
  }

  public void setDraggable(boolean draggable) {
    this.draggable = draggable;
    if (marker != null) {
      marker.setDraggable(this.draggable);
    }
  }

  public void setZIndex(double zIndex) {
    this.zIndex = (float) zIndex;
    if (marker != null) {
      marker.setZIndex(this.zIndex);
    }
  }

  public void setVisible(boolean visible) {
    this.visible = visible;
    if (marker != null) {
      marker.setVisible(this.visible);
    }
  }

  public void setAnchor(ReadableMap data) {
    this.anchorU = data != null && data.hasKey("x") ? data.getDouble("x") : 0.5;
    this.anchorV = data != null && data.hasKey("y") ? data.getDouble("y") : 0.5;
  }

  public void setInfoWindowAnchor(ReadableMap data) {
    double x = data != null && data.hasKey("x") ? data.getDouble("x") : 0.5;
    double y = data != null && data.hasKey("y") ? data.getDouble("y") : 0.0;
    this.windowAnchorU = (float) x;
    this.windowAnchorV = (float) y;
    if (marker != null) {
      marker.setWindowAnchor(this.windowAnchorU, this.windowAnchorV);
    }
  }

  public void setElevation(double elevation) {
    this.elevation = elevation;
    if (marker != null) {
       marker.setElevation(elevation);
    }
  }

  public void setUserData(ReadableMap userData) {
    this.userData = userData.toString();
    if (marker != null) {
      marker.setUserData(this.userData);
    }
  }

  public void setMarkerCollection(MFMarkerManager.Collection markerCollection) {
    this.markerCollection = markerCollection;
  }

  public void addToMap(Map4D map) {
    /** Because use Utils library, we should use marker collection to add Marker to Map **/
    this.marker = markerCollection.addMarker(getMarkerOptions());
    updateTracksViewChanges();
  }

  public void removeFromMap(Map4D map) {
    if (marker == null) {
      return;
    }
    /** Because use Utils library, we should use marker collection to remove Marker from Map **/
    markerCollection.remove(marker);
    marker = null;
    updateTracksViewChanges();
   }

  public MFMarkerOptions getMarkerOptions() {
    if (markerOptions == null) {
      markerOptions = new MFMarkerOptions();
    }

    fillMarkerOptions(markerOptions);
    return markerOptions;
  }

  private MFMarkerOptions fillMarkerOptions(MFMarkerOptions options) {
    options.position(position);
    options.anchor((float) anchorU, (float) anchorV);
    options.infoWindowAnchor(windowAnchorU, windowAnchorV);
    options.title(title);
    options.snippet(snippet);
    options.rotation(rotation);
    options.draggable(draggable);
    options.elevation(elevation);
    options.zIndex(zIndex);
    options.icon(getIcon());
    options.userData(userData);
    return options;
  }

  private MFBitmapDescriptor getIcon() {
    if (hasCustomMarkerView) {
      // creating a bitmap from an arbitrary view
      if (iconBitmapDescriptor != null) {
        Bitmap viewBitmap = createDrawable();
        int width = Math.max(iconBitmap.getWidth(), viewBitmap.getWidth());
        int height = Math.max(iconBitmap.getHeight(), viewBitmap.getHeight());
        Bitmap combinedBitmap = Bitmap.createBitmap(width, height, iconBitmap.getConfig());
        Canvas canvas = new Canvas(combinedBitmap);
        canvas.drawBitmap(iconBitmap, 0, 0, null);
        canvas.drawBitmap(viewBitmap, 0, 0, null);
        return MFBitmapDescriptorFactory.fromBitmap(combinedBitmap);
      } else {
        return MFBitmapDescriptorFactory.fromBitmap(createDrawable());
      }
    } else if (iconBitmapDescriptor != null) {
      // use local image as a marker
      return iconBitmapDescriptor;
    } else {
      // render the default marker
      return MFBitmapDescriptorFactory.defaultMarker();
    }
  }

  public void update(int width, int height) {
    this.width = width;
    this.height = height;
  }

  private Bitmap createDrawable() {
    int width = this.width <= 0 ? 100 : this.width;
    int height = this.height <= 0 ? 100 : this.height;
    this.buildDrawingCache();

    // Do not create the doublebuffer-bitmap each time. reuse it to save memory.
    Bitmap bitmap = mLastBitmapCreated;

    if (bitmap == null ||
            bitmap.isRecycled() ||
            bitmap.getWidth() != width ||
            bitmap.getHeight() != height) {
      bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
      mLastBitmapCreated = bitmap;
    } else {
      bitmap.eraseColor(Color.TRANSPARENT);
    }

    Canvas canvas = new Canvas(bitmap);
    this.draw(canvas);

    return bitmap;
  }

  @Override
  public void addView(View child, int index) {
    super.addView(child, index);
    // if children are added, it means we are rendering a custom marker
    hasCustomMarkerView = true;
    updateTracksViewChanges();
    updateMarkerIcon();
  }

  private void updateTracksViewChanges() {
    boolean shouldTrack = hasCustomMarkerView && marker != null;
    if (shouldTrack == tracksViewChangesActive) return;
    tracksViewChangesActive = shouldTrack;

    if (shouldTrack) {
      ViewChangesTracker.getInstance().addMarker(this);
    } else {
      ViewChangesTracker.getInstance().removeMarker(this);

      // Let it render one more time to avoid race conditions.
      // i.e. Image onLoad ->
      //      ViewChangesTracker may not get a chance to render ->
      //      setState({ tracksViewChanges: false }) ->
      //      image loaded but not rendered.
      updateMarkerIcon();
    }
  }

  public void updateMarkerIcon() {
    if (marker != null) {
      marker.setIcon(getIcon());
    }
  }

  public boolean updateCustomForTracking() {
    if (!tracksViewChangesActive)
      return false;
    updateMarkerIcon();
    return true;
  }

  private void clearDrawableCache() {
    mLastBitmapCreated = null;
  }

  @Override
  public void requestLayout() {
    super.requestLayout();
    if (getChildCount() == 0) {
      if (hasCustomMarkerView) {
        hasCustomMarkerView = false;
        clearDrawableCache();
        updateTracksViewChanges();
        updateMarkerIcon();
      }
    }
  }

  @Override
  protected void onLayout(boolean changed, int l, int t, int r, int b) {
    super.onLayout(changed, l, t, r, b);
    this.height = b - t;
    this.width = r - l;
  }

  public Object getFeature() {
    return marker;
  }
}
