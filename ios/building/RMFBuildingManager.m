//
//  RMFBuildingManager.m
//  react-native-map4d-map
//
//  Created by Huy Dang on 6/10/25.
//  Copyright © 2025 IOTLink. All rights reserved.
//

#import "RMFBuildingManager.h"
#import "RMFBuilding.h"
#import <React/RCTConvert+CoreLocation.h>
#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>

@implementation RMFBuildingManager

RCT_EXPORT_MODULE(RMFBuilding)

- (void)withBuildingForTag:(nonnull NSNumber *)reactTag
                   handler:(void (^)(RMFBuilding *building))handler
{
  RCTUIManager *uiManager = self.bridge.uiManager;
  if (uiManager == nil) {
    RCTLogError(@"UIManager is unavailable on iOS runtime");
    return;
  }

  [uiManager addUIBlock:^(__unused RCTUIManager *manager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
    id view = viewRegistry[reactTag];
    if (![view isKindOfClass:[RMFBuilding class]]) {
      RCTLogError(@"Invalid view returned from registry, expecting RMFBuilding, got: %@", view);
      return;
    }

    handler((RMFBuilding *)view);
  }];
}

- (UIView *)view {
  RMFBuilding *building = [[RMFBuilding alloc] init];
  return building;
}

RCT_EXPORT_VIEW_PROPERTY(name, NSString)
RCT_EXPORT_VIEW_PROPERTY(coordinate, CLLocationCoordinate2D)
RCT_EXPORT_VIEW_PROPERTY(modelUrl, NSString)
RCT_EXPORT_VIEW_PROPERTY(textureUrl, NSString)
RCT_EXPORT_VIEW_PROPERTY(scale, double)
RCT_EXPORT_VIEW_PROPERTY(bearing, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(elevation, double)
RCT_EXPORT_VIEW_PROPERTY(selected, BOOL)
RCT_EXPORT_VIEW_PROPERTY(touchable, BOOL)
RCT_EXPORT_VIEW_PROPERTY(visible, BOOL)
RCT_EXPORT_VIEW_PROPERTY(userData, NSDictionary)
RCT_EXPORT_VIEW_PROPERTY(onPress, RCTBubblingEventBlock)

RCT_EXPORT_METHOD(setName:(nonnull NSNumber *)reactTag name:(NSString *)name) {
  [self withBuildingForTag:reactTag handler:^(RMFBuilding *building) {
    [building setName:name];
  }];
}

RCT_EXPORT_METHOD(setScale:(nonnull NSNumber *)reactTag scale:(double)scale) {
  [self withBuildingForTag:reactTag handler:^(RMFBuilding *building) {
    [building setScale:scale];
  }];
}

RCT_EXPORT_METHOD(setBearing:(nonnull NSNumber *)reactTag bearing:(CGFloat)bearing) {
  [self withBuildingForTag:reactTag handler:^(RMFBuilding *building) {
    [building setBearing:bearing];
  }];
}

RCT_EXPORT_METHOD(setElevation:(nonnull NSNumber *)reactTag elevation:(double)elevation) {
  [self withBuildingForTag:reactTag handler:^(RMFBuilding *building) {
    [building setElevation:elevation];
  }];
}

RCT_EXPORT_METHOD(setSelected:(nonnull NSNumber *)reactTag selected:(BOOL)selected) {
  [self withBuildingForTag:reactTag handler:^(RMFBuilding *building) {
    [building setSelected:selected];
  }];
}

RCT_EXPORT_METHOD(setTouchable:(nonnull NSNumber *)reactTag touchable:(BOOL)touchable) {
  [self withBuildingForTag:reactTag handler:^(RMFBuilding *building) {
    [building setTouchable:touchable];
  }];
}

RCT_EXPORT_METHOD(setVisible:(nonnull NSNumber *)reactTag visible:(BOOL)visible) {
  [self withBuildingForTag:reactTag handler:^(RMFBuilding *building) {
    [building setVisible:visible];
  }];
}

RCT_EXPORT_METHOD(setUserData:(nonnull NSNumber *)reactTag userData:(id)json) {
  [self withBuildingForTag:reactTag handler:^(RMFBuilding *building) {
    [building setUserData:[RCTConvert NSDictionary:json]];
  }];
}

@end
