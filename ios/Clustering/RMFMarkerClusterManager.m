//
//  RMFMarkerClusterManager.m
//  DoubleConversion
//
//  Created by Huy Dang on 5/31/22.
//

#import <React/RCTViewManager.h>
#import "RMFMarkerCluster.h"

@interface RMFMarkerClusterManager : RCTViewManager
@end

@implementation RMFMarkerClusterManager

RCT_EXPORT_MODULE(RMFMarkerCluster)

- (UIView *)view {
  return [[RMFMarkerCluster alloc] init];
}

RCT_EXPORT_VIEW_PROPERTY(onPressCluster, RCTBubblingEventBlock)

@end
