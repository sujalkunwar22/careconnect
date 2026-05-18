import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { Home, Briefcase, FolderOpen, Bell, User, History } from 'lucide-react-native';
import useNotificationStore from '../stores/notificationStore';

import ProfessionalDashboard from '../screens/main/ProfessionalDashboardScreen';
import JobsScreen from '../screens/main/JobsScreen';
import PortfolioScreen from '../screens/portfolio/PortfolioScreen';
import HistoryScreen from '../screens/portfolio/HistoryScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ icon: Icon, focused, color, badgeCount }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
      {badgeCount > 0 && (
        <View style={{
          position: 'absolute', top: -4, right: -10,
          backgroundColor: '#6366F1', borderRadius: 8,
          minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center',
          paddingHorizontal: 4,
        }}>
          <Text style={{ color: '#fff', fontSize: 10, fontFamily: 'Inter_600SemiBold' }}>
            {badgeCount > 9 ? '9+' : badgeCount}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function ProfessionalTabs() {
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 11,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={ProfessionalDashboard}
        options={{
          tabBarIcon: ({ focused, color }) => <TabIcon icon={Home} focused={focused} color={color} />,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ focused, color }) => <TabIcon icon={History} focused={focused} color={color} />,
        }}
      />
      <Tab.Screen
        name="Jobs"
        component={JobsScreen}
        options={{
          tabBarIcon: ({ focused, color }) => <TabIcon icon={Briefcase} focused={focused} color={color} />,
        }}
      />
      <Tab.Screen
        name="Portfolio"
        component={PortfolioScreen}
        options={{
          tabBarIcon: ({ focused, color }) => <TabIcon icon={FolderOpen} focused={focused} color={color} />,
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon={Bell} focused={focused} color={color} badgeCount={unreadCount} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused, color }) => <TabIcon icon={User} focused={focused} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
