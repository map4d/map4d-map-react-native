/**
 * Everything the component fetches goes through one gateway, which serves a
 * staging copy of every endpoint under an extra path segment. Each feature
 * builds its own URLs on top of this, so the host and that segment are decided
 * in a single place. The host itself is the SDK's, read off the map once it is
 * ready and handed here by MFBanDoSo, so the loaders wait on
 * `whenApiHostReady` rather than build on a guess.
 */
let currentApiHost = null;
let markApiHostReady = null;
const apiHostReady = new Promise((resolve) => {
  markApiHostReady = resolve;
});

function setApiHost(host) {
  if (typeof host !== 'string' || host.trim().length === 0) {
    return false;
  }

  currentApiHost = host.trim().replace(/\/+$/, '');
  markApiHostReady();
  return true;
}

function hasApiHost() {
  return currentApiHost != null;
}

function whenApiHostReady() {
  return apiHostReady;
}

function buildApiUrl(path, isStaging) {
  if (currentApiHost == null) {
    return null;
  }

  const stagingSegment = isStaging ? '/staging' : '';
  return `${currentApiHost}${stagingSegment}/bds/${path}`;
}

function buildGatewayUrl(path, isStaging) {
  if (currentApiHost == null) {
    return null;
  }

  const stagingSegment = isStaging ? '/staging' : '';
  return `${currentApiHost}${stagingSegment}/${path}`;
}

/**
 * Every call wants the parsed body, and a failed status to raise rather than
 * return. `what` names the thing being fetched so the warning that reaches the
 * console says which request failed, not merely that one did.
 */
async function fetchJson(url, what) {
  if (!url) {
    const subject = what
      ? `Cannot build URL for ${what}`
      : 'Missing request URL';
    throw new Error(`${subject}: API host is unknown`);
  }

  const response = await fetch(url);
  if (!response.ok) {
    const subject = what ? `Failed to fetch ${what}` : 'Request failed';
    throw new Error(`${subject}: ${response.status}`);
  }

  return response.json();
}

export {
  buildApiUrl,
  buildGatewayUrl,
  fetchJson,
  hasApiHost,
  setApiHost,
  whenApiHostReady,
};
