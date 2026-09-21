import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { sharedStyles } from '../shared/styles';
import {
  DIRECTIONS_DESTINATION_LABEL,
  DIRECTIONS_DESTINATION_PLACEHOLDER,
  DIRECTIONS_ENDPOINT_DESTINATION,
  DIRECTIONS_ENDPOINT_ORIGIN,
  DIRECTIONS_ORIGIN_LABEL,
  DIRECTIONS_ORIGIN_PLACEHOLDER,
  DIRECTIONS_PICK_ON_MAP_LABEL,
  DIRECTIONS_ROUTES_TITLE,
  DIRECTIONS_ROUTE_LABEL_PREFIX,
  DIRECTIONS_STEPS_TITLE,
  DIRECTIONS_SUGGEST_EMPTY_TEXT,
  DIRECTIONS_SUGGEST_LOADING_TEXT,
} from './constants';
import { ManeuverArrow } from './ManeuverArrow';
import { ModeSelector } from './ModeSelector';
import { directionsStyles } from './styles';
import { SwapEndpointsButton } from './SwapEndpointsButton';

const PICK_ON_MAP_COLOR = '#6b7280';
const PICK_ON_MAP_ACTIVE_COLOR = '#2563eb';

/**
 * Hands the row back to the map. Typing covers the places the service knows by
 * name; this covers everywhere else — a spot in a field, a gate on the far side
 * of a zone — which is why it sits beside the field rather than replacing it.
 */
function PickOnMapButton({ isPicking, onPress }) {
  const color = isPicking ? PICK_ON_MAP_ACTIVE_COLOR : PICK_ON_MAP_COLOR;

  return (
    <Pressable
      style={[
        directionsStyles.pickOnMapButton,
        isPicking && directionsStyles.pickOnMapButtonActive,
      ]}
      accessibilityRole="button"
      accessibilityLabel={DIRECTIONS_PICK_ON_MAP_LABEL}
      onPress={onPress}
    >
      <View style={directionsStyles.pickOnMapIcon}>
        <View
          style={[directionsStyles.pickOnMapHead, { borderColor: color }]}
        />
        <View
          style={[directionsStyles.pickOnMapTail, { borderTopColor: color }]}
        />
      </View>
    </Pressable>
  );
}

function DirectionsEndpointRow({
  label,
  value,
  placeholder,
  markerStyle,
  isActive,
  isPicking,
  onChangeText,
  onFocus,
  onPickOnMap,
}) {
  return (
    <View
      style={[
        directionsStyles.directionsEndpointRow,
        isActive && directionsStyles.directionsEndpointRowActive,
      ]}
    >
      <View style={markerStyle} />
      <View style={directionsStyles.directionsEndpointBody}>
        <Text style={directionsStyles.directionsEndpointLabel}>{label}</Text>
        <TextInput
          style={directionsStyles.directionsEndpointInput}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          returnKeyType="search"
          autoCorrect={false}
          onChangeText={onChangeText}
          onFocus={onFocus}
        />
      </View>
      <PickOnMapButton isPicking={isPicking} onPress={onPickOnMap} />
    </View>
  );
}

/**
 * One place the service knows, under the address that tells it from its
 * namesakes — there are a great many streets called Nguyễn Huệ.
 */
