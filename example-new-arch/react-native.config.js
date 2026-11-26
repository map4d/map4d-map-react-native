module.exports = {
  dependencies: {
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
