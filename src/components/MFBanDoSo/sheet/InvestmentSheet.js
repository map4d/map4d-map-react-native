import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { DIRECTIONS_ACTION_LABEL } from '../directions/constants';
import { DirectionsBody } from '../directions/DirectionsBody';
import { DirectionsIcon } from '../directions/DirectionsIcon';
import { sharedStyles } from '../shared/styles';
import {
  SHEET_FOOTER_FADE_RATIO,
  SHEET_HALF_SNAP_RATIO,
  SHEET_KIND_INFRA,
  SHEET_KIND_ZONE,
  SHEET_SWIPE_ACTIVATION_DISTANCE,
  SHEET_TOP_PEEK,
  SHEET_TRANSLATE_Y,
} from './constants';
import { InfraSheetBody } from './InfraSheetBody';
import { InvestmentSheetBody } from './InvestmentSheetBody';
import { clampSnapValue, resolveSheetSnapTarget } from './snapAnchors';
import { sheetStyles } from './styles';
import { ZoneProjectsBody } from './ZoneProjectsBody';
import { ZoneSheetBody } from './ZoneSheetBody';

function SheetHeader({ title, onBack, onClose, panHandlers }) {
  return (
    <View style={sheetStyles.sheetHeader} {...panHandlers}>
      {onBack ? (
        <Pressable style={sheetStyles.sheetBackButton} onPress={onBack}>
          <View style={sheetStyles.sheetBackChevron} />
        </Pressable>
      ) : null}
      <Text style={sheetStyles.sheetHeaderTitle} numberOfLines={1}>
        {title}
      </Text>
      <Pressable style={sheetStyles.sheetCloseButton} onPress={onClose}>
        <Text style={sheetStyles.sheetCloseMark}>✕</Text>
      </Pressable>
    </View>
  );
}

/**
 * One scroller per view, keyed apart so switching views starts at the top
 * instead of keeping the previous view's scroll offset.
 */
