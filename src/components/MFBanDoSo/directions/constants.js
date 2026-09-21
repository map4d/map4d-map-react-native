const DIRECTIONS_ACTION_LABEL = 'Chỉ đường';
const DIRECTIONS_LOADING_TEXT = 'Đang tìm đường...';
const DIRECTIONS_EMPTY_TEXT = 'Không tìm được đường đi giữa hai điểm này.';
const DIRECTIONS_PICK_ORIGIN_TEXT = 'Chạm vào bản đồ để chọn điểm bắt đầu';
const DIRECTIONS_PICK_DESTINATION_TEXT = 'Chạm vào bản đồ để chọn điểm đến';
const DIRECTIONS_PICK_ORIGIN_CANCEL = 'Huỷ';
const DIRECTIONS_ORIGIN_LABEL = 'Điểm đi';
const DIRECTIONS_DESTINATION_LABEL = 'Điểm đến';
const DIRECTIONS_MY_LOCATION_TEXT = 'Vị trí của bạn';
const DIRECTIONS_PICKED_POINT_TEXT = 'Điểm bạn đã chọn';
const DIRECTIONS_ORIGIN_PLACEHOLDER = 'Nhập điểm đi';
const DIRECTIONS_DESTINATION_PLACEHOLDER = 'Nhập điểm đến';
const DIRECTIONS_PICK_ON_MAP_LABEL = 'Chọn trên bản đồ';
const DIRECTIONS_SUGGEST_LOADING_TEXT = 'Đang tìm địa điểm...';
const DIRECTIONS_SUGGEST_EMPTY_TEXT = 'Không tìm thấy địa điểm phù hợp.';
// Keystrokes are cheap, requests are not: wait for a pause before asking.
const DIRECTIONS_SUGGEST_DEBOUNCE_MS = 350;
// The endpoint answers a single letter with an empty list anyway.
const DIRECTIONS_SUGGEST_MIN_LENGTH = 2;
const DIRECTIONS_SWAP_LABEL = 'Đảo chiều điểm đi và điểm đến';
const DIRECTIONS_ENDPOINT_ORIGIN = 'origin';
const DIRECTIONS_ENDPOINT_DESTINATION = 'destination';
const DIRECTIONS_STEPS_TITLE = 'Chỉ dẫn từng chặng';
const DIRECTIONS_ROUTES_TITLE = 'Các tuyến đường';
const DIRECTIONS_ROUTE_LABEL_PREFIX = 'Tuyến';
// The travel modes /sdk/route accepts. Anything else comes back as
// `invalid_model`, so this list is also what the URL builder validates against.
const DIRECTIONS_MODE_CAR = 'car';
const DIRECTIONS_MODE_MOTORCYCLE = 'motorcycle';
const DIRECTIONS_MODE_BIKE = 'bike';
const DIRECTIONS_MODE_FOOT = 'foot';
const DIRECTIONS_DEFAULT_MODE = DIRECTIONS_MODE_CAR;
const DIRECTIONS_MODES = [
  { key: DIRECTIONS_MODE_CAR, label: 'Ô tô' },
  { key: DIRECTIONS_MODE_MOTORCYCLE, label: 'Xe máy' },
  { key: DIRECTIONS_MODE_BIKE, label: 'Xe đạp' },
  { key: DIRECTIONS_MODE_FOOT, label: 'Đi bộ' },
];
// Route drawing. The renderer takes the /sdk/route payload as-is and decodes
// the polyline natively, so these are only about how it is painted.
const DIRECTIONS_ACTIVE_STROKE_COLOR = '#1D4ED8';
const DIRECTIONS_ACTIVE_STROKE_WIDTH = 6;
const DIRECTIONS_ACTIVE_OUTLINE_COLOR = '#FFFFFF';
const DIRECTIONS_ACTIVE_OUTLINE_WIDTH = 2;
const DIRECTIONS_INACTIVE_STROKE_COLOR = '#94A3B8';
const DIRECTIONS_INACTIVE_STROKE_WIDTH = 5;
const DIRECTIONS_INACTIVE_OUTLINE_COLOR = '#FFFFFF';
const DIRECTIONS_INACTIVE_OUTLINE_WIDTH = 2;
// Labels drawn on the map at each end of the route.
const DIRECTIONS_ORIGIN_POI_COLOR = '#1D4ED8';
const DIRECTIONS_DESTINATION_POI_COLOR = '#B91C1C';

const EMPTY_DIRECTIONS_ROUTES = {
  directionsRoutes: [],
  directionsRouteIndex: null,
};

// What an endpoint field holds when nothing is being typed into it. Reset in
// several places — closing the panel, opening another sheet — so it is spelled
// out once here.
const EMPTY_DIRECTIONS_EDIT = {
  directionsEditingEndpoint: null,
  directionsQuery: '',
  directionsSuggestions: [],
  isDirectionsSuggestLoading: false,
};

export {
  EMPTY_DIRECTIONS_EDIT,
  EMPTY_DIRECTIONS_ROUTES,
  DIRECTIONS_ACTION_LABEL,
  DIRECTIONS_ACTIVE_OUTLINE_COLOR,
  DIRECTIONS_ACTIVE_OUTLINE_WIDTH,
  DIRECTIONS_ACTIVE_STROKE_COLOR,
  DIRECTIONS_ACTIVE_STROKE_WIDTH,
  DIRECTIONS_DEFAULT_MODE,
  DIRECTIONS_DESTINATION_PLACEHOLDER,
  DIRECTIONS_DESTINATION_LABEL,
  DIRECTIONS_DESTINATION_POI_COLOR,
  DIRECTIONS_EMPTY_TEXT,
  DIRECTIONS_ENDPOINT_DESTINATION,
  DIRECTIONS_ENDPOINT_ORIGIN,
  DIRECTIONS_INACTIVE_OUTLINE_COLOR,
  DIRECTIONS_INACTIVE_OUTLINE_WIDTH,
  DIRECTIONS_INACTIVE_STROKE_COLOR,
  DIRECTIONS_INACTIVE_STROKE_WIDTH,
  DIRECTIONS_LOADING_TEXT,
  DIRECTIONS_MODES,
  DIRECTIONS_MODE_BIKE,
  DIRECTIONS_MODE_CAR,
  DIRECTIONS_MODE_FOOT,
  DIRECTIONS_MODE_MOTORCYCLE,
  DIRECTIONS_MY_LOCATION_TEXT,
  DIRECTIONS_ORIGIN_LABEL,
  DIRECTIONS_ORIGIN_PLACEHOLDER,
  DIRECTIONS_ORIGIN_POI_COLOR,
  DIRECTIONS_PICKED_POINT_TEXT,
  DIRECTIONS_PICK_DESTINATION_TEXT,
  DIRECTIONS_PICK_ORIGIN_CANCEL,
  DIRECTIONS_PICK_ORIGIN_TEXT,
  DIRECTIONS_PICK_ON_MAP_LABEL,
  DIRECTIONS_ROUTES_TITLE,
  DIRECTIONS_ROUTE_LABEL_PREFIX,
  DIRECTIONS_STEPS_TITLE,
  DIRECTIONS_SUGGEST_DEBOUNCE_MS,
  DIRECTIONS_SUGGEST_EMPTY_TEXT,
  DIRECTIONS_SUGGEST_LOADING_TEXT,
  DIRECTIONS_SUGGEST_MIN_LENGTH,
  DIRECTIONS_SWAP_LABEL,
};
