#import <React/RCTBridgeModule.h>

#if defined(RCT_NEW_ARCH_ENABLED) && __has_include("Map4dMapSpec.h")
#import "Map4dMapSpec.h"
#define MAP4D_HAS_NEW_ARCH_SPEC 1
#else
#define MAP4D_HAS_NEW_ARCH_SPEC 0
#endif

@interface Map4dMap : NSObject <RCTBridgeModule
#if MAP4D_HAS_NEW_ARCH_SPEC
, NativeMap4dMapSpec
#endif
>

@end