function SheetScroll({ viewKey, tailSpace, children }) {
  return (
    <ScrollView
      key={viewKey}
      style={sheetStyles.sheetScroll}
      contentContainerStyle={sheetStyles.sheetScrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
      {tailSpace > 0 ? <View style={{ height: tailSpace }} /> : null}
    </ScrollView>
  );
}

function SheetActionBar({ animatedStyle, onLayout, onPressDirections }) {
  return (
    <Animated.View
      style={[sheetStyles.sheetActionBar, animatedStyle]}
      onLayout={onLayout}
    >
      <Pressable
        style={[
          sheetStyles.sheetActionButton,
          sheetStyles.sheetActionButtonGhost,
        ]}
        onPress={onPressDirections}
      >
        <DirectionsIcon />
        <Text
          style={[
            sheetStyles.sheetActionLabel,
            sheetStyles.sheetActionLabelGhost,
          ]}
        >
          {DIRECTIONS_ACTION_LABEL}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function measureHeight(event, setter) {
  const nextHeight = event?.nativeEvent?.layout?.height;
  if (typeof nextHeight !== 'number' || nextHeight <= 0) {
    return;
  }

  setter((prevHeight) =>
    Math.abs(prevHeight - nextHeight) < 1 ? prevHeight : nextHeight
  );
}

/**
 * The bottom sheet: a draggable panel that shows whichever view the component
 * has put it in — a province, a zone, that zone's projects, or a route — plus
 * the action bar that belongs to the province view.
 */
function InvestmentSheet({
  show,
  title,
  kind,
  loading,
  statusText,
  info,
  showProjects,
  zoneProjects,
  showDirections,
  directions,
  dragAnim,
  snapValue,
  onClose,
  onBack,
  onSnapTo,
  onPanelHeightChange,
  onPressProjects,
  onPressDirections,
}) {
  const [containerHeight, setContainerHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);
  const availableHeight = containerHeight || Dimensions.get('window').height;
  const panelHeight = Math.max(0, Math.round(availableHeight - SHEET_TOP_PEEK));

  // How much map the sheet hides is only known here, where the map area is
  // measured, but the camera fit that has to work around it lives in MFBanDoSo.
  useEffect(() => {
    if (typeof onPanelHeightChange === 'function') {
      onPanelHeightChange(panelHeight);
    }
  }, [panelHeight, onPanelHeightChange]);
  // The animated value is the fraction of the panel left visible, so a drag and
  // the anchors it settles on share one travel distance: the panel's own
  // height. Without that the drag would stop tracking the finger 1:1.
  const travel = panelHeight || SHEET_TRANSLATE_Y;
  const travelRef = useRef(travel);
  travelRef.current = travel;
  const snapValueRef = useRef(snapValue);
  snapValueRef.current = snapValue;
  const gestureStartValueRef = useRef(snapValue);
  const handlersRef = useRef(null);
  handlersRef.current = { onSnapTo };

  // useRef evaluates whatever it is handed on every render and then keeps
  // only the first result, so building the gesture inline there built a
  // whole PanResponder per render just to throw it away.
  const panResponderRef = useRef(null);
  if (panResponderRef.current == null) {
    panResponderRef.current = PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) =>
        Math.abs(gestureState.dy) > SHEET_SWIPE_ACTIVATION_DISTANCE &&
        Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
      onPanResponderGrant: () => {
        gestureStartValueRef.current = snapValueRef.current;
      },
      onPanResponderMove: (evt, gestureState) => {
        dragAnim.setValue(
          clampSnapValue(
            gestureStartValueRef.current - gestureState.dy / travelRef.current
          )
        );
      },
      onPanResponderRelease: (evt, gestureState) => {
        const releasedValue = clampSnapValue(
          gestureStartValueRef.current - gestureState.dy / travelRef.current
        );

        handlersRef.current.onSnapTo(
          resolveSheetSnapTarget(
            releasedValue,
            gestureState.vy,
            gestureStartValueRef.current
          )
        );
      },
      onPanResponderTerminate: () => {
        handlersRef.current.onSnapTo(gestureStartValueRef.current);
      },
    });
  }
  const panResponder = panResponderRef.current;

  if (!show) {
    return null;
  }

  const panelAnimatedStyle = {
    transform: [
      {
        translateY: dragAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [travel, 0],
        }),
      },
    ],
  };

  // The action bar sits outside the panel, so it needs no transform to stay at
  // the bottom of the screen. It only fades once the sheet is nearly closed;
  // without that it would still be sitting there after the panel slid away.
  const footerFadeAt = Math.max(
    0.01,
    Math.min(SHEET_FOOTER_FADE_RATIO, SHEET_HALF_SNAP_RATIO / 2)
  );
  const footerAnimatedStyle = {
    opacity: dragAnim.interpolate({
      inputRange: [0, footerFadeAt, 1],
      outputRange: [0, 1, 1],
    }),
  };

  // At the smaller anchors the bottom of the scroll viewport sits off-screen,
  // so the tail of the content could never be scrolled into view. Padding it by
  // the hidden slice makes the last row reachable at every anchor, plus the
  // action bar's own height: it no longer takes a slot in the panel's flow, so
  // it now covers the bottom of the scroll area rather than sitting below it.
  const scrollTailSpace = Math.max(
    0,
    Math.round(panelHeight * (1 - clampSnapValue(snapValue))) + footerHeight
  );

  // Both details can be routed to, so both carry the bar — but not the
  // drilled-down project list or the directions view, which are reached from it.
  const showActionBar =
    !showDirections && !showProjects && !loading && info != null;

  return (
    // box-none so only the panel itself takes touches: the map underneath stays
    // pannable and tappable while the sheet is open. That rules out a dimming
    // backdrop, which would both block the map and read as "map disabled".
    <View
      style={sheetStyles.sheetContainer}
      onLayout={(event) => measureHeight(event, setContainerHeight)}
      pointerEvents="box-none"
    >
      <Animated.View
        style={[
          sheetStyles.sheetPanel,
          { height: panelHeight },
          panelAnimatedStyle,
        ]}
      >
        <SheetHeader
          title={title}
          onBack={onBack}
          onClose={onClose}
          panHandlers={panResponder.panHandlers}
        />

        {showDirections ? (
          <SheetScroll viewKey="directions" tailSpace={scrollTailSpace}>
            <DirectionsBody {...directions} />
          </SheetScroll>
        ) : showProjects ? (
          <SheetScroll viewKey="projects" tailSpace={scrollTailSpace}>
            <ZoneProjectsBody {...zoneProjects} />
          </SheetScroll>
        ) : loading || !info ? (
          <View style={sharedStyles.statusBox}>
            {loading ? <ActivityIndicator color="#b91c1c" /> : null}
            <Text style={sharedStyles.statusText}>{statusText}</Text>
          </View>
        ) : (
          <SheetScroll viewKey="detail" tailSpace={scrollTailSpace}>
            {kind === SHEET_KIND_ZONE ? (
              <ZoneSheetBody info={info} onPressProjects={onPressProjects} />
            ) : kind === SHEET_KIND_INFRA ? (
              <InfraSheetBody info={info} />
            ) : (
              <InvestmentSheetBody info={info} />
            )}
          </SheetScroll>
        )}
      </Animated.View>

      {showActionBar ? (
        <SheetActionBar
          animatedStyle={footerAnimatedStyle}
          onLayout={(event) => measureHeight(event, setFooterHeight)}
          onPressDirections={onPressDirections}
        />
      ) : null}
    </View>
  );
}

export { InvestmentSheet };
