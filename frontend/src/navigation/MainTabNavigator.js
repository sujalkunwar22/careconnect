import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { Home, ClipboardList, Briefcase, User, GraduationCap, Users, CheckCircle } from 'lucide-react-native';
import useAuthStore from '../../stores/authStore';

// Common screens
import DashboardRouter from '../screens/main/DashboardRouter';
import ProfileScreen from '../screens/main/ProfileScreen';

// Professional screens
import PortfolioScreen from '../screens/portfolio/PortfolioScreen';
import JobsScreen from '../screens/main/JobsScreen';
import HistoryScreen from '../screens/portfolio/HistoryScreen';

// NGO screens
import MyJobsScreen from '../screens/ngo/MyJobsScreen';
import VerifyActivitiesScreen from '../screens/ngo/VerifyActivitiesScreen';

// Admin screens
import ApplicantsListScreen from '../screens/admin/ApplicantsListScreen';
import KycReviewScreen from '../screens/admin/KycReviewScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const user = useAuthStore((state) => state.user);
  const role = user?.role || 'professional'; // 'professional', 'ngo', 'admin', 'verifier'

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#6366F1', // primary
        tabBarInactiveTintColor: '#94A3B8', // text-secondary
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#E5E7E9', // border
          elevation: 5,
          ...Platform.select({
            web: { boxShadow: '0 -4px 10px rgba(0,0,0,0.05)' },
            default: { shadowOpacity: 0.05, shadowRadius: 10 },
          }),
          paddingBottom: Platform.OS === 'ios' ? 25 : 12,
          paddingTop: 10,
          height: Platform.OS === 'ios' ? 95 : 75,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'Poppins_600SemiBold',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardRouter}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <Home color={color} size={24} />
          ),
        }}
      />
      
      {/* Professional Tabs */}
      {(role === 'professional') && (
        <>
          <Tab.Screen
            name="HistoryTab"
            component={HistoryScreen}
            options={{
              tabBarLabel: 'History',
              tabBarIcon: ({ color }) => (
                <ClipboardList color={color} size={24} />
              ),
            }}
          />
          <Tab.Screen
            name="JobsTab"
            component={JobsScreen}
            options={{
              tabBarLabel: 'Jobs',
              tabBarIcon: ({ color }) => (
                <Briefcase color={color} size={24} />
              ),
            }}
          />
          <Tab.Screen
            name="PortfolioTab"
            component={PortfolioScreen}
            options={{
              tabBarLabel: 'Portfolio',
              tabBarIcon: ({ color }) => (
                <GraduationCap color={color} size={24} />
              ),
            }}
          />
        </>
      )}

      {/* NGO Tabs */}
      {(role === 'ngo') && (
        <>
          <Tab.Screen
            name="MyJobsTab"
            component={MyJobsScreen}
            options={{
              tabBarLabel: 'My Postings',
              tabBarIcon: ({ color }) => (
                <Briefcase color={color} size={24} />
              ),
            }}
          />
          <Tab.Screen
            name="VerifyActivitiesTab"
            component={VerifyActivitiesScreen}
            options={{
              tabBarLabel: 'Verify',
              tabBarIcon: ({ color }) => (
                <CheckCircle color={color} size={24} />
              ),
            }}
          />
        </>
      )}

      {/* Admin / Verifier Tabs */}
      {(role === 'admin' || role === 'verifier') && (
        <>
          <Tab.Screen
            name="ApplicantsTab"
            component={ApplicantsListScreen}
            options={{
              tabBarLabel: 'Applicants',
              tabBarIcon: ({ color }) => (
                <Users color={color} size={24} />
              ),
            }}
          />
          <Tab.Screen
            name="KycReviewTab"
            component={KycReviewScreen}
            options={{
              tabBarLabel: 'KYC Review',
              tabBarIcon: ({ color }) => (
                <CheckCircle color={color} size={24} />
              ),
            }}
          />
        </>
      )}

      {/* Common Profile Tab */}
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <User color={color} size={24} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
