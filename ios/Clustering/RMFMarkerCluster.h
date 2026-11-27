//
//  RMFMarkerCluster.h
//  react-native-map4d-map
//
//  Created by Huy Dang on 5/31/22.
//

#ifndef RMFMarkerCluster_h
#define RMFMarkerCluster_h

#import <React/UIView+React.h>
#import "RMFMapView.h"

@interface RMFMarkerCluster : UIView

@property (nonatomic, copy) RCTBubblingEventBlock _Nullable onPressCluster;

- (void)setMapView:(RMFMapView *_Nullable)mapView;

@end

#endif /* RMFMarkerCluster_h */
