import {Platform, UIManager} from 'react-native';
import {getNativeModule, getUIManager} from './NativeModuleResolver';

const rejectOrIgnore = (message, rejectOnError) => {
  if (rejectOnError) {
    return Promise.reject(message);
  }

  return undefined;
};

export const getViewManagerCommandId = (componentName, commandName) => {
  const uiManager = UIManager || getUIManager();

  if (!uiManager) {
    return null;
  }

  if (!uiManager.getViewManagerConfig) {
    // RN < 0.58
    const legacyConfig = uiManager[componentName];
    return legacyConfig && legacyConfig.Commands
      ? legacyConfig.Commands[commandName]
      : null;
  }

  // RN >= 0.58
  const config = uiManager.getViewManagerConfig(componentName);
  return config && config.Commands ? config.Commands[commandName] : null;
};

export const runViewManagerCommand = ({
  componentName,
  moduleName,
  commandName,
  args = [],
  reactTag,
  platform = Platform.OS,
  rejectOnError = false,
}) => {
  switch (platform) {
    case 'android': {
      const uiManager = UIManager || getUIManager();
      if (!uiManager || typeof uiManager.dispatchViewManagerCommand !== 'function') {
        return rejectOrIgnore(
          'UIManager.dispatchViewManagerCommand is unavailable on this React Native version',
          rejectOnError
        );
      }

      const commandId = getViewManagerCommandId(componentName, commandName);
      if (commandId == null) {
        return rejectOrIgnore(
          `Cannot find native command "${commandName}" for ${componentName}`,
          rejectOnError
        );
      }

      return uiManager.dispatchViewManagerCommand(reactTag, commandId, args);
    }

    case 'ios': {
      const mapManager = getNativeModule(moduleName || componentName);
      const mapManagerCommand = mapManager ? mapManager[commandName] : null;

      if (typeof mapManagerCommand !== 'function') {
        return rejectOrIgnore(
          `Cannot find native command "${commandName}" for ${componentName}`,
          rejectOnError
        );
      }

      return mapManagerCommand(reactTag, ...args);
    }

    default:
      return rejectOrIgnore(
        `Invalid platform was passed: ${platform}`,
        rejectOnError
      );
  }
};