function SuggestionRow({ item, isFirst, onPress }) {
  return (
    <Pressable
      style={[
        directionsStyles.suggestRow,
        !isFirst && directionsStyles.suggestRowDivider,
      ]}
      onPress={() => onPress(item)}
    >
      <View style={directionsStyles.suggestRowIcon}>
        <View style={directionsStyles.suggestRowDot} />
      </View>
      <View style={directionsStyles.suggestRowBody}>
        <Text style={directionsStyles.suggestRowTitle} numberOfLines={1}>
          {item.name}
        </Text>
        {item.address ? (
          <Text style={directionsStyles.suggestRowSubtitle} numberOfLines={2}>
            {item.address}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function SuggestionList({ loading, items, onSelect }) {
  if (loading || items.length === 0) {
    return (
      <View style={sharedStyles.statusBox}>
        {loading ? <ActivityIndicator color="#b91c1c" /> : null}
        <Text style={sharedStyles.statusText}>
          {loading
            ? DIRECTIONS_SUGGEST_LOADING_TEXT
            : DIRECTIONS_SUGGEST_EMPTY_TEXT}
        </Text>
      </View>
    );
  }

  return (
    <View style={directionsStyles.suggestList}>
      {items.map((item, index) => (
        <SuggestionRow
          key={item.key}
          item={item}
          isFirst={index === 0}
          onPress={onSelect}
        />
      ))}
    </View>
  );
}

/**
 * The alternatives the service answered with. Only drawn when there is more
 * than one: with a single route the chip would say what the summary below it
 * already says.
 */
function RoutePicker({ routes, activeIndex, onSelectRoute }) {
  if (routes.length < 2) {
    return null;
  }

  return (
    <React.Fragment>
      <View style={sharedStyles.section}>
        <Text style={sharedStyles.sectionTitle}>{DIRECTIONS_ROUTES_TITLE}</Text>
      </View>
      <View style={directionsStyles.directionsRoutePicker}>
        {routes.map((route, position) => {
          const isActive = route.index === activeIndex;
          const meta = route.summary
            ? [route.distanceText, `Qua ${route.summary}`]
            : [route.distanceText];

          return (
            <Pressable
              key={route.key}
              style={[
                directionsStyles.directionsRouteChip,
                isActive && directionsStyles.directionsRouteChipActive,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              onPress={() => onSelectRoute(route.index)}
            >
              <Text
                style={[
                  directionsStyles.directionsRouteChipLabel,
                  isActive && directionsStyles.directionsRouteChipLabelActive,
                ]}
              >
                {`${DIRECTIONS_ROUTE_LABEL_PREFIX} ${position + 1}`}
              </Text>
              {route.durationText ? (
                <Text
                  style={[
                    directionsStyles.directionsRouteChipDuration,
                    isActive &&
                      directionsStyles.directionsRouteChipDurationActive,
                  ]}
                >
                  {route.durationText}
                </Text>
              ) : null}
              <Text
                style={directionsStyles.directionsRouteChipMeta}
                numberOfLines={1}
              >
                {meta.filter((part) => part).join(' · ')}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </React.Fragment>
  );
}

function DirectionsSummary({ route }) {
  return (
    <View style={directionsStyles.directionsSummary}>
      <View style={directionsStyles.directionsSummaryRow}>
        {route.durationText ? (
          <Text style={directionsStyles.directionsDuration}>
            {route.durationText}
          </Text>
        ) : null}
        {route.distanceText ? (
          <Text style={directionsStyles.directionsDistance}>
            {route.distanceText}
          </Text>
        ) : null}
      </View>
      {route.summary ? (
        <Text style={directionsStyles.directionsSummaryVia} numberOfLines={1}>
          {`Qua ${route.summary}`}
        </Text>
      ) : null}
    </View>
  );
}

function DirectionsStep({ step }) {
  return (
    <View style={directionsStyles.directionsStepRow}>
      <ManeuverArrow maneuver={step.maneuver} />
      <View style={directionsStyles.directionsStepBody}>
        <Text style={directionsStyles.directionsStepInstruction}>
          {step.instruction}
        </Text>
        {step.distanceText ? (
          <Text style={directionsStyles.directionsStepMeta}>
            {step.streetName
              ? `${step.distanceText} · ${step.streetName}`
              : step.distanceText}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

/** The route panel: its two endpoints, a summary, and the turn-by-turn list. */
function DirectionsBody({
  loading,
  statusText,
  routes,
  route,
  activeRouteIndex,
  mode,
  originText,
  destinationText,
  pickingEndpoint,
  canSwapEndpoints,
  editingEndpoint,
  query,
  suggestions,
  suggestLoading,
  onPickEndpoint,
  onSwapEndpoints,
  onChangeMode,
  onChangeQuery,
  onFocusEndpoint,
  onSelectSuggestion,
  onSelectRoute,
}) {
  const steps = route && Array.isArray(route.steps) ? route.steps : [];
  const routeOptions = Array.isArray(routes) ? routes : [];
  // While a field is being typed into, the suggestions take the panel. What is
  // below them describes the endpoints as they stand, not as they are being
  // changed — and the keyboard would bury it anyway.
  const isEditing = editingEndpoint != null;
  const valueFor = (endpoint, text) =>
    editingEndpoint === endpoint ? query : text ?? '';

  return (
    <React.Fragment>
      <ModeSelector mode={mode} onChangeMode={onChangeMode} />

      {/* Always drawn, even with no route yet: these rows are where a missing
          endpoint gets named or picked from. */}
      <View style={directionsStyles.directionsEndpoints}>
        <View style={directionsStyles.directionsEndpointColumn}>
          <DirectionsEndpointRow
            label={DIRECTIONS_ORIGIN_LABEL}
            value={valueFor(DIRECTIONS_ENDPOINT_ORIGIN, originText)}
            placeholder={DIRECTIONS_ORIGIN_PLACEHOLDER}
            markerStyle={directionsStyles.directionsEndpointDot}
            isActive={
              editingEndpoint === DIRECTIONS_ENDPOINT_ORIGIN ||
              pickingEndpoint === DIRECTIONS_ENDPOINT_ORIGIN
            }
            isPicking={pickingEndpoint === DIRECTIONS_ENDPOINT_ORIGIN}
            onChangeText={(text) =>
              onChangeQuery(DIRECTIONS_ENDPOINT_ORIGIN, text)
            }
            onFocus={() => onFocusEndpoint(DIRECTIONS_ENDPOINT_ORIGIN)}
            onPickOnMap={() => onPickEndpoint(DIRECTIONS_ENDPOINT_ORIGIN)}
          />
          <View style={directionsStyles.directionsEndpointLine} />
          <DirectionsEndpointRow
            label={DIRECTIONS_DESTINATION_LABEL}
            value={valueFor(DIRECTIONS_ENDPOINT_DESTINATION, destinationText)}
            placeholder={DIRECTIONS_DESTINATION_PLACEHOLDER}
            markerStyle={directionsStyles.directionsEndpointSquare}
            isActive={
              editingEndpoint === DIRECTIONS_ENDPOINT_DESTINATION ||
              pickingEndpoint === DIRECTIONS_ENDPOINT_DESTINATION
            }
            isPicking={pickingEndpoint === DIRECTIONS_ENDPOINT_DESTINATION}
            onChangeText={(text) =>
              onChangeQuery(DIRECTIONS_ENDPOINT_DESTINATION, text)
            }
            onFocus={() => onFocusEndpoint(DIRECTIONS_ENDPOINT_DESTINATION)}
            onPickOnMap={() => onPickEndpoint(DIRECTIONS_ENDPOINT_DESTINATION)}
          />
        </View>
        <SwapEndpointsButton
          disabled={!canSwapEndpoints}
          onPress={onSwapEndpoints}
        />
      </View>

      {isEditing ? (
        <SuggestionList
          loading={suggestLoading}
          items={Array.isArray(suggestions) ? suggestions : []}
          onSelect={onSelectSuggestion}
        />
      ) : (
        <React.Fragment>
          {loading || !route ? (
            <View style={sharedStyles.statusBox}>
              {loading ? <ActivityIndicator color="#b91c1c" /> : null}
              <Text style={sharedStyles.statusText}>{statusText}</Text>
            </View>
          ) : null}

          <RoutePicker
            routes={routeOptions}
            activeIndex={activeRouteIndex}
            onSelectRoute={onSelectRoute}
          />

          {route ? <DirectionsSummary route={route} /> : null}

          {steps.length > 0 ? (
            <View style={sharedStyles.section}>
              <Text style={sharedStyles.sectionTitle}>
                {DIRECTIONS_STEPS_TITLE}
              </Text>
            </View>
          ) : null}

          {steps.map((step) => (
            <DirectionsStep key={step.key} step={step} />
          ))}
        </React.Fragment>
      )}
    </React.Fragment>
  );
}

export { DirectionsBody };
