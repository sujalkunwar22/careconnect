import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';
import { Home, PlusCircle, Users, Bell, User } from 'lucide-react-native';
import useNotificationStore from '../stores/notificationStore';

import NgoDashboard from '../screens/ngo/NgoDashboardScreen';
import PostJobScreen from '../screens/ngo/PostJobScreen';
import JobApplicationsScreen from '../screens/ngo/JobApplicationsScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import MyJobsScreen from '../screens/ngo/MyJobsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();
const DashboardStack = createNativeStackNavigator();

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

function NgoDashboardStack() {
  return (
    <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
      <DashboardStack.Screen name="DashboardHome" component={NgoDashboard} />
      <DashboardStack.Screen name="MyJobs" component={MyJobsScreen} />
    </DashboardStack.Navigator>
  );
}

export default function NgoTabs() {
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
        component={NgoDashboardStack}
        options={{
          tabBarIcon: ({ focused, color }) => <TabIcon icon={Home} focused={focused} color={color} />,
        }}
      />
      <Tab.Screen
        name="Post Job"
        component={PostJobScreen}
        options={{
          tabBarIcon: ({ focused, color }) => <TabIcon icon={PlusCircle} focused={focused} color={color} />,
        }}
      />
      <Tab.Screen
        name="Applicants"
        component={JobApplicationsScreen}
        options={{
          tabBarIcon: ({ focused, color }) => <TabIcon icon={Users} focused={focused} color={color} />,
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
