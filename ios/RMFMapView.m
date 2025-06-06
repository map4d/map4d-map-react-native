//
//  RMFMapView.m
//  Map4dMap
//
//  Created by Huy Dang on 4/27/20.
//  Copyright © 2020 IOTLink. All rights reserved.
//

#import "RMFMapView.h"
#import <Foundation/Foundation.h>
#import <React/RCTConvert+CoreLocation.h>
#import <React/RCTComponent.h>
#import <React/RCTBridge.h>
#import <React/RCTLog.h>
#import "RMFMarker.h"
#import "RMFCircle.h"
#import "RMFPolyline.h"
#import "RMFPolygon.h"
#import "RMFPOI.h"
#import "RMFBuilding.h"
#import "RMFDirectionsRenderer.h"
#import "RMFTileOverlay.h"
#import "RMFEventResponse.h"

@class GLKView;

@interface MFMapView()
- (void)glkView:(nonnull GLKView *)view drawInRect:(CGRect)rect;
- (void)respondToTapGesture:(UITapGestureRecognizer *)tapRecognizer;
- (void)respondToPanGesture:(UIPanGestureRecognizer *)panRecognizer;
- (void)respondToLongPressGesture:(UILongPressGestureRecognizer *)panRecognizer;
@end

@interface RMFMapView()
@property(nonatomic, readwrite) CGPoint lastTapPixel;
@property(nonatomic, readwrite) CGPoint lastPanPixel;
@property(nonatomic, readwrite) CGPoint lastLongPressPixel;
@end

@implementation RMFMapView {
  bool _didCallOnMapReady;
  NSMutableArray<UIView *> *_reactSubviews;
}

- (instancetype _Nonnull)init {
  if ((self = [super init])) {
    _didCallOnMapReady = false;
    _reactSubviews = [NSMutableArray new];
  }
  return self;
}

- (instancetype _Nonnull )initWithFrame: (CGRect)frame {
  if ((self = [super initWithFrame:frame])) {
    _didCallOnMapReady = false;
    _reactSubviews = [NSMutableArray new];
  }
  return self;
}

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wobjc-missing-super-calls"
- (void)insertReactSubview:(id<RCTComponent>)subview atIndex:(NSInteger)atIndex {
  if ([subview isKindOfClass:[RMFMarker class]]) {
    RMFMarker *marker = (RMFMarker*)subview;
    [marker setMapView:self];
    //[super insertReactSubview:marker atIndex:atIndex];
  }
  else if ([subview isKindOfClass:[RMFCircle class]]) {
    RMFCircle *circle = (RMFCircle*)subview;
    [circle setMapView:self];
    //[super insertReactSubview:circle atIndex:atIndex];
  }
  else if ([subview isKindOfClass:[RMFPolyline class]]) {
    RMFPolyline* polyline = (RMFPolyline*)subview;
    [polyline setMapView:self];
    //[super insertReactSubview:polyline atIndex:atIndex];
  }
  else if ([subview isKindOfClass:[RMFPolygon class]]) {
    RMFPolygon* polygon = (RMFPolygon*)subview;
    [polygon setMapView:self];
  }
  else if ([subview isKindOfClass:[RMFPOI class]]) {
    RMFPOI* poi = (RMFPOI*)subview;
    [poi setMapView:self];
    //[super insertReactSubview:poi atIndex:atIndex];
  }
  else if ([subview isKindOfClass:[RMFBuilding class]]) {
    RMFBuilding* building = (RMFBuilding*)subview;
    [building setMapView:self];
  }
  else if ([subview isKindOfClass:[RMFDirectionsRenderer class]]) {
    RMFDirectionsRenderer* renderer = (RMFDirectionsRenderer*)subview;
    [renderer setMapView:self];
  }
  else if ([subview isKindOfClass:[RMFTileOverlay class]]) {
    RMFTileOverlay* overlay = (RMFTileOverlay*)subview;
    [overlay setMapView:self];
  }
  else {
    NSArray<id<RCTComponent>> *childSubviews = [subview reactSubviews];
    for (int i = 0; i < childSubviews.count; i++) {
      [self insertReactSubview:(UIView *)childSubviews[i] atIndex:atIndex];
    }
  }

  [_reactSubviews insertObject:(UIView *)subview atIndex:(NSUInteger) atIndex];
}
#pragma clang diagnostic pop

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wobjc-missing-super-calls"
- (void)removeReactSubview:(UIView *)subview {
  if ([subview isKindOfClass:[RMFMarker class]]) {
    RMFMarker* marker = (RMFMarker*)subview;
    marker.map4dMarker.map = nil;
  }
  else if ([subview isKindOfClass:[RMFCircle class]]) {
    RMFCircle* circle = (RMFCircle*)subview;
    circle.map4dCircle.map = nil;
  }
  else if ([subview isKindOfClass:[RMFPolyline class]]) {
    RMFPolyline* polyline = (RMFPolyline*)subview;
    polyline.map4dPolyline.map = nil;
  }
  else if ([subview isKindOfClass:[RMFPolygon class]]) {
    RMFPolygon* polygon = (RMFPolygon*)subview;
    polygon.map4dPolygon.map = nil;
  }
  else if ([subview isKindOfClass:[RMFPOI class]]) {
    RMFPOI* poi = (RMFPOI*)subview;
    poi.map4dPOI.map = nil;
  }
  else if ([subview isKindOfClass:[RMFBuilding class]]) {
    RMFBuilding* building = (RMFBuilding*)subview;
    [building setMapView:nil];
  }
  else if ([subview isKindOfClass:[RMFDirectionsRenderer class]]) {
    RMFDirectionsRenderer* renderer = (RMFDirectionsRenderer*)subview;
    [renderer setMapView:nil];
  }
  else if ([subview isKindOfClass:[RMFTileOverlay class]]) {
    RMFTileOverlay* overlay = (RMFTileOverlay*)subview;
    [overlay setMapView:nil];
  }
  else {
    NSArray<id<RCTComponent>> *childSubviews = [subview reactSubviews];
    for (int i = 0; i < childSubviews.count; i++) {
      [self removeReactSubview:(UIView *)childSubviews[i]];
    }
  }
  [_reactSubviews removeObject:(UIView *)subview];
}
#pragma clang diagnostic pop

