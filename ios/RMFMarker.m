//
//  RMFMarker.m
//  Map4dMap
//
//  Created by Huy Dang on 4/28/20.
//  Copyright © 2020 IOTLink. All rights reserved.
//

#import "RMFMarker.h"
#import <Foundation/Foundation.h>
#import <React/RCTLog.h>
#import <Map4dMap/Map4dMap.h>
#import "RMFEventResponse.h"
#import "RMFDummyView.h"

@implementation RMFMarker {
//  RCTImageLoaderCancellationBlock _reloadImageCancellationBlock;
    UIView *_iconView;
    NSMutableArray* observables;
}

- (instancetype)init {
  if ((self = [super init])) {
    _map4dMarker = [[RMFMarkerMap4d alloc] init];
    _map4dMarker.reactMarker = self;
    
    _coordinate = _map4dMarker.position;
    _anchor = _map4dMarker.groundAnchor;
    _elevation = _map4dMarker.elevation;
    _rotation = _map4dMarker.rotation;
    _draggable = _map4dMarker.draggable;
    _infoWindowAnchor = _map4dMarker.infoWindowAnchor;
    _title = nil;//_map4dMarker.title;
    _snippet = nil;//_map4dMarker.snippet;
    _icon = nil;
    _zIndex = _map4dMarker.zIndex;
    _visible = true;//!_map4dMarker.isHidden;
    _userData = nil;
    _iconView = nil;
    observables = [[NSMutableArray alloc] init];
  }
  return self;
}

- (void)setMapView:(RMFMapView *)mapView {
  if (mapView != nil) {
    if (self.icon == nil) {
      _map4dMarker.icon = nil;
    } else {
      _map4dMarker.icon = [UIImage imageWithCGImage:self.icon.image.CGImage scale:[UIScreen mainScreen].scale orientation:self.icon.image.imageOrientation];
    }
  }
  _map4dMarker.map = mapView;
}

/** Property */

- (void)setCoordinate:(CLLocationCoordinate2D)coordinate {
  _coordinate = coordinate;
  _map4dMarker.position = coordinate;
}

- (void)setAnchor:(CGPoint)anchor {
  _anchor = anchor;
  _map4dMarker.groundAnchor = anchor;
}

- (void)setElevation:(double)elevation {
  _elevation = elevation;
  _map4dMarker.elevation = elevation;
}

- (void)setRotation:(double)rotation {
  _rotation = rotation;
  _map4dMarker.rotation = rotation;
}

- (void)setDraggable:(BOOL)draggable {
  _draggable = draggable;
  _map4dMarker.draggable = draggable;
}

- (void) setInfoWindowAnchor:(CGPoint)infoWindowAnchor {
  _infoWindowAnchor = infoWindowAnchor;
  _map4dMarker.infoWindowAnchor = infoWindowAnchor;
}

- (void)setTitle:(NSString *)title {
  _title = title;
  _map4dMarker.title = title;
}

- (void)setSnippet:(NSString *)snippet {
  _snippet = snippet;
  _map4dMarker.snippet = snippet;
}

- (void)setIcon:(RMFIcon *)icon {
  _icon = icon;
  if (icon == nil) {
    _map4dMarker.icon = nil;
    return;
  }
  dispatch_async(dispatch_get_global_queue(0,0), ^{
    NSData * imageData = [[NSData alloc] initWithContentsOfURL: [NSURL URLWithString: icon.uri]];
    if (imageData != nil) {
      dispatch_async(dispatch_get_main_queue(), ^{
        self->_icon.image = [UIImage imageWithData:imageData];
        if (self->_map4dMarker.map != nil) {
          CGFloat scale = [UIScreen mainScreen].scale;
          self->_map4dMarker.icon = [UIImage imageWithCGImage:[self->_icon.image CGImage] scale:scale orientation:self->_icon.image.imageOrientation];
        }
      });
    }
  });
}

- (void)setZIndex:(float)zIndex {
  _zIndex = zIndex;
  _map4dMarker.zIndex = zIndex;
}

- (void)setVisible:(BOOL)visible {
  _visible = visible;
  _map4dMarker.isHidden = !visible;
}

- (void)setUserInteractionEnabled:(BOOL)enabled {
  [super setUserInteractionEnabled:enabled];
  _map4dMarker.userInteractionEnabled = enabled;
}

 - (void)setUserData:(NSDictionary *)userData {
   _userData = userData;
 }

- (NSDictionary*)responseWithAction:(NSString*)action pixel:(CGPoint)pixel {
  CLLocationCoordinate2D tapLocation = [_map4dMarker.map.projection coordinateForPoint:pixel];
  NSMutableDictionary* response = [NSMutableDictionary dictionaryWithDictionary:[RMFEventResponse fromCoordinate:tapLocation
                                                                                                           pixel:pixel]];
  response[@"marker"] = @{
    kRMFLatLngCoordinateResponseKey: [RMFEventResponse fromCoordinate:_map4dMarker.position],
    @"userData": _userData != nil ? _userData : @{}
  };
  response[@"action"] = action;
  return response;
}

