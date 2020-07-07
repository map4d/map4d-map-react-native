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
#import <RMFMarker.h>
#import <RMFCircle.h>
#import <RMFPolyline.h>
#import <RMFPOI.h>

@implementation RMFMapView

- (void)insertReactSubview:(id<RCTComponent>)subview atIndex:(NSInteger)atIndex {
  if ([subview isKindOfClass:[RMFMarker class]]) {
    RMFMarker *marker = (RMFMarker*)subview;
    [marker setMapView:self];
    [super insertReactSubview:marker atIndex:atIndex];
  }
  else if ([subview isKindOfClass:[RMFCircle class]]) {
    RMFCircle *circle = (RMFCircle*)subview;
    [circle setMapView:self];
    [super insertReactSubview:circle atIndex:atIndex];
  }
  else if ([subview isKindOfClass:[RMFPolyline class]]) {
    RMFPolyline* polyline = (RMFPolyline*)subview;
    [polyline setMapView:self];
    [super insertReactSubview:polyline atIndex:atIndex];
  }
  else if ([subview isKindOfClass:[RMFPOI class]]) {
    RMFPOI* poi = (RMFPOI*)subview;
    [poi setMapView:self];
    [super insertReactSubview:poi atIndex:atIndex];
  }
}

- (void)removeReactSubview:(UIView *)subview {
  if ([subview isKindOfClass:[RMFMarker class]]) {
    RMFMarker* marker = (RMFMarker*)subview;
    marker.realMarker.map = nil;
  }
  else if ([subview isKindOfClass:[RMFCircle class]]) {
    RMFCircle* circle = (RMFCircle*)subview;
    circle.map4dCircle.map = nil;
  }
  else if ([subview isKindOfClass:[RMFPolyline class]]) {
    RMFPolyline* polyline = (RMFPolyline*)subview;
    polyline.map4dPolyline.map = nil;
  }
  else if ([subview isKindOfClass:[RMFPOI class]]) {
    RMFPOI* poi = (RMFPOI*)subview;
    poi.map4dPOI.map = nil;
  }
  [super removeReactSubview:subview];
}

- (void)setCameraProp:(MFCameraPosition *)cameraProp {
  _cameraProp = cameraProp;
  self.camera = cameraProp;
}

- (void)setShowsBuildings:(BOOL)showsBuildings {
  _showsBuildings = showsBuildings;
  [self setObjectsEnabled:showsBuildings];
}

- (void)setShowsMyLocationButton:(BOOL)showsMyLocationButton {
  _showsMyLocationButton = showsMyLocationButton;
  [self setMyLocationEnabled:showsMyLocationButton];
}

- (void)didTapAtCoordinate:(CLLocationCoordinate2D)coordinate {
  if (!self.onPress) return;
  self.onPress(
    @{
      @"coordinate": @{
        @"latitude": @(coordinate.latitude),
        @"longitude": @(coordinate.longitude),
      }
    }
  );
}

@end