- (void)setMapIdProp:(NSString *)mapIdProp {
  if ([mapIdProp length] == 0) {
    return;
  }
  [self setMapID:[MFMapID mapIDWithIdentifier:mapIdProp]];
}

- (void)setCameraProp:(MFCameraPosition *)cameraProp {
  _cameraProp = cameraProp;
  self.camera = cameraProp;
}

- (void)setMapTypeProp:(NSString *)mapTypeProp {
  _mapTypeProp = mapTypeProp;
  if ([@"hybrid" caseInsensitiveCompare:mapTypeProp] == NSOrderedSame) {
    self.mapType = MFMapTypeHybrid;
  }
  else if ([@"satellite" caseInsensitiveCompare:mapTypeProp] == NSOrderedSame) {
    self.mapType = MFMapTypeSatellite;
  }
  else {
    self.mapType = MFMapTypeRoadmap;
  }
}

- (void)setShowsBuildings:(BOOL)showsBuildings {
  _showsBuildings = showsBuildings;
  [self setBuildingsEnabled:showsBuildings];
}

- (void)setShowsPOIs:(BOOL)showsPOIs {
  _showsPOIs = showsPOIs;
  [self setPOIsEnabled:showsPOIs];
}

- (void)setZoomGesturesEnabled:(BOOL)enabled {
  _zoomGesturesEnabled = enabled;
  self.settings.zoomGestures = enabled;
}

- (void)setScrollGesturesEnabled:(BOOL)enabled {
  _scrollGesturesEnabled = enabled;
  self.settings.scrollGestures = enabled;
}

- (void)setRotateGesturesEnabled:(BOOL)enabled {
  _rotateGesturesEnabled = enabled;
  self.settings.rotateGestures = enabled;
}

- (void)setTiltGesturesEnabled:(BOOL)enabled {
  _tiltGesturesEnabled = enabled;
  self.settings.tiltGestures = enabled;
}

- (void)setShowsMyLocationButton:(BOOL)showsMyLocationButton {
  _showsMyLocationButton = showsMyLocationButton;
  self.settings.myLocationButton = showsMyLocationButton;
}

- (void)setShowsMyLocation:(BOOL)showsMyLocation {
  _showsMyLocation = showsMyLocation;
  [self setMyLocationEnabled:showsMyLocation];
}

- (void)didTapAtCoordinate:(CLLocationCoordinate2D)coordinate {
  if (!self.onPress) return;
  
  NSMutableDictionary* response = [NSMutableDictionary dictionaryWithDictionary:[RMFEventResponse fromCoordinate:coordinate
                                                                                                              pixel:_lastTapPixel]];
  response[@"action"] = @"map-press";
  self.onPress(response);
}

- (void)didTapPOIWithPlaceID:(NSString *)placeID name:(NSString *)name location:(CLLocationCoordinate2D)location {
  if (!self.onPoiPress) {
    return;
  }
  
  CLLocationCoordinate2D tapLocation = [self.projection coordinateForPoint:_lastTapPixel];
  NSMutableDictionary* response = [NSMutableDictionary dictionaryWithDictionary:[RMFEventResponse fromCoordinate:tapLocation
                                                                                                              pixel:_lastTapPixel]];
  response[@"poi"] = @{
    @"id": placeID,
    @"title": name,
    kRMFLatLngCoordinateResponseKey: [RMFEventResponse fromCoordinate:location]
  };
  response[@"action"] = @"map-poi-press";
  
  self.onPoiPress(response);
}

