//
//  RMFCircleManager.m
//  Map4dMap
//
//  Created by Huy Dang on 7/3/20.
//  Copyright © 2020 IOTLink. All rights reserved.
//

#import "RMFCircleManager.h"
#import "RMFCircle.h"
#import <Foundation/Foundation.h>
#import <React/RCTConvert+CoreLocation.h>
#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>

@implementation RMFCircleManager

RCT_EXPORT_MODULE(RMFCircle)

- (void)withCircleForTag:(nonnull NSNumber *)reactTag
                 handler:(void (^)(RMFCircle *circle))handler
{
  RCTUIManager *uiManager = self.bridge.uiManager;
  if (uiManager == nil) {
    RCTLogError(@"UIManager is unavailable on iOS runtime");
    return;
  }

  [uiManager addUIBlock:^(__unused RCTUIManager *manager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
    id view = viewRegistry[reactTag];
    if (![view isKindOfClass:[RMFCircle class]]) {
      RCTLogError(@"Invalid view returned from registry, expecting RMFCircle, got: %@", view);
      return;
    }

    handler((RMFCircle *)view);
  }];
}

- (UIView *)view {
  RMFCircle * circle = [[RMFCircle alloc] init];
  return circle;
}

RCT_REMAP_VIEW_PROPERTY(center, centerCoordinate, CLLocationCoordinate2D)
RCT_EXPORT_VIEW_PROPERTY(radius, double)
RCT_EXPORT_VIEW_PROPERTY(fillColor, UIColor)
RCT_EXPORT_VIEW_PROPERTY(strokeColor, UIColor)
RCT_EXPORT_VIEW_PROPERTY(strokeWidth, double)
RCT_EXPORT_VIEW_PROPERTY(userInteractionEnabled, BOOL)
RCT_EXPORT_VIEW_PROPERTY(zIndex, float)
RCT_EXPORT_VIEW_PROPERTY(visible, BOOL)
RCT_EXPORT_VIEW_PROPERTY(userData, NSDictionary)

RCT_EXPORT_VIEW_PROPERTY(onPress, RCTBubblingEventBlock)

RCT_EXPORT_METHOD(setCenter:(nonnull NSNumber *)reactTag
                  withCoordinate:(id)coordinate)
{
  [self withCircleForTag:reactTag handler:^(RMFCircle *circle) {
    [circle setCenterCoordinate:[RCTConvert CLLocationCoordinate2D:coordinate]];
  }];
}

RCT_EXPORT_METHOD(setRadius:(nonnull NSNumber *)reactTag
                  withRadius:(double)radius)
{
  [self withCircleForTag:reactTag handler:^(RMFCircle *circle) {
    [circle setRadius:radius];
  }];
}

RCT_EXPORT_METHOD(setFillColor:(nonnull NSNumber *)reactTag
                  color:(id)color)
{
  [self withCircleForTag:reactTag handler:^(RMFCircle *circle) {
    UIColor* fillCorlor = [RCTConvert UIColor:color];
    if (fillCorlor != nil) {
      [circle setFillColor:fillCorlor];
    }
  }];
}

RCT_EXPORT_METHOD(setStrokeColor:(nonnull NSNumber *)reactTag
                  color:(id)color)
{
  [self withCircleForTag:reactTag handler:^(RMFCircle *circle) {
    UIColor* strokeColor = [RCTConvert UIColor:color];
    if (strokeColor != nil) {
      [circle setStrokeColor:strokeColor];
    }
  }];
}

RCT_EXPORT_METHOD(setStrokeWidth:(nonnull NSNumber *)reactTag
                  width:(double)width)
{
  [self withCircleForTag:reactTag handler:^(RMFCircle *circle) {
    [circle setStrokeWidth:width];
  }];
}

RCT_EXPORT_METHOD(setZIndex:(nonnull NSNumber *)reactTag
                  zIndex:(float)zIndex)
{
  [self withCircleForTag:reactTag handler:^(RMFCircle *circle) {
    [circle setZIndex:zIndex];
  }];
}

RCT_EXPORT_METHOD(setVisible:(nonnull NSNumber *)reactTag
                  visible:(BOOL)visible)
{
  [self withCircleForTag:reactTag handler:^(RMFCircle *circle) {
    [circle setVisible:visible];
  }];
}

RCT_EXPORT_METHOD(setUserData:(nonnull NSNumber *)reactTag
                  userData:(id)json)
{
  [self withCircleForTag:reactTag handler:^(RMFCircle *circle) {
    [circle setUserData:[RCTConvert NSDictionary:json]];
  }];
}

@end
