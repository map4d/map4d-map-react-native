#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import "RCTAppDependencyProvider.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  self.dependencyProvider = [RCTAppDependencyProvider new];
  self.reactNativeFactory = [[RCTReactNativeFactory alloc] initWithDelegate:self];
  [self.reactNativeFactory startReactNativeWithModuleName:@"Map4dMapExample"
                                                 inWindow:self.window
                                            launchOptions:launchOptions];
  return YES;
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

@end
