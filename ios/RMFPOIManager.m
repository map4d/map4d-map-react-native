//
//  RMFPOIManager.m
//  Map4dMap
//
//  Created by Huy Dang on 7/5/20.
//  Copyright © 2020 IOTLink. All rights reserved.
//

#import "RMFPOIManager.h"
#import "RMFPOI.h"
#import "RCTConvert+Map4dMap.h"
#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>
#import <React/RCTConvert+CoreLocation.h>
#import <Foundation/Foundation.h>

@implementation RMFPOIManager

RCT_EXPORT_MODULE(RMFPOI)

- (void)withPOIForTag:(nonnull NSNumber *)reactTag
               handler:(void (^)(RMFPOI *poi))handler
{
  RCTUIManager *uiManager = self.bridge.uiManager;
  if (uiManager == nil) {
    RCTLogError(@"UIManager is unavailable on iOS runtime");
    return;
  }

  [uiManager addUIBlock:^(__unused RCTUIManager *manager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
    id view = viewRegistry[reactTag];
    if (![view isKindOfClass:[RMFPOI class]]) {
      RCTLogError(@"Invalid view returned from registry, expecting RMFPOI, got: %@", view);
      return;
    }

    handler((RMFPOI *)view);
  }];
}

- (UIView *)view {
  RMFPOI * poi = [[RMFPOI alloc] init];
  return poi;
}

RCT_EXPORT_VIEW_PROPERTY(coordinate, CLLocationCoordinate2D)
RCT_EXPORT_VIEW_PROPERTY(title, NSString)
RCT_EXPORT_VIEW_PROPERTY(titleColor, UIColor)
RCT_EXPORT_VIEW_PROPERTY(subtitle, NSString)
RCT_EXPORT_VIEW_PROPERTY(poiType, NSString)
RCT_EXPORT_VIEW_PROPERTY(icon, RMFIcon)
RCT_EXPORT_VIEW_PROPERTY(zIndex, float)
RCT_EXPORT_VIEW_PROPERTY(visible, BOOL)
RCT_EXPORT_VIEW_PROPERTY(userData, NSDictionary)
//RCT_EXPORT_VIEW_PROPERTY(userInteractionEnabled, BOOL)

RCT_EXPORT_VIEW_PROPERTY(onPress, RCTBubblingEventBlock)

RCT_EXPORT_METHOD(setCoordinate:(nonnull NSNumber *)reactTag
                  withCoordinate:(id)coordinate)
{
  [self withPOIForTag:reactTag handler:^(RMFPOI *poi) {
    [poi setCoordinate:[RCTConvert CLLocationCoordinate2D:coordinate]];
  }];
}

RCT_EXPORT_METHOD(setTitle:(nonnull NSNumber *)reactTag
                  withTitle:(NSString*)title)
{
  [self withPOIForTag:reactTag handler:^(RMFPOI *poi) {
    [poi setTitle:title];
  }];
}

RCT_EXPORT_METHOD(setTitleColor:(nonnull NSNumber *)reactTag
                  withColor:(id)json)
{
  [self withPOIForTag:reactTag handler:^(RMFPOI *poi) {
    UIColor* color = [RCTConvert UIColor:json];
    if (color != nil) {
      [poi setTitleColor:color];
    }
  }];
}

RCT_EXPORT_METHOD(setSubTitle:(nonnull NSNumber *)reactTag
                  withSubTitle:(NSString*)subTitle)
{
  [self withPOIForTag:reactTag handler:^(RMFPOI *poi) {
    [poi setSubtitle:subTitle];
  }];
}

RCT_EXPORT_METHOD(setPoiType:(nonnull NSNumber *)reactTag
                  withType:(NSString*)type)
{
  [self withPOIForTag:reactTag handler:^(RMFPOI *poi) {
    [poi setPoiType:type];
  }];
}

RCT_EXPORT_METHOD(setIcon:(nonnull NSNumber *)reactTag
                  withIcon:(id)json)
{
  [self withPOIForTag:reactTag handler:^(RMFPOI *poi) {
    [poi setIcon:[RCTConvert RMFIcon:json]];
  }];
}

RCT_EXPORT_METHOD(setZIndex:(nonnull NSNumber *)reactTag
                  withZIndex:(float)zIndex)
{
  [self withPOIForTag:reactTag handler:^(RMFPOI *poi) {
    [poi setZIndex:zIndex];
  }];
}

RCT_EXPORT_METHOD(setVisible:(nonnull NSNumber *)reactTag
                  visible:(BOOL)visible)
{
  [self withPOIForTag:reactTag handler:^(RMFPOI *poi) {
    [poi setVisible:visible];
  }];
}

RCT_EXPORT_METHOD(setUserData:(nonnull NSNumber *)reactTag
                  userData:(id)json)
{
  [self withPOIForTag:reactTag handler:^(RMFPOI *poi) {
    [poi setUserData:[RCTConvert NSDictionary:json]];
  }];
}

@end
