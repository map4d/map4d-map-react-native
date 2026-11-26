//
//  RMFMarkerManager.m
//  Map4dMap
//
//  Created by Huy Dang on 4/28/20.
//  Copyright © 2020 IOTLink. All rights reserved.
//

#import "RMFMarkerManager.h"
#import "RMFMarker.h"
#import <React/RCTConvert+CoreLocation.h>
#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>

@implementation RMFMarkerManager

RCT_EXPORT_MODULE(RMFMarker)

- (void)withMarkerForTag:(nonnull NSNumber *)reactTag
                 handler:(void (^)(RMFMarker *marker))handler
{
    RCTUIManager *uiManager = self.bridge.uiManager;
    if (uiManager == nil) {
        RCTLogError(@"UIManager is unavailable on iOS runtime");
        return;
    }

    [uiManager addUIBlock:^(__unused RCTUIManager *manager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        id view = viewRegistry[reactTag];
        if (![view isKindOfClass:[RMFMarker class]]) {
            RCTLogError(@"Invalid view returned from registry, expecting RMFMarker, got: %@", view);
            return;
        }

        handler((RMFMarker *)view);
    }];
}

- (UIView *)view {
  RMFMarker * marker = [[RMFMarker alloc] init];
  return marker;
}

RCT_EXPORT_VIEW_PROPERTY(coordinate, CLLocationCoordinate2D)
RCT_EXPORT_VIEW_PROPERTY(anchor, CGPoint)
RCT_EXPORT_VIEW_PROPERTY(elevation, double)
RCT_EXPORT_VIEW_PROPERTY(rotation, double)
RCT_EXPORT_VIEW_PROPERTY(draggable, BOOL)
RCT_EXPORT_VIEW_PROPERTY(infoWindowAnchor, CGPoint)
RCT_EXPORT_VIEW_PROPERTY(title, NSString)
RCT_EXPORT_VIEW_PROPERTY(snippet, NSString)
RCT_EXPORT_VIEW_PROPERTY(userInteractionEnabled, BOOL)
RCT_EXPORT_VIEW_PROPERTY(icon, RMFIcon)
RCT_EXPORT_VIEW_PROPERTY(zIndex, float)
RCT_EXPORT_VIEW_PROPERTY(visible, BOOL)
RCT_EXPORT_VIEW_PROPERTY(userData, NSDictionary)

RCT_EXPORT_VIEW_PROPERTY(onPress, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onPressInfoWindow, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onDragStart, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onDrag, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onDragEnd, RCTDirectEventBlock)

RCT_EXPORT_METHOD(setCoordinate:(nonnull NSNumber *)reactTag
                  withCoordinate:(id)coordinate)
{
    [self withMarkerForTag:reactTag handler:^(RMFMarker *marker) {
        [marker setCoordinate:[RCTConvert CLLocationCoordinate2D:coordinate]];
    }];
}

RCT_EXPORT_METHOD(setRotation:(nonnull NSNumber *)reactTag
                  rotation:(double)rotation)
{
    [self withMarkerForTag:reactTag handler:^(RMFMarker *marker) {
        [marker setRotation:rotation];
    }];
}

RCT_EXPORT_METHOD(setTitle:(nonnull NSNumber *)reactTag
                  title:(NSString*)title)
{
    [self withMarkerForTag:reactTag handler:^(RMFMarker *marker) {
        [marker setTitle:title];
    }];
}

RCT_EXPORT_METHOD(setSnippet:(nonnull NSNumber *)reactTag
                  snippet:(NSString*)snippet)
{
    [self withMarkerForTag:reactTag handler:^(RMFMarker *marker) {
        [marker setSnippet:snippet];
    }];
}

RCT_EXPORT_METHOD(setDraggable:(nonnull NSNumber *)reactTag
                  draggable:(BOOL)draggable)
{
    [self withMarkerForTag:reactTag handler:^(RMFMarker *marker) {
        [marker setDraggable:draggable];
    }];
}

RCT_EXPORT_METHOD(setZIndex:(nonnull NSNumber *)reactTag
                  zIndex:(float)zIndex)
{
    [self withMarkerForTag:reactTag handler:^(RMFMarker *marker) {
        [marker setZIndex:zIndex];
    }];
}

RCT_EXPORT_METHOD(setVisible:(nonnull NSNumber *)reactTag
                  visible:(BOOL)visible)
{
    [self withMarkerForTag:reactTag handler:^(RMFMarker *marker) {
      [marker setVisible:visible];
    }];
}

RCT_EXPORT_METHOD(setUserData:(nonnull NSNumber *)reactTag
                  userData:(id)json)
{
    [self withMarkerForTag:reactTag handler:^(RMFMarker *marker) {
      [marker setUserData:[RCTConvert NSDictionary:json]];
    }];
}

@end
