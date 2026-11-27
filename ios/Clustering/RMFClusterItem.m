//
//  RMFClusterItem.m
//  react-native-map4d-map
//
//  Created by Huy Dang on 08/06/2022.
//

#import "RMFClusterItem.h"
#import "RMFMarkerCluster.h"

@interface RMFMarkerCluster (Private)
- (void)updateClusterItem:(RMFClusterItem *)item;
@end

@implementation RMFClusterItem

- (instancetype)init {
  if (self = [super init]) {
    _coordinate = kCLLocationCoordinate2DInvalid;
    _title = nil;
    _snippet = nil;
  }
  return self;
}

- (void)setCoordinate:(CLLocationCoordinate2D)coordinate {
  _coordinate = coordinate;
  if (_markerCluster != nil) {
    [_markerCluster updateClusterItem:self];
  }
}

@end
