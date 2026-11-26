#import "Map4dMap.h"

#if defined(RCT_NEW_ARCH_ENABLED) && __has_include("Map4dMapSpec.h")
#import "Map4dMapSpec.h"
#import <ReactCommon/RCTTurboModule.h>
#import <memory>

@implementation Map4dMap (TurboModule)

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeMap4dMapSpecJSI>(params);
}

@end
#endif