- (void)didTapBuildingWithBuildingID:(NSString *)buildingID name:(NSString *)name location:(CLLocationCoordinate2D)location {
  if (!self.onBuildingPress) {
    return;
  }
  
  CLLocationCoordinate2D tapLocation = [self.projection coordinateForPoint:_lastTapPixel];
  NSMutableDictionary* response = [NSMutableDictionary dictionaryWithDictionary:[RMFEventResponse fromCoordinate:tapLocation
                                                                                                              pixel:_lastTapPixel]];
  response[@"building"] = @{
    @"id": buildingID,
    @"name": name,
    kRMFLatLngCoordinateResponseKey: [RMFEventResponse fromCoordinate:location]
  };
  response[@"action"] = @"map-building-press";

  self.onBuildingPress(response);
}

- (void)didTapPlaceWithName:(NSString*)name location:(CLLocationCoordinate2D)location {
  if (!self.onPlacePress) {
    return;
  }
  
  CLLocationCoordinate2D tapLocation = [self.projection coordinateForPoint:_lastTapPixel];
  NSMutableDictionary* response = [NSMutableDictionary dictionaryWithDictionary:
                                   [RMFEventResponse fromCoordinate:tapLocation pixel:_lastTapPixel]];
  response[@"place"] = @{
    @"name": name,
    kRMFLatLngCoordinateResponseKey: [RMFEventResponse fromCoordinate:location]
  };
  response[@"action"] = @"map-place-press";

  self.onPlacePress(response);
}

- (void)didTapDataSourceFeature:(MFDataSourceFeature *)feature location:(CLLocationCoordinate2D)location {
  if (!self.onDataSourceFeaturePress) {
    return;
  }
  
  CLLocationCoordinate2D tapLocation = [self.projection coordinateForPoint:_lastTapPixel];
  NSMutableDictionary* response = [NSMutableDictionary dictionaryWithDictionary:
                                   [RMFEventResponse fromCoordinate:tapLocation pixel:_lastTapPixel]];
  response[@"feature"] = @{
    @"source": feature.source,
    @"sourceLayer": feature.sourceLayer,
    @"layerType": feature.layerType,
    @"properties": feature.properties,
    @"location": [RMFEventResponse fromCoordinate:location],
  };
  response[@"action"] = @"data-source-feature-press";
  
  self.onDataSourceFeaturePress(response);
}

- (BOOL)didTapMyLocationButton {
  if (self.onMyLocationButtonPress) {
    self.onMyLocationButtonPress(@{ @"action": @"my-location-button-press" });
  }
  return false;
}

- (void)willMove: (BOOL) gesture {
  if (!self.onCameraMoveStart) {
    return;
  }
  NSMutableDictionary* response = [NSMutableDictionary dictionaryWithDictionary:[RMFEventResponse fromCameraPosition: self.camera]];
  response[@"gesture"] = [NSNumber numberWithBool:gesture];
  response[@"action"] = @"camera-move-started";
  self.onCameraMoveStart(response);
}

- (void)movingCameraPosition:(MFCameraPosition *)position {
  if (!self.onCameraMove) {
    return;
  }
  
  NSMutableDictionary* response = [NSMutableDictionary dictionaryWithDictionary:[RMFEventResponse fromCameraPosition:position]];
  response[@"action"] = @"camera-move";
  self.onCameraMove(response);
}

- (void)didChangeCameraPosition:(MFCameraPosition *)position {
}

- (void)idleAtCameraPosition: (MFCameraPosition *) position {
  if (!self.onCameraIdle) {
    return;
  }
  NSMutableDictionary* response = [NSMutableDictionary dictionaryWithDictionary:[RMFEventResponse fromCameraPosition:position]];
  response[@"action"] = @"camera-idle";
  self.onCameraIdle(response);
}

#pragma mark - MapView Override

- (void)glkView:(nonnull GLKView *)view drawInRect:(CGRect)rect {
  [super glkView:view drawInRect:rect];
  
  if (_didCallOnMapReady) return;
  _didCallOnMapReady = true;
  if (self.onMapReady) self.onMapReady(@{});
}

- (void)respondToTapGesture:(UITapGestureRecognizer *)tapRecognizer {
  _lastTapPixel = [tapRecognizer locationInView:self];
  [super respondToTapGesture:tapRecognizer];
}

- (void)respondToPanGesture:(UIPanGestureRecognizer *)panRecognizer {
  _lastPanPixel = [panRecognizer locationInView:self];
  [super respondToPanGesture:panRecognizer];
}

- (void)respondToLongPressGesture:(UILongPressGestureRecognizer *)panRecognizer {
  _lastLongPressPixel = [panRecognizer locationInView:self];
  [super respondToLongPressGesture:panRecognizer];
}

#pragma clang diagnostic pop

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wobjc-missing-super-calls"
- (NSArray<id<RCTComponent>> *)reactSubviews {
  return _reactSubviews;
}
#pragma clang diagnostic pop

@end
