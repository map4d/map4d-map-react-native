import { buildApiUrl } from '../shared/api';

// The legend reads its own config rather than the layer selector's. The two
// describe the same categories, but the selector's renames the "Mac dinh" entry
// of every connectivity layer to the layer's own name — so that layer reads as
// its own legend row — and the legend has to name what the map actually draws.
const LEGEND_CONFIG_URL_PATH = 'api/portal/BanDo/dau-tu/danh-sach-chu-giai';

function getLegendConfigUrl(isStaging) {
  return buildApiUrl(LEGEND_CONFIG_URL_PATH, isStaging);
}

export { getLegendConfigUrl };
