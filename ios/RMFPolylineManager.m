//
//  RMFPolylineManager.m
//  Map4dMap
//
//  Created by Huy Dang on 7/3/20.
//  Copyright © 2020 IOTLink. All rights reserved.
//

#import "RMFPolylineManager.h"
#import "RMFPolyline.h"
#import <Foundation/Foundation.h>
#import "RCTConvert+Map4dMap.h"
#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>

@implementation RMFPolylineManager


RCT_EXPORT_MODULE(RMFPolyline)

- (void)withPolylineForTag:(nonnull NSNumber *)reactTag
                   handler:(void (^)(RMFPolyline *polyline))handler
{
  RCTUIManager *uiManager = self.bridge.uiManager;
  if (uiManager == nil) {
    RCTLogError(@"UIManager is unavailable on iOS runtime");
    return;
  }

  [uiManager addUIBlock:^(__unused RCTUIManager *manager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
    id view = viewRegistry[reactTag];
    if (![view isKindOfClass:[RMFPolyline class]]) {
      RCTLogError(@"Invalid view returned from registry, expecting RMFPolyline, got: %@", view);
      return;
    }

    handler((RMFPolyline *)view);
  }];
}

- (UIView *)view {
  RMFPolyline * polyline = [[RMFPolyline alloc] init];
  return polyline;
}

RCT_EXPORT_VIEW_PROPERTY(coordinates, RMFCoordinateArray)
RCT_EXPORT_VIEW_PROPERTY(width, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(color, UIColor)
RCT_EXPORT_VIEW_PROPERTY(lineStyle, NSString)
RCT_EXPORT_VIEW_PROPERTY(userInteractionEnabled, BOOL)
RCT_EXPORT_VIEW_PROPERTY(zIndex, float)
RCT_EXPORT_VIEW_PROPERTY(visible, BOOL)
RCT_EXPORT_VIEW_PROPERTY(userData, NSDictionary)

RCT_EXPORT_VIEW_PROPERTY(onPress, RCTBubblingEventBlock)

RCT_EXPORT_METHOD(setCoordinates:(nonnull NSNumber *)reactTag
                  withCoordinates:(id)coordinates)
{
  [self withPolylineForTag:reactTag handler:^(RMFPolyline *polyline) {
    [polyline setCoordinates:[RCTConvert RMFCoordinateArray:coordinates]];
  }];
}

RCT_EXPORT_METHOD(setWidth:(nonnull NSNumber *)reactTag
                  width:(CGFloat)width)
{
  [self withPolylineForTag:reactTag handler:^(RMFPolyline *polyline) {
    [polyline setWidth:width];
  }];
}

RCT_EXPORT_METHOD(setColor:(nonnull NSNumber *)reactTag
                  color:(id)json)
{
  [self withPolylineForTag:reactTag handler:^(RMFPolyline *polyline) {
    UIColor* color = [RCTConvert UIColor:json];
    if (color != nil) {
      [polyline setColor:color];
    }
  }];
}

RCT_EXPORT_METHOD(setLineStyle:(nonnull NSNumber *)reactTag
                  style:(NSString*)style)
{
  [self withPolylineForTag:reactTag handler:^(RMFPolyline *polyline) {
    [polyline setLineStyle:style];
  }];
}

RCT_EXPORT_METHOD(setZIndex:(nonnull NSNumber *)reactTag
                  zIndex:(float)zIndex)
{
  [self withPolylineForTag:reactTag handler:^(RMFPolyline *polyline) {
    [polyline setZIndex:zIndex];
  }];
}

RCT_EXPORT_METHOD(setVisible:(nonnull NSNumber *)reactTag
                  visible:(BOOL)visible)
{
  [self withPolylineForTag:reactTag handler:^(RMFPolyline *polyline) {
    [polyline setVisible:visible];
  }];
}

RCT_EXPORT_METHOD(setUserData:(nonnull NSNumber *)reactTag
                  userData:(id)json)
{
  [self withPolylineForTag:reactTag handler:^(RMFPolyline *polyline) {
    [polyline setUserData:[RCTConvert NSDictionary:json]];
  }];
}


@end
