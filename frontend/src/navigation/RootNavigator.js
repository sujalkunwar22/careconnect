import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import useAuthStore from '../stores/authStore';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import OtpVerificationScreen from '../screens/auth/OtpVerificationScreen';
import LandingPage from '../screens/LandingPage';

// Tab navigators
import ProfessionalTabs from './ProfessionalTabs';
import NgoTabs from './NgoTabs';
import AdminDrawer from './AdminDrawer';

// Shared screens
import JobDetailScreen from '../screens/shared/JobDetailScreen';
import JobsScreen from '../screens/main/JobsScreen';
import KycSubmitScreen from '../screens/shared/KycSubmitScreen';
import ApplicantProfileScreen from '../screens/shared/ApplicantProfileScreen';
import ActivityDetailScreen from '../screens/portfolio/ActivityDetailScreen';
import AddActivityScreen from '../screens/portfolio/AddActivityScreen';
import AddExperienceScreen from '../screens/portfolio/AddExperienceScreen';
import AddEducationScreen from '../screens/portfolio/AddEducationScreen';
import EditPortfolioScreen from '../screens/portfolio/EditPortfolioScreen';
import AddCertificationScreen from '../screens/portfolio/AddCertificationScreen';
import KycStatusScreen from '../screens/auth/KycStatusScreen';
import SuccessScreen from '../screens/shared/SuccessScreen';
import PostJobScreen from '../screens/ngo/PostJobScreen';
import ApplicationReviewScreen from '../screens/ngo/ApplicationReviewScreen';
import HelpCenterScreen from '../screens/support/HelpCenterScreen';
import SupportRequestScreen from '../screens/support/SupportRequestScreen';
import MyTicketsScreen from '../screens/support/MyTicketsScreen';
import TicketDetailScreen from '../screens/support/TicketDetailScreen';
import UserManualScreen from '../screens/support/UserManualScreen';

// Admin Support
import AdminIssuesScreen from '../screens/admin/AdminIssuesScreen';
import AdminTicketDetailScreen from '../screens/admin/AdminTicketDetailScreen';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerShown: false,
  animation: 'slide_from_right',
  contentStyle: { backgroundColor: '#F8F9FA' },
};

export default function RootNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.user?.role);

  console.log('[RootNavigator] Rendering, isAuthenticated:', isAuthenticated, 'role:', role);

  return (
    <Stack.Navigator 
      screenOptions={screenOptions}
      initialRouteName={
        !isAuthenticated ? "Landing" : 
        role === 'admin' ? "AdminMain" : 
        (role === 'ngo' ? "NgoMain" : "ProfessionalMain")
      }
    >
      {!isAuthenticated ? (
        <Stack.Group>
          <Stack.Screen name="Landing" component={LandingPage} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
        </Stack.Group>
      ) : (
        <Stack.Group>
          {role === 'admin' ? (
            <Stack.Screen name="AdminMain" component={AdminDrawer} />
          ) : role === 'ngo' ? (
            <Stack.Screen name="NgoMain" component={NgoTabs} />
          ) : (
            <Stack.Screen name="ProfessionalMain" component={ProfessionalTabs} />
          )}
          
          <Stack.Screen name="KycSubmit" component={KycSubmitScreen} />
          <Stack.Screen name="ApplicantProfile" component={ApplicantProfileScreen} />
          <Stack.Screen name="ApplicationReview" component={ApplicationReviewScreen} />
          <Stack.Screen name="ActivityDetail" component={ActivityDetailScreen} />
          <Stack.Screen name="AddActivity" component={AddActivityScreen} />
          <Stack.Screen name="EditPortfolio" component={EditPortfolioScreen} />
          <Stack.Screen name="AddExperience" component={AddExperienceScreen} />
          <Stack.Screen name="AddEducation" component={AddEducationScreen} />
          <Stack.Screen name="AddCertification" component={AddCertificationScreen} />
          <Stack.Screen name="KycStatus" component={KycStatusScreen} />
          <Stack.Screen name="Success" component={SuccessScreen} />
          <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
          <Stack.Screen name="SupportRequest" component={SupportRequestScreen} />
          <Stack.Screen name="MyTickets" component={MyTicketsScreen} />
          <Stack.Screen name="TicketDetail" component={TicketDetailScreen} />
          <Stack.Screen name="UserManual" component={UserManualScreen} />
          <Stack.Screen name="AdminIssues" component={AdminIssuesScreen} />
          <Stack.Screen name="AdminTicketDetail" component={AdminTicketDetailScreen} />
        </Stack.Group>
      )}
      
      {/* Shared Screens accessible to both */}
      <Stack.Screen name="Jobs" component={JobsScreen} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} />
      <Stack.Screen name="PostJob" component={PostJobScreen} />
    </Stack.Navigator>
  );
}
