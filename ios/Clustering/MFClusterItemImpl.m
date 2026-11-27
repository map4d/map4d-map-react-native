//
//  MFClusterItemImpl.m
//  react-native-map4d-map
//
//  Created by Huy Dang on 08/06/2022.
//

#import "MFClusterItemImpl.h"
#import "../RMFEventResponse.h"

@interface MFClusterItemImpl ()

@property(nonatomic, readwrite) CLLocationCoordinate2D position;

@property(nonatomic, weak) RMFClusterItem *item;

@end

@implementation MFClusterItemImpl

- (instancetype)initWithClusterItem:(RMFClusterItem *)item {
  if (self = [super init]) {
    _item = item;
    _position = item.coordinate;
    _title = item.title;
    _snippet = item.snippet;
  }
  return self;
}

- (void)didTapAtPixel:(CGPoint)pixel location:(CLLocationCoordinate2D)location {
  if (_item && _item.onPress) {
    _item.onPress([self responseWithAction:@"cluster-item-press" pixel:pixel location:location]);
  }
}

- (void)didTapInfoWindowAtPixel:(CGPoint)pixel location:(CLLocationCoordinate2D)location {
  if (_item && _item.onPressInfoWindow) {
    _item.onPressInfoWindow([self responseWithAction:@"cluster-item-info-window-press" pixel:pixel location:location]);
  }
}

- (NSDictionary*)responseWithAction:(NSString*)action
                              pixel:(CGPoint)pixel
                           location:(CLLocationCoordinate2D)location {
  NSMutableDictionary* response = [NSMutableDictionary dictionaryWithDictionary:
                                   [RMFEventResponse fromCoordinate:location pixel:pixel]];
  response[@"clusterItem"] = @{
    kRMFLatLngCoordinateResponseKey: [RMFEventResponse fromCoordinate:_position],
  };
  response[@"action"] = action;
  return response;
}

@end
