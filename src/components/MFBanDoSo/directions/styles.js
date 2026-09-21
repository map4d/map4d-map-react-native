import { StyleSheet } from 'react-native';

const directionsStyles = StyleSheet.create({
  // The wayfinding sign — a diamond with an arrow inside — rather than a bare
  // arrow, which reads as "go" instead of "directions". The two pieces are
  // absolutely positioned siblings, not nested, so the diamond's rotation does
  // not tilt the arrow with it.
  directionsIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  directionsIconDiamond: {
    position: 'absolute',
    left: 3,
    top: 3,
    width: 14,
    height: 14,
    borderWidth: 2,
    borderRadius: 3,
    borderColor: '#374151',
    transform: [{ rotate: '45deg' }],
  },
  directionsIconArrow: {
    position: 'absolute',
    left: 8,
    top: 6.5,
    width: 0,
    height: 0,
    borderTopWidth: 3.5,
    borderBottomWidth: 3.5,
    borderLeftWidth: 5,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#374151',
  },
  // Sits where the search bar would be: the two never show at once.
  pickOriginBanner: {
    position: 'absolute',
    top: 14,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#1f2937',
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 10,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 6,
  },
  pickOriginText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#ffffff',
    paddingRight: 10,
  },
  pickOriginCancel: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pickOriginCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fca5a5',
  },
  // The alternatives, laid out as a wrapping row rather than a scroller: the
  // service answers with two or three, and a horizontal scroll inside the sheet
  // fights the sheet's own drag.
  directionsRoutePicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  directionsRouteChip: {
    minWidth: 120,
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  directionsRouteChipActive: {
    borderColor: '#1d4ed8',
    backgroundColor: '#eff6ff',
  },
  directionsRouteChipLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
  },
  directionsRouteChipLabelActive: {
    color: '#1d4ed8',
  },
  directionsRouteChipDuration: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
  },
  directionsRouteChipDurationActive: {
    color: '#15803d',
  },
  directionsRouteChipMeta: {
    marginTop: 2,
    fontSize: 12,
    color: '#9ca3af',
  },
  directionsSummary: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  directionsSummaryRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  directionsDuration: {
    fontSize: 20,
    fontWeight: '700',
    color: '#15803d',
  },
  directionsDistance: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  directionsSummaryVia: {
    marginTop: 4,
    fontSize: 13,
    color: '#9ca3af',
  },
  // The two rows and the swap button sit side by side, so the button spans
  // both of them and reads as acting on the pair rather than on one row.
  directionsEndpoints: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  directionsEndpointColumn: {
    flex: 1,
  },
  directionsSwapButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionsSwapButtonDisabled: {
    opacity: 0.35,
  },
  // Two stems in a 20x20 box, drawn the way the maneuver arrows are: the head
  // is a square carrying only its top and right borders, rotated so the corner
  // where they meet points along the stem.
  directionsSwapIcon: {
    width: 20,
    height: 20,
  },
  swapUpStem: {
    position: 'absolute',
    left: 5,
    top: 5,
    width: 2,
    height: 11,
    borderRadius: 1,
    backgroundColor: '#2563eb',
  },
  swapUpHead: {
    position: 'absolute',
    left: 3,
    top: 4.5,
    width: 6,
    height: 6,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#2563eb',
    transform: [{ rotate: '-45deg' }],
  },
  swapDownStem: {
    position: 'absolute',
    left: 13,
    top: 4,
    width: 2,
    height: 11,
    borderRadius: 1,
    backgroundColor: '#2563eb',
  },
  swapDownHead: {
    position: 'absolute',
    left: 11,
    top: 9.5,
    width: 6,
    height: 6,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#2563eb',
    transform: [{ rotate: '135deg' }],
  },
  directionsEndpointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginHorizontal: -8,
    borderRadius: 10,
  },
  // Tinted while the row is the one being named, whether that is happening in
  // its field or out on the map.
  directionsEndpointRowActive: {
    backgroundColor: '#eff6ff',
  },
  // The field is the row's own text, so it carries no border or box of its
  // own: the row already reads as one.
  directionsEndpointInput: {
    marginTop: 2,
    padding: 0,
    minHeight: 22,
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  pickOnMapButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickOnMapButtonActive: {
    backgroundColor: '#dbeafe',
  },
  // A map pin: a ring for the head and a triangle for the point, meeting just
  // inside the ring's bottom so the two read as one shape.
  pickOnMapIcon: {
    width: 18,
    height: 20,
  },
  pickOnMapHead: {
    position: 'absolute',
    left: 2,
    top: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2.4,
  },
  pickOnMapTail: {
    position: 'absolute',
    left: 5,
    top: 12.5,
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  directionsEndpointDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: '#2563eb',
    marginRight: 12,
  },
  directionsEndpointSquare: {
    width: 12,
    height: 12,
    borderRadius: 2,
    borderWidth: 3,
    borderColor: '#b91c1c',
    marginRight: 12,
  },
  directionsEndpointBody: {
    flex: 1,
  },
  directionsEndpointLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9ca3af',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  // The suggestions sit in their own card under the rows rather than floating
  // over them: the sheet already scrolls, and an overlay inside it would be
  // clipped by the panel long before the list ran out.
  suggestList: {
    marginTop: 10,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  suggestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  suggestRowDivider: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  suggestRowIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  suggestRowDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2.4,
    borderColor: '#6b7280',
  },
  suggestRowBody: {
    flex: 1,
  },
  suggestRowTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  suggestRowSubtitle: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    color: '#9ca3af',
  },
  directionsEndpointLine: {
    width: 2,
    height: 14,
    marginLeft: 5,
    backgroundColor: '#e5e7eb',
  },
  // One segmented row rather than a dropdown: four modes is few enough to show
  // them all, and each one is a whole re-route, so what is selected has to stay
  // readable while the new route loads. It heads the panel: the mode decides
  // which route the endpoints below it will be joined by.
  directionsModes: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 3,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
  },
  directionsModeChip: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionsModeChipActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    elevation: 2,
  },
  // The vehicle bitmaps are 24dp squares, drawn at 3x and scaled down here.
  vehicleIcon: {
    width: 24,
    height: 24,
  },
  directionsStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  directionsStepIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  // Bent turn arrows, each assembled inside this 20x20 box from a stem, the
  // segment it turns into, and a head. Every piece is placed absolutely, so the
  // numbers below are plain coordinates in that box.
  //
  // Head orientation: the corner where the top and right borders meet points
  // north-east, so every rotation is measured from there, clockwise —
  // -45deg aims it up, 0 up-right, 45 right, 90 down-right, 135 down.
  //
  // Left-hand variants reuse these same styles mirrored with scaleX: -1.
  directionsArrow: {
    width: 20,
    height: 20,
  },
  directionsArrowMirrored: {
    transform: [{ scaleX: -1 }],
  },
  arrowStraightStem: {
    position: 'absolute',
    left: 8.9,
    top: 5,
    width: 2.2,
    height: 14,
    borderRadius: 1.1,
    backgroundColor: '#4b5563',
  },
  arrowStraightHead: {
    position: 'absolute',
    left: 6.5,
    top: 4.45,
    width: 7,
    height: 7,
    borderTopWidth: 2.2,
    borderRightWidth: 2.2,
    borderColor: '#4b5563',
    transform: [{ rotate: '-45deg' }],
  },
  arrowTurnStem: {
    position: 'absolute',
    left: 4.9,
    top: 8,
    width: 2.2,
    height: 11,
    borderRadius: 1.1,
    backgroundColor: '#4b5563',
  },
  arrowTurnArm: {
    position: 'absolute',
    left: 4.9,
    top: 8,
    width: 8,
    height: 2.2,
    borderRadius: 1.1,
    backgroundColor: '#4b5563',
  },
  arrowTurnHead: {
    position: 'absolute',
    left: 7.55,
    top: 5.6,
    width: 7,
    height: 7,
    borderTopWidth: 2.2,
    borderRightWidth: 2.2,
    borderColor: '#4b5563',
    transform: [{ rotate: '45deg' }],
  },
  arrowSlightStem: {
    position: 'absolute',
    left: 4.9,
    top: 11,
    width: 2.2,
    height: 8,
    borderRadius: 1.1,
    backgroundColor: '#4b5563',
  },
  arrowSlightArm: {
    position: 'absolute',
    left: 7.73,
    top: 4.17,
    width: 2.2,
    height: 8,
    borderRadius: 1.1,
    backgroundColor: '#4b5563',
    transform: [{ rotate: '45deg' }],
  },
  arrowSlightHead: {
    position: 'absolute',
    left: 4.66,
    top: 5.34,
    width: 7,
    height: 7,
    borderTopWidth: 2.2,
    borderRightWidth: 2.2,
    borderColor: '#4b5563',
  },
  // The bend sits high and far left so the head, which reaches back 5px from
  // its point, lands clear of the stem instead of on top of it.
  arrowSharpStem: {
    position: 'absolute',
    left: 3.9,
    top: 7,
    width: 2.2,
    height: 12,
    borderRadius: 1.1,
    backgroundColor: '#4b5563',
  },
  arrowSharpArm: {
    position: 'absolute',
    left: 6.73,
    top: 5.83,
    width: 2.2,
    height: 8,
    borderRadius: 1.1,
    backgroundColor: '#4b5563',
    transform: [{ rotate: '-45deg' }],
  },
  arrowSharpHead: {
    position: 'absolute',
    left: 6.5,
    top: 8.5,
    width: 7,
    height: 7,
    borderTopWidth: 2.2,
    borderRightWidth: 2.2,
    borderColor: '#4b5563',
    transform: [{ rotate: '90deg' }],
  },
  arrowUturnDrop: {
    position: 'absolute',
    left: 10.7,
    top: 8,
    width: 2.2,
    height: 5,
    borderRadius: 1.1,
    backgroundColor: '#4b5563',
  },
  arrowUturnHead: {
    position: 'absolute',
    left: 8.3,
    top: 7.55,
    width: 7,
    height: 7,
    borderTopWidth: 2.2,
    borderRightWidth: 2.2,
    borderColor: '#4b5563',
    transform: [{ rotate: '135deg' }],
  },
  directionsFinishMark: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#b91c1c',
  },
  directionsStepBody: {
    flex: 1,
  },
  directionsStepInstruction: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
  },
  directionsStepMeta: {
    marginTop: 3,
    fontSize: 12,
    color: '#9ca3af',
  },
});

export { directionsStyles };
