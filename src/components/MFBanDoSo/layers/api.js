import { buildApiUrl } from '../shared/api';

// The vector tiles the map draws, and the style rules that say how to draw
// them. Both describe the same layers, so they are always fetched as a pair.
const SOURCE_URL_PATH = 'api/tile/vector/{z}/{x}/{y}.pbf?p=1';
const CATEGORY_CONFIG_URL_PATH = 'api/portal/BanDo/dau-tu/category-config';

function getSourceUrl(isStaging) {
  return buildApiUrl(SOURCE_URL_PATH, isStaging);
}

function getCategoryConfigUrl(isStaging) {
  return buildApiUrl(CATEGORY_CONFIG_URL_PATH, isStaging);
}

export { getCategoryConfigUrl, getSourceUrl };
