const getReactNative = () => require('react-native');

export const getNativeModule = (moduleName) => {
  const reactNative = getReactNative();
  const turboRegistry = reactNative && reactNative.TurboModuleRegistry;

  if (turboRegistry && typeof turboRegistry.get === 'function') {
    const turboModule = turboRegistry.get(moduleName);
    if (turboModule) {
      return turboModule;
    }
  }

  const nativeModules = reactNative && reactNative.NativeModules;
  if (!nativeModules) {
    return null;
  }

  return nativeModules[moduleName] || null;
};

export const getUIManager = () => {
  const reactNative = getReactNative();
  if (!reactNative) {
    return null;
  }

  if (reactNative.UIManager) {
    return reactNative.UIManager;
  }

  return reactNative.NativeModules ? reactNative.NativeModules.UIManager : null;
};
