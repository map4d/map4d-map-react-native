#import <React-RCTAppDelegate/RCTDefaultReactNativeFactoryDelegate.h>
#import <React-RCTAppDelegate/RCTReactNativeFactory.h>
#import <UIKit/UIKit.h>

@interface AppDelegate : RCTDefaultReactNativeFactoryDelegate <UIApplicationDelegate>

@property (nonatomic, strong) UIWindow *window;
@property (nonatomic, strong) RCTReactNativeFactory *reactNativeFactory;

@end
