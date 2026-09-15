import defaultRoadmapStyle from './DefaultRoadmapStyle';

const GEOJSON_SOURCE_NAME = 'geojson';

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

// The bundled roadmap is the last resort: it is used only when neither the caller's
// style nor the style read back from the map itself could be parsed. It is cloned
// lazily so the common path does not pay for a copy it throws away.
function toStyleObject(mapStyle) {
  if (mapStyle != null) {
    try {
      if (typeof mapStyle === 'string') {
        return JSON.parse(mapStyle);
      }

      if (typeof mapStyle === 'object' && !Array.isArray(mapStyle)) {
        return deepClone(mapStyle);
      }
    } catch (error) {
      // Unusable style, fall through to the bundled roadmap.
    }
  }

  return deepClone(defaultRoadmapStyle);
}

// Turns a raw style — the caller's, the map's own, or the bundled roadmap — into the
// base to build on: the geojson source is re-declared and every layer bound to it is
// dropped, so nothing we wrote during an earlier sync survives.
function createBaseStyle(mapStyle, sourceUrl) {
  const style = toStyleObject(mapStyle);
  const layers = Array.isArray(style.layers) ? style.layers : [];

  return {
    ...style,
    sources: {
      ...style.sources,
      [GEOJSON_SOURCE_NAME]: {
        type: 'vector',
        url: sourceUrl,
      },
    },
    layers: layers.filter((layer) => layer?.source !== GEOJSON_SOURCE_NAME),
  };
}

function generateLayerStyle(source, items) {
  const layers = [];

  items.forEach((item) => {
    const key = item?.key;
    const style = item?.style;
    if (!key || !style || typeof style !== 'object') {
      return;
    }

    if (Array.isArray(style.line)) {
      style.line.forEach((line, index) => {
        layers.push({
          id: `${key}-line-${index}`,
          type: 'line',
          source,
          source_layer: line.layer,
          filter: line.filter,
          draw: line.draw,
          metadata: { managedBy: 'MFBanDoSo' },
        });
      });
    }

    if (Array.isArray(style.fill)) {
      style.fill.forEach((fill, index) => {
        layers.push({
          id: `${key}-fill-${index}`,
          type: 'fill',
          source,
          source_layer: fill.layer,
          filter: fill.filter,
          draw: fill.draw,
          metadata: { managedBy: 'MFBanDoSo' },
        });
      });
    }

    if (Array.isArray(style.symbol)) {
      style.symbol.forEach((symbol, index) => {
        layers.push({
          id: `${key}-symbol-${index}`,
          type: 'symbol',
          source,
          source_layer: symbol.layer,
          filter: symbol.filter,
          draw: symbol.draw,
          metadata: { managedBy: 'MFBanDoSo' },
        });
      });
    }
  });

  return layers;
}

function createCategoryItemsSignature(items) {
  if (!Array.isArray(items)) {
    return '';
  }

  const normalized = items.map((item) => ({
    key: item?.key || '',
    checked: !!item?.checked,
    style: item?.style || null,
  }));

  return JSON.stringify(normalized);
}

// Expects a style from createBaseStyle, so all that is left is dropping the poi
// layers the map ships with and splicing ours in.
function buildGeojsonStyle(style, items) {
  const normalizeItems = Array.isArray(items) ? items : [];
  const layerStyle = generateLayerStyle(GEOJSON_SOURCE_NAME, normalizeItems);

  const baseLayers = (Array.isArray(style.layers) ? style.layers : []).filter(
    (layer) =>
      layer && typeof layer === 'object' && layer.source_layer !== 'pois'
  );

  return JSON.stringify({
    ...style,
    layers: baseLayers.concat(layerStyle),
  });
}

export { buildGeojsonStyle, createCategoryItemsSignature, createBaseStyle };
