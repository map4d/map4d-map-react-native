import { StyleSheet } from 'react-native';

import { fullFill } from '../shared/styles';

const sheetStyles = StyleSheet.create({
  sheetContainer: {
    ...fullFill,
    // The panel is as tall as the whole map area and is slid down to sit at an
    // anchor, so at anything below the top anchor its lower part hangs past the
    // bottom of this box. Views do not clip their children by default, so
    // without this the hidden part of the list still paints — over whatever is
    // below the map, the system navigation bar included.
    overflow: 'hidden',
  },
  // height is applied at runtime in pixels (see InvestmentSheet), measured from
  // the map area. It is fixed rather than content-driven so the panel geometry
  // never shifts under the snap anchors, which are fractions of the panel's own
  // height: a panel that grew when data replaced the loading state would make
  // the sheet jump. A percentage height is not an option either — it does not
  // resolve reliably against an absolutely positioned parent, letting the panel
  // grow past the top of the map and push its drag header out of view.
  sheetPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: -4,
    },
    elevation: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingLeft: 16,
    paddingRight: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sheetHeaderTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  sheetCloseButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCloseMark: {
    fontSize: 22,
    lineHeight: 24,
    color: '#4b5563',
  },
  // The panel has a fixed height, so the scroll area takes whatever is left
  // between the header and the action bar.
  sheetScroll: {
    flex: 1,
  },
  sheetScrollContent: {
    paddingBottom: 12,
  },
  sheetHero: {
    height: 150,
    backgroundColor: '#1f2937',
    justifyContent: 'flex-end',
  },
  // Stands in for the banner when a zone has no image. It needs no scrim: the
  // colour is already dark enough to read white text off, and the scrim's blue
  // would only muddy it.
  sheetHeroPlain: {
    backgroundColor: '#5c1230',
  },
  sheetHeroImage: {
    ...fullFill,
  },
  sheetHeroScrim: {
    ...fullFill,
    backgroundColor: '#0f172a59',
  },
  sheetHeroContent: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  sheetHeroBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: '#ffffff33',
    borderWidth: 1,
    borderColor: '#ffffff80',
    marginBottom: 8,
  },
  sheetHeroBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  sheetHeroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  sheetHeroSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#e5e7eb',
  },
  sheetStatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // Cards in the same row stretch to the tallest of them, so a wrapped value
    // in one card lengthens its neighbour's box instead of leaving it short.
    alignItems: 'stretch',
    marginHorizontal: -5,
  },
  sheetStatCard: {
    width: '50%',
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  sheetStatCardInner: {
    // The stretched height lands on the card, so the bordered box has to fill
    // it for the two cards in a row to actually look the same size.
    flex: 1,
    borderWidth: 1,
    borderColor: '#f1d7d7',
    borderRadius: 10,
    backgroundColor: '#fdf7f7',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sheetStatLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9ca3af',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  sheetStatValue: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: '700',
    color: '#b91c1c',
  },
  sheetStatValueProse: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    color: '#374151',
  },
  sheetOverviewBox: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  sheetOverviewText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#374151',
  },
  sheetChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -3,
  },
  sheetChip: {
    marginHorizontal: 3,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  sheetChipText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  sheetCountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  sheetCountLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  sheetCountValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#b91c1c',
  },
  sheetContactBox: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sheetContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 34,
  },
  sheetContactIcon: {
    width: 20,
    fontSize: 13,
    color: '#b91c1c',
  },
  sheetContactText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
  },
  // Pinned to the bottom of the screen from outside the panel rather than from
  // inside it. It used to live in the panel and be counter-translated into
  // place, which looked right but left its layout position off-screen at the
  // smaller anchors — Android hit-tests against that position, so taps fell
  // straight through to the map. Layout and visual position now agree at every
  // anchor. Elevation must beat the panel's own (12) to paint above it.
  sheetActionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    zIndex: 3,
    elevation: 16,
  },
  sheetActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#b91c1c',
  },
  sheetActionButtonGhost: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  sheetActionLabelGhost: {
    color: '#374151',
  },
  sheetActionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  zoneHeroCode: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: '#0f172a80',
  },
  zoneHeroCodeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#e5e7eb',
    letterSpacing: 0.4,
  },
  // Row rather than a single slot: a zone with no geometry shows a second
  // pill alongside the status one, and both need to wrap on a narrow sheet.
  zoneStatusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 14,
    marginHorizontal: -4,
  },
  zoneStatusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    backgroundColor: '#f0fdf4',
    marginHorizontal: 4,
    marginBottom: 8,
  },
  zoneStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803d',
  },
  // Amber rather than the status pill's green/grey, so a missing shape reads
  // as a heads-up rather than another state of the same kind.
  zoneGeometryMissingPill: {
    borderColor: '#fde68a',
    backgroundColor: '#fef3c7',
  },
  zoneGeometryMissingText: {
    color: '#b45309',
  },
  zoneLabeledBox: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  zoneLabeledBoxLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9ca3af',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  zoneLabeledBoxText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#374151',
  },
  zoneParagraphSpacing: {
    marginTop: 8,
  },
  zoneChipDanger: {
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  zoneChipDangerText: {
    color: '#b91c1c',
  },
  zoneStatusPillMuted: {
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  zoneStatusTextMuted: {
    color: '#6b7280',
  },
  zoneInvestorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  zoneInvestorName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    paddingRight: 10,
  },
  zoneInvestorYear: {
    fontSize: 13,
    fontWeight: '600',
    color: '#b91c1c',
  },
  zoneProjectButtonRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginHorizontal: -5,
  },
  zoneProjectButton: {
    flex: 1,
    marginHorizontal: 5,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  zoneProjectButtonPrimary: {
    borderColor: '#7f1d1d',
    backgroundColor: '#7f1d1d',
  },
  zoneProjectButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  zoneProjectButtonLabelPrimary: {
    color: '#ffffff',
  },
  sheetBackButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -12,
    marginRight: 2,
  },
  // Drawn from two borders on a rotated square rather than a '‹' glyph: the
  // character sits off-centre in its em box by an amount that differs per
  // platform, so it drifted out of line with the title as it got bigger. A
  // border chevron has no font metrics to fight and stays centred at any size.
  // marginRight offsets the stroke sitting in the left half of the rotated box.
  sheetBackChevron: {
    width: 14,
    height: 14,
    borderLeftWidth: 2.5,
    borderBottomWidth: 2.5,
    borderColor: '#374151',
    transform: [{ rotate: '45deg' }],
    marginRight: 4,
  },
  zoneProjectsHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  zoneProjectsHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
  },
  zoneProjectsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  zoneProjectsHeaderSubtitle: {
    flex: 1,
    fontSize: 13,
    color: '#6b7280',
    paddingRight: 10,
  },
  zoneProjectsCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  zoneProjectsCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  zoneProjectList: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  zoneProjectCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  zoneProjectCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  zoneProjectName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
    paddingRight: 10,
  },
  zoneProjectStatusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  zoneProjectStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#b91c1c',
  },
  zoneProjectCode: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    letterSpacing: 0.3,
  },
  zoneProjectSector: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  zoneProjectSectorText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  zoneProjectStatRow: {
    flexDirection: 'row',
    marginTop: 12,
    marginHorizontal: -4,
  },
  zoneProjectStatCell: {
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#f1d7d7',
    borderRadius: 10,
    backgroundColor: '#fdf7f7',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  zoneProjectStatLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9ca3af',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  zoneProjectStatValue: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: '700',
    color: '#b91c1c',
  },
});

export { sheetStyles };
