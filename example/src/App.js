import React from 'react'
import {
  StyleSheet,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native'
import {NavigationContainer} from '@react-navigation/native'
import {createNativeStackNavigator} from '@react-navigation/native-stack'
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context'
import BasicMapScreen from './screens/BasicMapScreen'

const Stack = createNativeStackNavigator()

const menuItems = [
  {
    id: 'basic-map-item',
    routeName: 'BasicMapScreen',
    title: 'Basic Map',
    subtitle: 'Simple map with basic interaction',
    badge: 'Core',
  },
]

function MenuScreen({navigation}) {
  return (
    <SafeAreaView style={styles.safeView}>
      <View style={styles.heroGlow} />
      <FlatList
        contentContainerStyle={styles.menuContainer}
        data={menuItems}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.menuHeader}>
            <Text style={styles.menuEyebrow}>MAP4D EXAMPLE</Text>
            <Text style={styles.menuTitle}>Demo</Text>
            <Text style={styles.menuDescription}>Chọn một màn hình để trải nghiệm tính năng.</Text>
          </View>
        }
        renderItem={({item}) => (
          <Pressable
            style={({pressed}) => [styles.menuItem, pressed && styles.menuItemPressed]}
            onPress={() => navigation.navigate(item.routeName)}
          >
            <View style={styles.menuItemTopRow}>
              <Text style={styles.menuItemText}>{item.title}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            </View>
            <View style={styles.menuItemBottomRow}>
              <Text style={styles.menuItemSubText}>{item.subtitle}</Text>
              <Text style={styles.arrowText}>{'>'}</Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  )
}

function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Menu"
          screenOptions={{
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: '#0f172a',
            headerShadowVisible: false,
            headerTitleStyle: {
              fontSize: 17,
              fontWeight: '700',
            },
          }}
        >
          <Stack.Screen name="Menu" component={MenuScreen} options={{headerShown: false}} />
          <Stack.Screen name="BasicMapScreen" component={BasicMapScreen} options={{title: 'Basic Map'}} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  safeView: {
    flex: 1,
    backgroundColor: '#eef2f7',
  },
  heroGlow: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#dbeafe',
  },
  menuContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  menuHeader: {
    marginBottom: 16,
  },
  menuEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#475569',
    marginBottom: 8,
  },
  menuTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  menuDescription: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  menuItem: {
    backgroundColor: '#ffffff',
    borderColor: '#d9e2ec',
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 14,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  menuItemPressed: {
    transform: [{scale: 0.99}],
    opacity: 0.92,
  },
  menuItemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  menuItemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  menuItemSubText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
    flex: 1,
    marginRight: 12,
  },
  badge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e293b',
  },
  arrowText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#64748b',
  },
})

export default App