import React from 'react';
import { View } from 'react-native';

import { directionsStyles } from './styles';

/**
 * The directions glyph on the sheet's action bar: a tilted square with a
 * turn-right arrow inside, the road sign for "route to here".
 */
function DirectionsIcon() {
  return (
    <View style={directionsStyles.directionsIcon}>
      <View style={directionsStyles.directionsIconDiamond} />
      <View style={directionsStyles.directionsIconStem} />
      <View style={directionsStyles.directionsIconHead} />
    </View>
  );
}

export { DirectionsIcon };
