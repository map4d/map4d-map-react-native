const path = require('path');

module.exports = {
  dependencies: {
    'react-native-map4d-map': {
      root: path.resolve(__dirname, '..'),
    },
    'react-native-screens': {
      platforms: {
        android: {
          packageImportPath: 'import com.swmansion.rnscreens.RNScreensPackage;',
          packageInstance: 'new RNScreensPackage()',
        },
      },
    },
  },
};
