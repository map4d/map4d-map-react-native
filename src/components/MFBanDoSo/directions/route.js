import { firstNonEmptyString, toCoordinate } from '../shared/text';

/**
 * Distances and durations arrive pre-formatted as `{text, value}`, so the text
 * is taken as-is rather than re-deriving it from the raw number.
 */
function measureText(measure) {
  return firstNonEmptyString([measure?.text]);
}

function normalizeSteps(steps, routeIndex) {
  return (Array.isArray(steps) ? steps : [])
    .map((step, index) => {
      const instruction = firstNonEmptyString([
        step?.htmlInstructions,
        step?.streetName,
      ]);

      if (!instruction) {
        return null;
      }

      return {
        key: `route-${routeIndex}-step-${index}`,
        instruction,
        streetName: firstNonEmptyString([step?.streetName]),
        maneuver: firstNonEmptyString([step?.maneuver]),
        distanceText: measureText(step?.distance),
      };
    })
    .filter((step) => step != null);
}

/**
 * Bounds taken from the leg's two endpoints. The real path can bulge outside
 * them, but the geometry only exists as an encoded polyline that the native
 * renderer decodes, so this is the closest frame available without decoding it
 * a second time in JS — and it beats leaving the camera where it was.
 */
function resolveRouteBounds(leg) {
  const start = toCoordinate(leg?.startLocation);
  const end = toCoordinate(leg?.endLocation);

  if (!start || !end) {
    return null;
  }

  return {
    minLat: Math.min(start.latitude, end.latitude),
    minLng: Math.min(start.longitude, end.longitude),
    maxLat: Math.max(start.latitude, end.latitude),
    maxLng: Math.max(start.longitude, end.longitude),
  };
}

function resolveRoute(route, index) {
  const leg = route.legs[0];

  return {
    key: `route-${index}`,
    index,
    bounds: resolveRouteBounds(leg),
    summary: firstNonEmptyString([route.summary]),
    distanceText: measureText(route.distance) ?? measureText(leg?.distance),
    durationText: measureText(route.duration) ?? measureText(leg?.duration),
    startAddress: firstNonEmptyString([leg?.startAddress]),
    endAddress: firstNonEmptyString([leg?.endAddress]),
    steps: normalizeSteps(leg?.steps, index),
  };
}

/**
 * Maps the `/sdk/route` payload to what the directions panel shows. The raw
 * response string is handed to MFDirectionsRenderer untouched — it decodes the
 * polylines natively and draws every route in the payload — so nothing here
 * needs to touch the geometry.
 */
function resolveRoutes(json) {
  const routes = json?.result?.routes;

  if (!Array.isArray(routes)) {
    return [];
  }

  const resolved = [];

  // The renderer builds one line per route that has legs and skips the rest,
  // so the index it draws by — and answers taps with — counts only those.
  for (const route of routes) {
    if (!route || typeof route !== 'object') {
      continue;
    }

    if (!Array.isArray(route.legs) || route.legs.length === 0) {
      continue;
    }

    resolved.push(resolveRoute(route, resolved.length));
  }

  return resolved;
}

export { resolveRoutes };