/** Event */
- (void)didBeginDraggingMarkerAtPixel:(CGPoint)pixel {
  if (self.onDragStart) {
    self.onDragStart([self responseWithAction:@"marker-drag-start" pixel:pixel]);
  }
}

- (void)didEndDraggingMarkerAtPixel:(CGPoint)pixel {
  if (self.onDragEnd) {
    self.onDragEnd([self responseWithAction:@"marker-drag-end" pixel:pixel]);
  }
}

- (void)didDragMarkerAtPixel:(CGPoint)pixel {
  if (self.onDrag) {
    self.onDrag([self responseWithAction:@"marker-drag" pixel:pixel]);
  }
}

- (void)didTapInfoWindowAtPixel:(CGPoint)pixel {
  if (self.onPressInfoWindow) {
    self.onPressInfoWindow([self responseWithAction:@"marker-info-window-press" pixel:pixel]);
  }
}

- (void)didTapAtPixel:(CGPoint)pixel {
  if (self.onPress) {
    self.onPress([self responseWithAction:@"marker-press" pixel:pixel]);
  };
}

- (void)layoutSubviews {
    [super layoutSubviews];
  float width = 0;
  float height = 0;

  for (UIView *v in [_iconView subviews]) {
    float fw = v.frame.origin.x + v.frame.size.width;
    float fh = v.frame.origin.y + v.frame.size.height;

    width = MAX(fw, width);
    height = MAX(fh, height);
  }
  [_iconView setFrame:CGRectMake(0, 0, width, height)];
  [self->_map4dMarker setIconView:_iconView];
}

- (void)iconViewInsertSubview:(UIView*)subview atIndex:(NSInteger)atIndex {
  if (!_map4dMarker.iconView) {
    _iconView = [[UIView alloc] init];
    _map4dMarker.iconView = _iconView;
  }
  [_iconView insertSubview:subview atIndex:atIndex];
}

- (void) removeAllObserver {
    for (UIView* v in observables) {
        [v removeObserver:self forKeyPath:@"image"];
        [v removeObserver:self forKeyPath:@"bounds"];
    }
    [observables removeAllObjects];
}

- (void)observeValueForKeyPath:(NSString *)keyPath ofObject:(id)object change:(NSDictionary *)change context:(void *)context
{
    UIApplicationState appState = [[UIApplication sharedApplication] applicationState];
    if (context == (__bridge void * _Nullable)(_iconView)) {
        if (_map4dMarker != NULL) {
            //TODO: remove me
            //RCTImageView will clear image when window == nil or app go to background mode --> causes a bug, marker is updated without image.
            //TODO: how to fix if we stop cheating?
            if (context == (__bridge void * _Nullable) self.map4dMarker.iconView
                && (!self.window || appState == UIApplicationStateBackground)
                ) {
                return;
            }
            [self.map4dMarker setIconView:_iconView];
        }
    } else {
        [super observeValueForKeyPath:keyPath ofObject:object change:change context:context];
    }
}

- (void)addObserver:(UIView*)view {
  // RCTImageView is unavailable when React Native is built with
  // RCT_REMOVE_LEGACY_ARCH. Observe both the legacy wrapper (when present)
  // and Fabric's underlying UIImageView without linking to the removed class.
  Class legacyImageViewClass = NSClassFromString(@"RCTImageView");
  BOOL isLegacyImageView = legacyImageViewClass != Nil && [view isKindOfClass:legacyImageViewClass];
  if (isLegacyImageView || [view isKindOfClass:[UIImageView class]]) {
    [view addObserver:self forKeyPath:@"image" options:NSKeyValueObservingOptionNew context:(__bridge void * _Nullable)(_iconView)];
    [view addObserver:self forKeyPath:@"bounds" options:NSKeyValueObservingOptionNew context:(__bridge void * _Nullable)(_iconView)];
    [observables addObject:view];
  }

  for (UIView *subview in view.subviews) {
    [self addObserver:subview];
  }
}


- (void)insertReactSubview:(id<RCTComponent>)subview atIndex:(NSInteger)atIndex {
  [self iconViewInsertSubview:(UIView*)subview atIndex:atIndex+1];
  [self removeAllObserver];
  [self addObserver:(UIView *) subview];
  RMFDummyView *dummySubview = [[RMFDummyView alloc] initWithView:(UIView *)subview];
  [super insertReactSubview:(UIView*)dummySubview atIndex:atIndex];
}

- (void)removeReactSubview:(id<RCTComponent>)dummySubview {
  [self removeAllObserver];
  UIView* subview = ((RMFDummyView*)dummySubview).view;
  [(UIView*)subview removeFromSuperview];
  [super removeReactSubview:(UIView*)dummySubview];
}

- (void)dealloc {
  [self removeAllObserver];
}

@end
