//
//  RMFMarkerCluster.m
//  react-native-map4d-map
//
//  Created by Huy Dang on 5/31/22.
//

#import "RMFMarkerCluster.h"
#import "RMFMapView.h"
#import "RMFClusterItem.h"
#import <React/RCTLog.h>
#import "MFClusterItemImpl.h"
#import "../RMFEventResponse.h"

@interface RMFMarkerCluster ()<MFClusterManagerDelegate>
@end

@implementation RMFMarkerCluster {
  uint64_t _itemNoCounter;
  MFClusterManager *_clusterManager;
  NSMutableDictionary<NSString *, MFClusterItemImpl *> *_items;
}

- (instancetype)init {
  if (self = [super init]) {
    _clusterManager = nil;
    _items = [NSMutableDictionary dictionaryWithCapacity:1];
    _itemNoCounter = 0;
  }
  return self;
}

- (void)addClusterItem:(RMFClusterItem *)item {
  NSString *itemId = [NSString stringWithFormat:@"item_%llu", _itemNoCounter++];
  item.itemId = itemId;
  item.markerCluster = self;
  
  MFClusterItemImpl *clusterItem = [[MFClusterItemImpl alloc] initWithClusterItem:item];
  [_items setObject:clusterItem forKey:itemId];
  
  if (_clusterManager != nil) {
    [_clusterManager addItem:clusterItem];
    [_clusterManager cluster];
  }
}

- (void)removeClusterItem:(RMFClusterItem *)item cluster:(BOOL)cluster {
  MFClusterItemImpl *clusterItem = [_items objectForKey:item.itemId];
  
  if (_clusterManager != nil) {
    [_clusterManager removeItem:clusterItem];
    if (cluster) {
      [_clusterManager cluster];
    }
  }
  [_items removeObjectForKey:item.itemId];
}

- (void)updateClusterItem:(RMFClusterItem *)item {
  [self removeClusterItem:item cluster:NO];
  [self addClusterItem:item];
}

- (void)setMapView:(RMFMapView *)mapView {
  if (_clusterManager != nil) {
    [_clusterManager clearItems];
    _clusterManager = nil;
  }
  
  if (mapView != nil) {
    id<MFClusterIconGenerator> iconGenerator = [[MFDefaultClusterIconGenerator alloc] init];
    id<MFClusterRenderer> renderer = [[MFDefaultClusterRenderer alloc] initWithMapView:mapView
                                                                  clusterIconGenerator:iconGenerator];

    id<MFClusterAlgorithm> algorithm = [[MFNonHierarchicalDistanceBasedAlgorithm alloc] init];

    _clusterManager = [[MFClusterManager alloc] initWithMap:mapView
                                                  algorithm:algorithm
                                                   renderer:renderer];
    
    [_clusterManager setDelegate:self mapDelegate:mapView.delegate];
    
    if (_items.count > 0) {
      [_clusterManager addItems:[_items allValues]];
      [_clusterManager cluster];
    }
  }
}

- (void)insertReactSubview:(UIView *)subview atIndex:(NSInteger)atIndex {
  if ([subview isKindOfClass:[RMFClusterItem class]]) {
    [self addClusterItem:(RMFClusterItem *)subview];
  }
  [super insertReactSubview:subview atIndex:atIndex];
}

- (void)removeReactSubview:(UIView *)subview {
  if ([subview isKindOfClass:[RMFClusterItem class]]) {
    [self removeClusterItem:(RMFClusterItem *)subview cluster:YES];
  }
  [super removeReactSubview:subview];
}

@end

#pragma mark - MFClusterManagerDelegate
@implementation RMFMarkerCluster (MFClusterManagerDelegate)

-(BOOL)clusterManager:(MFClusterManager *)clusterManager didTapCluster:(id<MFCluster>)cluster {
  if (self.onPressCluster) {
    self.onPressCluster(@{
      @"action": @"marker-cluster-press",
      @"cluster": @{
        @"size": @(cluster.count),
        kRMFLatLngCoordinateResponseKey: [RMFEventResponse fromCoordinate:cluster.position]
      }
    });
  }

  // Stop event here
  return YES;
}

@end
