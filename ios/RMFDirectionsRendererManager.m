//
//  RMFDirectionsRendererManager.m
//  Map4dMap React Native
//
//  Created by Huy Dang on 11/15/21.
//

#import "RMFDirectionsRendererManager.h"
#import "RMFDirectionsRenderer.h"
#import "RCTConvert+Map4dMap.h"
#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>

@implementation RMFDirectionsRendererManager

RCT_EXPORT_MODULE(RMFDirectionsRenderer)

- (void)withRendererForTag:(nonnull NSNumber *)reactTag
                   handler:(void (^)(RMFDirectionsRenderer *renderer))handler
{
  RCTUIManager *uiManager = self.bridge.uiManager;
  if (uiManager == nil) {
    RCTLogError(@"UIManager is unavailable on iOS runtime");
    return;
  }

  [uiManager addUIBlock:^(__unused RCTUIManager *manager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
    id view = viewRegistry[reactTag];
    if (![view isKindOfClass:[RMFDirectionsRenderer class]]) {
      RCTLogError(@"Invalid view returned from registry, expecting RMFDirectionsRenderer, got: %@", view);
      return;
    }

    handler((RMFDirectionsRenderer *)view);
  }];
}

- (UIView*)view {
  RMFDirectionsRenderer* renderer = [[RMFDirectionsRenderer alloc] init];
  return renderer;
}

RCT_EXPORT_VIEW_PROPERTY(routes, RMFCoordinateArrayArray)
RCT_EXPORT_VIEW_PROPERTY(directions, NSString)
RCT_EXPORT_VIEW_PROPERTY(activedIndex, NSUInteger)

RCT_EXPORT_VIEW_PROPERTY(activeStrokeWidth, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(activeStrokeColor, UIColor)
RCT_EXPORT_VIEW_PROPERTY(activeOutlineWidth, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(activeOutlineColor, UIColor)

RCT_EXPORT_VIEW_PROPERTY(inactiveStrokeWidth, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(inactiveStrokeColor, UIColor)
RCT_EXPORT_VIEW_PROPERTY(inactiveOutlineWidth, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(inactiveOutlineColor, UIColor)

RCT_EXPORT_VIEW_PROPERTY(originPOIOptions, RMFDirectionsMarkerOptions)
RCT_EXPORT_VIEW_PROPERTY(destinationPOIOptions, RMFDirectionsMarkerOptions)

RCT_EXPORT_VIEW_PROPERTY(onPress, RCTBubblingEventBlock)

RCT_EXPORT_METHOD(setActivedIndex:(nonnull NSNumber *)reactTag
                  withRouteIndex:(NSUInteger)routeIndex)
{
  [self withRendererForTag:reactTag handler:^(RMFDirectionsRenderer *renderer) {
    renderer.activedIndex = routeIndex;
  }];
}

RCT_EXPORT_METHOD(setRoutes:(nonnull NSNumber *)reactTag
                  withRoutes:(id)routes)
{
  [self withRendererForTag:reactTag handler:^(RMFDirectionsRenderer *renderer) {
    [renderer setRoutes:[RCTConvert RMFCoordinateArrayArray:routes]];
  }];
}

RCT_EXPORT_METHOD(setDirections:(nonnull NSNumber *)reactTag
                  withDirections:(NSString*)directions)
{
  [self withRendererForTag:reactTag handler:^(RMFDirectionsRenderer *renderer) {
    [renderer.map4dDirectionsRenderer setRoutesWithJson:directions];
  }];
}

@end
