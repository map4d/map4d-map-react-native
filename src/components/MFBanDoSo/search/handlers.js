import { Keyboard } from 'react-native';
import { getSearchUrl } from './api';
import {
  SEARCH_DEBOUNCE_MS,
  SEARCH_MIN_KEYWORD_LENGTH,
  SEARCH_ZONE_KIND,
} from './constants';
import { countSearchResults, resolveSearchSections } from './searchResults';

function cancelPendingSearch(self) {
  if (self._searchDebounceTimer != null) {
    clearTimeout(self._searchDebounceTimer);
    self._searchDebounceTimer = null;
  }
}

/**
 * Typing schedules a search rather than firing one per keystroke, and every
 * change invalidates whatever was already in flight, so a slow response for
 * an earlier prefix cannot overwrite the results for what is typed now.
 */
function onSearchKeywordChange(self, keyword) {
  self._cancelPendingSearch();
  self._searchRequestId += 1;

  const trimmed = keyword.trim();
  const canSearch = trimmed.length >= SEARCH_MIN_KEYWORD_LENGTH;

  self.setState({
    searchKeyword: keyword,
    isSearchOpen: canSearch,
    isSearchLoading: canSearch,
    searchSections: canSearch ? self.state.searchSections : [],
  });

  if (!canSearch) {
    return;
  }

  self._searchDebounceTimer = setTimeout(() => {
    self._searchDebounceTimer = null;
    self._loadSearchResults(trimmed);
  }, SEARCH_DEBOUNCE_MS);
}

function onSearchFocus(self) {
  if (countSearchResults(self.state.searchSections) > 0) {
    self.setState({ isSearchOpen: true });
  }
}

function clearSearch(self) {
  self._cancelPendingSearch();
  self._searchRequestId += 1;

  self.setState({
    searchKeyword: '',
    searchSections: [],
    isSearchLoading: false,
    isSearchOpen: false,
  });
}

function closeSearchResults(self) {
  if (!self.state.isSearchOpen) {
    return;
  }

  // The list is gone, so the keyboard has nothing left to type into and would
  // just be sitting over the map.
  Keyboard.dismiss();
  self.setState({ isSearchOpen: false });
}

async function loadSearchResults(self, keyword) {
  const requestId = self._searchRequestId + 1;
  self._searchRequestId = requestId;

  const isCurrentRequest = () =>
    self._isMounted && requestId === self._searchRequestId;

  try {
    const response = await fetch(getSearchUrl(self.props.isStaging, keyword));
    if (!response.ok) {
      throw new Error(`Failed to search: ${response.status}`);
    }

    const json = await response.json();
    if (!isCurrentRequest()) {
      return;
    }

    self.setState({
      searchSections: resolveSearchSections(json),
      isSearchLoading: false,
    });
  } catch (error) {
    if (!isCurrentRequest()) {
      return;
    }

    self._reportApiError('Cannot search', error);
    self.setState({ searchSections: [], isSearchLoading: false });
  }
}

/**
 * A picked result is handled as a tap on the thing it names: a zone opens its
 * own detail by id, exactly as tapping that zone on the map would, and
 * anything else is reverse-geocoded from its pin into the province sheet.
 *
 * A zone needs no pin of its own to be worth opening — its detail carries the
 * pin and the geometry both — so the id alone is enough.
 */
function onSelectSearchResult(self, item) {
  self._closeSearchResults();

  if (item?.kind === SEARCH_ZONE_KIND && item?.id != null) {
    self._prepareSheetForTap(item.pin?.latitude, item.pin?.longitude);
    self._loadZoneInfo(item.id);
    return;
  }

  if (item?.pin) {
    self._prepareSheetForTap(item.pin.latitude, item.pin.longitude);
    self._loadProvinceInfo(item.pin.latitude, item.pin.longitude, {
      highlightProvince: true,
    });
    return;
  }

  // No pin to look up, so the best that can be done is framing the result.
  if (item?.bounds) {
    self.fitBounds({
      bounds: {
        southWest: {
          latitude: item.bounds.minLat,
          longitude: item.bounds.minLng,
        },
        northEast: {
          latitude: item.bounds.maxLat,
          longitude: item.bounds.maxLng,
        },
      },
      padding: self._makeRoomForCameraFit(),
    });
  }
}

/**
 * Wires the search-box handlers onto the component: the debounced lookup
 * behind the field, and what opening one of its results does to the map and
 * the sheet. Plain functions over the component rather than methods on it, so
 * the box's whole behaviour reads in one file.
 */
function attachSearchHandlers(self) {
  self._searchRequestId = 0;
  self._searchDebounceTimer = null;
  self._cancelPendingSearch = () => cancelPendingSearch(self);
  self._onSearchKeywordChange = (keyword) =>
    onSearchKeywordChange(self, keyword);
  self._onSearchFocus = () => onSearchFocus(self);
  self._clearSearch = () => clearSearch(self);
  self._closeSearchResults = () => closeSearchResults(self);
  self._loadSearchResults = (keyword) => loadSearchResults(self, keyword);
  self._onSelectSearchResult = (item) => onSelectSearchResult(self, item);
}

export { attachSearchHandlers };
