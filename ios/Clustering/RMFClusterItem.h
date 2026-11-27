//
//  RMFClusterItem.h
//  react-native-map4d-map
//
//  Created by Huy Dang on 08/06/2022.
//

#ifndef RMFClusterItem_h
#define RMFClusterItem_h

#import <React/UIView+React.h>
#import <CoreLocation/CoreLocation.h>

@class RMFMarkerCluster;

@interface RMFClusterItem : UIView

@property(nonatomic, copy) RCTBubblingEventBlock _Nullable onPress;
@property(nonatomic, copy) RCTDirectEventBlock _Nullable onPressInfoWindow;

@property(nonatomic, assign) CLLocationCoordinate2D coordinate;
@property(nonatomic, copy, nullable) NSString *title;
@property(nonatomic, copy, nullable) NSString *snippet;

@property(nonatomic, strong, nullable) NSString *itemId;
@property(nonatomic, weak, nullable) RMFMarkerCluster* markerCluster;

@end

#endif /* RMFClusterItem_h */
