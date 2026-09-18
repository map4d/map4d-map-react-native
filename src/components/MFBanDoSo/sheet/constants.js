// Strip of map left uncovered above the sheet, so the backdrop stays tappable
// and the sheet still reads as an overlay rather than a full screen.
const SHEET_TOP_PEEK = 0;
const SHEET_OPEN_DURATION_MS = 260;
const SHEET_CLOSE_DURATION_MS = 220;
const SHEET_TRANSLATE_Y = 720;
const SHEET_SWIPE_ACTIVATION_DISTANCE = 10;
// A flick faster than this jumps to the neighbouring anchor instead of snapping
// back to whichever anchor the panel happens to sit closest to.
const SHEET_SWIPE_FLICK_VELOCITY = 0.6;
// Snap anchors, expressed as the fraction of the panel that stays visible:
// 0 is closed, 1 is fully open. The middle anchor sits between the two.
const SHEET_HALF_SNAP_RATIO = 0.5;
const SHEET_FULL_SNAP_RATIO = 1;
const SHEET_INITIAL_SNAP_RATIO = SHEET_HALF_SNAP_RATIO;
// The action bar stays pinned to the bottom of the screen at every anchor, so
// it only fades out once the sheet is nearly closed.
const SHEET_FOOTER_FADE_RATIO = 0.25;
const SHEET_MARKER_ID = 'mfbandoso-investment-marker';
// Breathing room (dp) kept around a province when fitting the camera to it.
const SHEET_FOCUS_PADDING = 24;
const SHEET_TITLE = 'Thông tin đầu tư';
const SHEET_LOADING_TEXT = 'Đang tải thông tin đầu tư...';
const SHEET_EMPTY_TEXT = 'Không có thông tin đầu tư tại vị trí này.';
const SHEET_STATS_TITLE = 'Chỉ số nổi bật';
const SHEET_INDUSTRIAL_ZONES_TITLE = 'Khu công nghiệp';
const SHEET_FOCUS_ACTION_LABEL = 'Xem tỉnh trên bản đồ';
// Which body the sheet draws: a province by default, a zone when a KCN/KKT
// feature was tapped.
const SHEET_KIND_PROVINCE = 'province';
const SHEET_KIND_ZONE = 'zone';
const SHEET_KIND_INFRA = 'infra';

// Sheet shown for a connectivity feature picked out of the advanced search.
const SHEET_INFRA_TITLE = 'Chi tiết hạ tầng';
const SHEET_INFRA_LOADING_TEXT = 'Đang tải thông tin hạ tầng...';
const SHEET_INFRA_EMPTY_TEXT = 'Không có thông tin chi tiết cho hạ tầng này.';
const INFRA_TYPE_LABEL = 'Loại hạ tầng';
const INFRA_LAYER_LABEL = 'Lớp';
const INFRA_DESCRIPTION_TITLE = 'Mô tả';
const INFRA_ACTIVE_TEXT = 'Đang hoạt động';
const INFRA_INACTIVE_TEXT = 'Ngừng hoạt động';
// A point has no extent to frame, so the camera is fitted to a small box
// around it — that way the sheet is cleared the same way a zone clears it.
const INFRA_FOCUS_DELTA = 0.004;

// Sheet shown when a KCN/KKT feature is tapped instead of bare map.
const SHEET_ZONE_TITLE = 'Chi tiết khu';
const SHEET_ZONE_LOADING_TEXT = 'Đang tải thông tin khu...';
const SHEET_ZONE_EMPTY_TEXT = 'Không có thông tin chi tiết cho khu này.';
const ZONE_MAIN_INFO_TITLE = 'Thông tin chính';
const ZONE_LOCATION_TITLE = 'Vị trí';
const ZONE_ADDRESS_LABEL = 'Địa chỉ';
const ZONE_INTRO_TITLE = 'Giới thiệu';
const ZONE_ATTRACTED_SECTORS_TITLE = 'Ngành nghề thu hút đầu tư';
const ZONE_RESTRICTED_SECTORS_TITLE = 'Ngành nghề hạn chế đầu tư';
const ZONE_ADVANTAGES_TITLE = 'Lợi thế đầu tư';
const ZONE_INVESTOR_TITLE = 'Chủ đầu tư';
// Highlight drawn over the tapped zone's own geometry.
const ZONE_POLYGON_ID_PREFIX = 'mfbandoso-zone-polygon';
const ZONE_HIGHLIGHT_FILL_COLOR = '#B91C1C33';
const ZONE_HIGHLIGHT_STROKE_COLOR = '#B91C1CFF';
const ZONE_HIGHLIGHT_STROKE_WIDTH = 2;
const ZONE_HIGHLIGHT_Z_INDEX = 900;
const ZONE_PUBLISHED_TEXT = 'Đã công bố';
const ZONE_UNPUBLISHED_TEXT = 'Chưa công bố';
const ZONE_CURRENCY_SUFFIX = ' đ';

