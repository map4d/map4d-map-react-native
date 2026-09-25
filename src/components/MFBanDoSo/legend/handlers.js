import { Animated, Easing } from 'react-native';
import {
  DRAWER_CLOSE_DURATION_MS,
  DRAWER_OPEN_DURATION_MS,
} from '../shared/constants';
import { fetchApi } from '../shared/api';
import { getLegendConfigUrl } from './api';
import { resolveLegendGroupSections } from './legendSections';

/**
 * The legend is drawn from its own config, which describes the same
 * categories as the selector's but is the one that names and colours their
 * rules correctly. Nothing is toggled here, so the sections it resolves to
 * are what the drawer renders as they are.
 */
async function loadLegendItems(self) {
  const requestId = self._legendRequestId + 1;
  self._legendRequestId = requestId;

  try {
    const response = await fetchApi(
      getLegendConfigUrl(self.props.isStaging),
      'legend config'
    );

    const json = await response.json();
    const legendSections = resolveLegendGroupSections(json);

    if (!self._isMounted || requestId !== self._legendRequestId) {
      return;
    }

    self.setState({ legendSections });
  } catch (error) {
    if (requestId !== self._legendRequestId) {
      return;
    }
    self._reportApiError('Cannot load legend items', error);
  }
}

function toggleLegendVisibility(self) {
  if (self.state.isLegendVisible) {
    self._closeLegend();
    return;
  }

  self._openLegend();
}

function openLegend(self) {
  self.setState(
    {
      isLegendMounted: true,
      isLegendVisible: true,
    },
    () => {
      Animated.timing(self._legendAnim, {
        toValue: 1,
        duration: DRAWER_OPEN_DURATION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  );
}

function closeLegend(self) {
  Animated.timing(self._legendAnim, {
    toValue: 0,
    duration: DRAWER_CLOSE_DURATION_MS,
    easing: Easing.in(Easing.cubic),
    useNativeDriver: true,
  }).start(() => {
    if (!self._isMounted) {
      return;
    }

    self.setState({
      isLegendVisible: false,
      isLegendMounted: false,
    });
  });
}

function snapLegendOpen(self) {
  Animated.timing(self._legendAnim, {
    toValue: 1,
    duration: DRAWER_OPEN_DURATION_MS,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  }).start();
}

/**
 * Wires the legend-drawer handlers onto the component. The legend rides its
 * own animated value so it opens and closes independently of the layer
 * drawer, which is why the two are kept apart rather than sharing one set.
 */
function attachLegendHandlers(self) {
  self._legendRequestId = 0;
  self._loadLegendItems = () => loadLegendItems(self);
  self._toggleLegendVisibility = () => toggleLegendVisibility(self);
  self._openLegend = () => openLegend(self);
  self._closeLegend = () => closeLegend(self);
  self._snapLegendOpen = () => snapLegendOpen(self);
}

export { attachLegendHandlers };
