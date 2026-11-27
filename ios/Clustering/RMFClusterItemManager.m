//
//  RMFClusterItemManager.m
//  react-native-map4d-map
//
//  Created by Huy Dang on 08/06/2022.
//

#import <React/RCTViewManager.h>
#import "RMFClusterItem.h"

@interface RMFClusterItemManager : RCTViewManager
@end

@implementation RMFClusterItemManager

RCT_EXPORT_MODULE(RMFClusterItem)

- (UIView *)view {
  return [[RMFClusterItem alloc] init];
}

RCT_EXPORT_VIEW_PROPERTY(coordinate, CLLocationCoordinate2D)
RCT_EXPORT_VIEW_PROPERTY(title, NSString)
RCT_EXPORT_VIEW_PROPERTY(snippet, NSString)

RCT_EXPORT_VIEW_PROPERTY(onPress, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onPressInfoWindow, RCTDirectEventBlock)

@end