// Images and video for a zone live on the shared object store, and the detail
// payload names them by path alone.
const ZONE_MEDIA_BASE_URL = 'https://minio.zamiga.vn/';
const ZONE_ESTABLISHED_YEAR_LABEL = 'Năm thành lập';
const ZONE_TOTAL_INVESTMENT_LABEL = 'Tổng vốn đầu tư';
const ZONE_STATUS_LABEL = 'Tình trạng';
const ZONE_TYPE_LABEL = 'Loại hình';
const ZONE_INVESTMENT_PROJECTS_LABEL = 'Dự án đầu tư';
const ZONE_ATTRACTED_PROJECTS_LABEL = 'Dự án thu hút';
const ZONE_PROJECTS_SUBTITLE = 'Danh sách dự án thuộc khu';
const ZONE_PROJECTS_COUNT_SUFFIX = ' dự án';
const ZONE_PROJECTS_LOADING_TEXT = 'Đang tải danh sách dự án...';

// The two project lists differ only in endpoint suffix and wording, so they are
// described here instead of being branched on at every use site.
const ZONE_PROJECT_KIND_INVESTMENT = 'investment';
const ZONE_PROJECT_KIND_ATTRACTED = 'attracted';
const ZONE_PROJECT_KINDS = {
  [ZONE_PROJECT_KIND_INVESTMENT]: {
    urlSuffix: 'du-an-dau-tu',
    title: ZONE_INVESTMENT_PROJECTS_LABEL,
    emptyText: 'Chưa có dự án đầu tư.',
  },
  [ZONE_PROJECT_KIND_ATTRACTED]: {
    urlSuffix: 'du-an-thu-hut',
    title: ZONE_ATTRACTED_PROJECTS_LABEL,
    emptyText: 'Chưa có dự án thu hút đầu tư.',
  },
};
const ZONE_PROJECT_AREA_LABEL = 'Diện tích dự kiến';
const ZONE_PROJECT_INVESTMENT_LABEL = 'Tổng mức đầu tư dự kiến';
const ZONE_AREA_SUFFIX = ' m²';

export {
  SHEET_CLOSE_DURATION_MS,
  SHEET_EMPTY_TEXT,
  SHEET_FOCUS_ACTION_LABEL,
  SHEET_FOCUS_PADDING,
  SHEET_FOOTER_FADE_RATIO,
  SHEET_FULL_SNAP_RATIO,
  SHEET_HALF_SNAP_RATIO,
  SHEET_INDUSTRIAL_ZONES_TITLE,
  SHEET_INITIAL_SNAP_RATIO,
  SHEET_KIND_INFRA,
  SHEET_KIND_PROVINCE,
  SHEET_INFRA_TITLE,
  SHEET_INFRA_LOADING_TEXT,
  SHEET_INFRA_EMPTY_TEXT,
  INFRA_TYPE_LABEL,
  INFRA_LAYER_LABEL,
  INFRA_DESCRIPTION_TITLE,
  INFRA_ACTIVE_TEXT,
  INFRA_INACTIVE_TEXT,
  INFRA_FOCUS_DELTA,
  SHEET_KIND_ZONE,
  SHEET_LOADING_TEXT,
  SHEET_MARKER_ID,
  SHEET_OPEN_DURATION_MS,
  SHEET_STATS_TITLE,
  SHEET_SWIPE_ACTIVATION_DISTANCE,
  SHEET_SWIPE_FLICK_VELOCITY,
  SHEET_TITLE,
  SHEET_TOP_PEEK,
  SHEET_TRANSLATE_Y,
  SHEET_ZONE_EMPTY_TEXT,
  SHEET_ZONE_LOADING_TEXT,
  SHEET_ZONE_TITLE,
  ZONE_ADDRESS_LABEL,
  ZONE_ADVANTAGES_TITLE,
  ZONE_AREA_SUFFIX,
  ZONE_ATTRACTED_PROJECTS_LABEL,
  ZONE_ATTRACTED_SECTORS_TITLE,
  ZONE_CURRENCY_SUFFIX,
  ZONE_ESTABLISHED_YEAR_LABEL,
  ZONE_HIGHLIGHT_FILL_COLOR,
  ZONE_HIGHLIGHT_STROKE_COLOR,
  ZONE_HIGHLIGHT_STROKE_WIDTH,
  ZONE_HIGHLIGHT_Z_INDEX,
  ZONE_INTRO_TITLE,
  ZONE_INVESTMENT_PROJECTS_LABEL,
  ZONE_INVESTOR_TITLE,
  ZONE_LOCATION_TITLE,
  ZONE_MAIN_INFO_TITLE,
  ZONE_MEDIA_BASE_URL,
  ZONE_POLYGON_ID_PREFIX,
  ZONE_PROJECTS_COUNT_SUFFIX,
  ZONE_PROJECTS_LOADING_TEXT,
  ZONE_PROJECTS_SUBTITLE,
  ZONE_PROJECT_AREA_LABEL,
  ZONE_PROJECT_INVESTMENT_LABEL,
  ZONE_PROJECT_KINDS,
  ZONE_PROJECT_KIND_ATTRACTED,
  ZONE_PROJECT_KIND_INVESTMENT,
  ZONE_PUBLISHED_TEXT,
  ZONE_RESTRICTED_SECTORS_TITLE,
  ZONE_STATUS_LABEL,
  ZONE_TOTAL_INVESTMENT_LABEL,
  ZONE_TYPE_LABEL,
  ZONE_UNPUBLISHED_TEXT,
};
