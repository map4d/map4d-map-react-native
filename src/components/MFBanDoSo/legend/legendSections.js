/**
 * Reads the `portal/BanDo/dau-tu/danh-sach-chu-giai` payload, which splits the map's
 * categories the way the map itself does: the zones it fills, and the
 * connectivity layers it pins. Each side is one legend group, and since the
 * payload names only the entries inside a side, the group's own title is held
 * here.
 */
const LEGEND_SECTIONS = [
  { key: 'kcnkkt', title: 'Khu công nghiệp - Khu kinh tế' },
  { key: 'haTangKetNoi', title: 'Hạ tầng kết nối' },
];

function resolveLegendGroupSections(json) {
  const data = json?.data ?? json;
  if (!data || typeof data !== 'object') {
    return [];
  }

  return LEGEND_SECTIONS.map((section) => {
    const entries = Array.isArray(data[section.key]) ? data[section.key] : [];

    return {
      key: section.key,
      title: section.title,
      items: entries
        .map((entry, index) => {
          const title =
            typeof entry?.name === 'string' && entry.name.trim().length > 0
              ? entry.name.trim()
              : null;

          if (title == null) {
            return null;
          }

          return {
            key: `${section.key}-${entry?.type ?? index}`,
            title,
            configs: Array.isArray(entry?.configs) ? entry.configs : [],
          };
        })
        .filter((item) => item != null),
    };
  }).filter((section) => section.items.length > 0);
}

export { resolveLegendGroupSections };
