/**
 * Everything the component fetches goes through one gateway, which serves a
 * staging copy of every endpoint under an extra path segment. Each feature
 * builds its own URLs on top of this, so the host and that segment are decided
 * in a single place.
 */
const DEFAULT_API_HOST = 'https://kong-cdtmc-devtest.mbfs.vn';

let currentApiHost = DEFAULT_API_HOST;

function configureMFBanDoSo({ apiHost } = {}) {
  if (typeof apiHost === 'string' && apiHost.length > 0) {
    currentApiHost = apiHost.replace(/\/+$/, '');
  }
}

function buildApiUrl(path, isStaging) {
  const stagingSegment = isStaging ? '/staging' : '';
  return `${currentApiHost}${stagingSegment}/bds/${path}`;
}

function buildGatewayUrl(path, isStaging) {
  const stagingSegment = isStaging ? '/staging' : '';
  return `${currentApiHost}${stagingSegment}/${path}`;
}

/**
 * A failed status raises rather than returns. `what` names the thing being
 * fetched so the warning that reaches the console says which request failed,
 * not merely that one did. Every error it raises carries the `url`, so the
 * error dialog can show which endpoint failed.
 */
async function fetchApi(url, what) {
  let response;
  try {
    response = await fetch(url);
  } catch (error) {
    if (error != null && typeof error === 'object') {
      error.url = url;
    }
    throw error;
  }

  if (!response.ok) {
    const subject = what ? `Failed to fetch ${what}` : 'Request failed';
    const error = new Error(`${subject}: ${response.status}`);
    error.url = url;
    throw error;
  }

  return response;
}

async function fetchJson(url, what) {
  const response = await fetchApi(url, what);
  return response.json();
}

export {
  buildApiUrl,
  buildGatewayUrl,
  configureMFBanDoSo,
  fetchApi,
  fetchJson,
};
