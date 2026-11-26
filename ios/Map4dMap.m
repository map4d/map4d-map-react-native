#import "Map4dMap.h"
#import <Foundation/Foundation.h>
#import <React/RCTBridge.h>
#import <React/RCTLog.h>
#import <React/RCTUIManager.h>
#import <React/RCTConvert+CoreLocation.h>
#import "RCTConvert+Map4dMap.h"
#import "RMFEventResponse.h"
#import "RMFMapView.h"


@implementation Map4dMap

RCT_EXPORT_MODULE()

- (void)withMapViewForTag:(nonnull NSNumber *)reactTag
                  rejecter:(RCTPromiseRejectBlock)reject
                   handler:(void (^)(RMFMapView *mapView))handler
{
    RCTUIManager *uiManager = self.bridge.uiManager;
    if (uiManager == nil) {
        if (reject) {
            reject(@"E_UI_MANAGER_UNAVAILABLE", @"UIManager is unavailable on iOS runtime", nil);
        } else {
            RCTLogError(@"UIManager is unavailable on iOS runtime");
        }
        return;
    }

    [uiManager addUIBlock:^(__unused RCTUIManager *manager,
                            NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        id view = viewRegistry[reactTag];
        if (![view isKindOfClass:[RMFMapView class]]) {
            if (reject) {
                reject(@"E_INVALID_VIEW",
                       [NSString stringWithFormat:@"Invalid view returned from registry, expecting RMFMapView, got: %@", view],
                       nil);
            } else {
                RCTLogError(@"Invalid view returned from registry, expecting RMFMapView, got: %@", view);
            }
            return;
        }

        handler((RMFMapView *)view);
    }];
}

RCT_EXPORT_METHOD(getCamera:(nonnull NSNumber *)reactTag
                                    resolver:(RCTPromiseResolveBlock)resolve
                                    rejecter:(RCTPromiseRejectBlock)reject)
{
    [self withMapViewForTag:reactTag rejecter:reject handler:^(RMFMapView *mapView) {
        resolve([RMFEventResponse fromCameraPosition:[mapView camera]]);
    }];
}

RCT_EXPORT_METHOD(getBounds:(nonnull NSNumber *)reactTag
                                    resolver:(RCTPromiseResolveBlock)resolve
                                    rejecter:(RCTPromiseRejectBlock)reject)
{
    [self withMapViewForTag:reactTag rejecter:reject handler:^(RMFMapView *mapView) {
        resolve([RMFEventResponse fromCoordinateBounds:[mapView getBounds]]);
    }];
}

RCT_EXPORT_METHOD(getMyLocation:(nonnull NSNumber *)reactTag
                                    resolver:(RCTPromiseResolveBlock)resolve
                                    rejecter:(RCTPromiseRejectBlock)reject)
{
    [self withMapViewForTag:reactTag rejecter:reject handler:^(RMFMapView *mapView) {
        resolve([RMFEventResponse fromCLLocation:[mapView getMyLocation]]);
    }];
}

RCT_EXPORT_METHOD(pointForCoordinate:(nonnull NSNumber *)reactTag
                                    coordinate:(id)json
                                    resolver:(RCTPromiseResolveBlock)resolve
                                    rejecter:(RCTPromiseRejectBlock)reject)
{
    [self withMapViewForTag:reactTag rejecter:reject handler:^(RMFMapView *mapView) {
        CGPoint point = [mapView.projection pointForCoordinate:[RCTConvert CLLocationCoordinate2D:json]];
        resolve([RMFEventResponse fromCGPoint:point]);
    }];
}

RCT_EXPORT_METHOD(coordinateForPoint:(nonnull NSNumber *)reactTag
                                    point:(id)json
                                    resolver:(RCTPromiseResolveBlock)resolve
                                    rejecter:(RCTPromiseRejectBlock)reject)
{
    [self withMapViewForTag:reactTag rejecter:reject handler:^(RMFMapView *mapView) {
        CLLocationCoordinate2D coordinate = [mapView.projection coordinateForPoint:[RCTConvert CGPoint:json]];
        resolve([RMFEventResponse fromCoordinate:coordinate]);
    }];
}

RCT_EXPORT_METHOD(cameraForBounds:(nonnull NSNumber *)reactTag
                                    boundsData:(id)json
                                    resolver:(RCTPromiseResolveBlock)resolve
                                    rejecter:(RCTPromiseRejectBlock)reject)
{
    [self withMapViewForTag:reactTag rejecter:reject handler:^(RMFMapView *mapView) {
        MFCameraPosition *camera = nil;
        id data = [RCTConvert NSDictionary:json];
        if (data[@"bounds"]) {
            MFCoordinateBounds *bounds = [RCTConvert MFCoordinateBounds:data[@"bounds"]];
            if (data[@"padding"]) {
                UIEdgeInsets insets = [RCTConvert UIEdgeInsets:data[@"padding"]];
                camera = [mapView cameraForBounds:bounds insets:insets];
            } else {
                camera = [mapView cameraForBounds:bounds];
            }
        }

        resolve([RMFEventResponse fromCameraPosition:camera]);
    }];
}

@end
