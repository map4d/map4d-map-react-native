import { StyleSheet } from 'react-native';

import { MAP_BUTTON_SIZE, MAP_BUTTON_STACK_TOP } from './constants';

// Workaround for a React Native Fabric/Android Yoga bug: an absolutely-positioned
// view stretched via top+bottom (e.g. StyleSheet.absoluteFillObject) can have its
// top offset silently dropped, collapsing the view to zero height pinned at the
// parent's bottom edge. Anchoring with top + height: '100%' instead avoids that
// code path. Do not replace this with absoluteFillObject/bottom-based stretching.
const fullFill = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: '100%',
};

/**
 * Styles more than one feature draws with: the overlay root every feature is
 * positioned inside, the round map buttons, the drawer chrome both drawers
 * share, and the section/status primitives the sheet and the directions panel
 * both build their bodies from.
 */
const sharedStyles = StyleSheet.create({
  // Every overlay lives inside this one box, which is pinned to the map's
  // measured frame so the two always line up. Before the first measurement it
  // falls back to filling the parent, which is right whenever the parent has no
  // padding of its own.
  mapOverlayRoot: {
    ...fullFill,
  },
  hiddenButton: {
    display: 'none',
  },
  topSlot: {
    ...fullFill,
  },
  // The round white button every map control is built from. It carries no
  // position of its own: one of them sits beside the search bar, the rest are
  // stacked under it.
  mapButton: {
    width: MAP_BUTTON_SIZE,
    height: MAP_BUTTON_SIZE,
    borderRadius: MAP_BUTTON_SIZE / 2,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },
  // First slot of the stack under the search bar; the ones below override `top`.
  mapButtonTopRight: {
    position: 'absolute',
    top: MAP_BUTTON_STACK_TOP,
    right: 12,
  },
  mapButtonActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  drawerContainer: {
    ...fullFill,
  },
  drawerBackdrop: {
    ...fullFill,
    backgroundColor: '#11182740',
  },
  drawerBackdropPressable: {
    ...fullFill,
  },
  drawerPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '76%',
    maxWidth: 320,
    minWidth: 260,
    backgroundColor: '#f3f4f6',
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 14,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: {
      width: 2,
      height: 0,
    },
  },
  drawerHeader: {
    marginBottom: 10,
  },
  drawerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
  },
  drawerList: {
    flex: 1,
  },
  dialogContainer: {
    ...fullFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  dialogBackdrop: {
    ...fullFill,
    backgroundColor: '#11182766',
  },
  dialogCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 6,
  },
  dialogTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
  },
  dialogMessage: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: '#4b5563',
  },
  dialogButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dialogButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563eb',
  },
  statusBox: {
    paddingHorizontal: 16,
    paddingVertical: 28,
    alignItems: 'center',
  },
  statusText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7f1d1d',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
});

export { fullFill, sharedStyles };
