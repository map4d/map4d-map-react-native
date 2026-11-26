const path = require('path');
const escape = require('escape-string-regexp');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const pak = require('../package.json');

const root = path.resolve(__dirname, '..');

const modules = Object.keys({
  ...pak.peerDependencies,
});

const sepPattern = path.sep === '\\' ? '\\\\' : '/';

const config = {
  projectRoot: __dirname,
  watchFolders: [root],

  // We need to make sure that only one version is loaded for peerDependencies
  // So we blacklist them at the root, and alias them to the versions in example's node_modules
  resolver: {
    blockList: [
      ...modules.map(
        (m) =>
          new RegExp(
            `^${escape(path.join(root, 'node_modules', m))}${sepPattern}.*$`
          )
      ),
    ],

    extraNodeModules: modules.reduce(
      (acc, name) => {
        acc[name] = path.join(__dirname, 'node_modules', name);
        return acc;
      },
      {
        [pak.name]: root,
      }
    ),
  },

  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
