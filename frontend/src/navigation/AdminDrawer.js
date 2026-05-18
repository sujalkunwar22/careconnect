import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { View, Text, TouchableOpacity } from 'react-native';
import { LayoutDashboard, Users, FileCheck, Briefcase, LogOut, ShieldAlert } from 'lucide-react-native';
import useAuthStore from '../stores/authStore';
import AvatarGenerator from '../components/AvatarGenerator';

import AdminDashboard from '../screens/admin/AdminDashboardScreen';
import UsersManagement from '../screens/admin/UserManagementScreen';
import UserDetailScreen from '../screens/admin/UserDetailScreen';
import KycRequestsScreen from '../screens/admin/KycRequestsScreen';
import RecentActivitiesScreen from '../screens/admin/RecentActivitiesScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import KycReviewScreen from '../screens/admin/KycReviewScreen';
import JobsManagement from '../screens/admin/JobsManagementScreen';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: '#0F172A' }}>
      <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: '#1E293B', marginBottom: 8 }}>
        <AvatarGenerator userId={String(user?.id || '')} size={56} />
        <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'Poppins_600SemiBold', marginTop: 12 }}>
          {user?.full_name || 'Admin'}
        </Text>
        <Text style={{ color: '#94A3B8', fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 }}>
          {user?.email}
        </Text>
        <View style={{
          marginTop: 8, backgroundColor: '#6366F1', borderRadius: 4,
          paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start',
        }}>
          <Text style={{ color: '#fff', fontSize: 10, fontFamily: 'Inter_600SemiBold' }}>ADMIN</Text>
        </View>
      </View>

      <DrawerItem
        label="Dashboard"
        labelStyle={{ color: '#E2E8F0', fontFamily: 'Inter_500Medium' }}
        icon={({ size }) => <LayoutDashboard size={20} color="#94A3B8" />}
        onPress={() => props.navigation.navigate('AdminDashboard')}
      />
      <DrawerItem
        label="Users Management"
        labelStyle={{ color: '#E2E8F0', fontFamily: 'Inter_500Medium' }}
        icon={({ size }) => <Users size={20} color="#94A3B8" />}
        onPress={() => props.navigation.navigate('UsersManagement')}
      />
      <DrawerItem
        label="KYC Requests"
        labelStyle={{ color: '#E2E8F0', fontFamily: 'Inter_500Medium' }}
        icon={({ size }) => <FileCheck size={20} color="#94A3B8" />}
        onPress={() => props.navigation.navigate('KycList')}
      />
      <DrawerItem
        label="Jobs Management"
        labelStyle={{ color: '#E2E8F0', fontFamily: 'Inter_500Medium' }}
        icon={({ size }) => <Briefcase size={20} color="#94A3B8" />}
        onPress={() => props.navigation.navigate('JobsManagement')}
      />
      <DrawerItem
        label="Issues / Tickets"
        labelStyle={{ color: '#E2E8F0', fontFamily: 'Inter_500Medium' }}
        icon={({ size }) => <ShieldAlert size={20} color="#94A3B8" />}
        onPress={() => props.navigation.navigate('AdminIssues')}
      />

      <View style={{ flex: 1 }} />
      <View style={{ borderTopWidth: 1, borderTopColor: '#1E293B', marginTop: 20, paddingTop: 8 }}>
        <DrawerItem
          label="Logout"
          labelStyle={{ color: '#EF4444', fontFamily: 'Inter_500Medium' }}
          icon={({ size }) => <LogOut size={20} color="#EF4444" />}
          onPress={logout}
        />
      </View>
    </DrawerContentScrollView>
  );
}

export default function AdminDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: { backgroundColor: '#0F172A', width: 280 },
      }}
    >
      <Drawer.Screen name="AdminDashboard" component={AdminDashboard} />
      <Drawer.Screen name="UsersManagement" component={UsersManagement} />
      <Drawer.Screen name="UserDetail" component={UserDetailScreen} options={{ drawerItemStyle: { display: 'none' } }} />
      <Drawer.Screen name="KycList" component={KycRequestsScreen} />
      <Drawer.Screen name="KycReview" component={KycReviewScreen} options={{ drawerItemStyle: { display: 'none' } }} />
      <Drawer.Screen name="Notifications" component={NotificationsScreen} options={{ drawerItemStyle: { display: 'none' } }} />
      <Drawer.Screen name="RecentActivities" component={RecentActivitiesScreen} options={{ drawerItemStyle: { display: 'none' } }} />
      <Drawer.Screen name="JobsManagement" component={JobsManagement} />
    </Drawer.Navigator>
  );
}
