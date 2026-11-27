//
//  MFClusterItemImpl.h
//  react-native-map4d-map
//
//  Created by Huy Dang on 08/06/2022.
//

#ifndef MFClusterItemImpl_h
#define MFClusterItemImpl_h

#import <Map4dMapUtils/MarkerCluster.h>
#import "RMFClusterItem.h"

@interface MFClusterItemImpl : NSObject <MFClusterItem>

@property(nonatomic, copy) NSString *title;

@property(nonatomic, copy) NSString *snippet;

- (instancetype)init NS_UNAVAILABLE;

- (instancetype)initWithClusterItem:(RMFClusterItem *)item;

- (void)didTapAtPixel:(CGPoint)pixel location:(CLLocationCoordinate2D)location;

- (void)didTapInfoWindowAtPixel:(CGPoint)pixel location:(CLLocationCoordinate2D)location;

@end

#endif /* MFClusterItemImpl_h */
