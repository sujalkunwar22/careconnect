import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, RefreshControl, Platform, Alert, ActivityIndicator } from 'react-native';
import Screen from '../../components/common/Screen';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../../stores/authStore';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import PortfolioService from '../../services/portfolioService';
import JobsService from '../../services/jobsService';
import UserService from '../../services/userService';
import * as ImagePicker from 'expo-image-picker';

const ProfileScreen = ({ navigation }) => {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analytics, setAnalytics] = useState({ completed: 0, applications: 0 });
  const [notifications, setNotifications] = useState(true);
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);

  const fetchAnalytics = async () => {
    try {
      // Sync profile first to get latest KYC status
      if (fetchProfile) await fetchProfile();
      
      if (user?.role === 'ngo') {
        const [listings, apps] = await Promise.all([
          JobsService.getNgoJobs(),
          JobsService.getNgoApplications()
        ]);
        setAnalytics({
          completed: listings.length || 0,
          applications: apps.length || 0
        });
      } else {
        const [portfolio, apps] = await Promise.all([
          PortfolioService.getSummaryStats(),
          JobsService.getMyApplications()
        ]);
        setAnalytics({
          completed: apps.filter(a => ['completed', 'accepted'].includes(String(a.status).toLowerCase())).length || 0,
          applications: apps.length || 0
        });
      }
    } catch (error) {
      console.error('Error fetching profile analytics:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchAnalytics();
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleImageUpload = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        const permissionMsg = 'Permission to access media library is required to upload profile pictures!';
        if (Platform.OS === 'web') alert(permissionMsg);
        else Alert.alert('Permission Denied', permissionMsg);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      setUploading(true);
      const asset = result.assets[0];

      const formData = new FormData();
      
      if (Platform.OS === 'web') {
        if (asset.file) {
          formData.append('profile_image', asset.file);
        } else {
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          const fileType = asset.type || blob.type || 'image/jpeg';
          const fileExtension = fileType.split('/').pop() || 'jpg';
          const file = new File([blob], `profile_${Date.now()}.${fileExtension}`, { type: fileType });
          formData.append('profile_image', file);
        }
      } else {
        const uriParts = asset.uri.split('/');
        const fileName = uriParts[uriParts.length - 1];
        const uri = asset.uri.startsWith('file://') ? asset.uri : `file://${asset.uri}`;
        formData.append('profile_image', {
          uri,
          name: fileName,
          type: asset.type || 'image/jpeg',
        });
      }

      await UserService.updateProfile(formData);

      if (fetchProfile) {
        await fetchProfile();
      }

      const successMsg = 'Profile picture updated successfully!';
      if (Platform.OS === 'web') alert(successMsg);
      else Alert.alert('Success', successMsg);
    } catch (error) {
      console.error('Image upload failed:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to upload profile picture.';
      if (Platform.OS === 'web') alert(errorMsg);
      else Alert.alert('Upload Error', errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const SettingRow = ({ icon, label, rightElement, onPress, color = '#64748b' }) => (
    <TouchableOpacity
      className="flex-row items-center justify-between py-4 border-b border-border/50"
      onPress={onPress}
      disabled={!onPress}
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${color}15` }}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text className="text-base font-semibold text-text">{label}</Text>
      </View>
      {rightElement || <Ionicons name="chevron-forward" size={20} color="#9ca3af" />}
    </TouchableOpacity>
  );

  return (
    <Screen scrollable className="bg-[#FAFAFA]"
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#6366F1" />}
    >
      {/* Premium Overlapping Header */}
      <View className="bg-primary pt-16 pb-20 rounded-b-[40px] shadow-lg shadow-primary/20">
        <View className="items-center">
          <TouchableOpacity 
            onPress={handleImageUpload}
            disabled={uploading}
            className="w-32 h-32 bg-white/20 rounded-full items-center justify-center mb-4 border-4 border-white shadow-xl relative"
          >
            {uploading ? (
              <ActivityIndicator size="large" color="#ffffff" />
            ) : user?.profile_image ? (
              <Avatar size={120} name={user.full_name || user.username} source={user.profile_image} className="border-2 border-white" />
            ) : (
              <Text className="text-5xl font-bold text-white">{(user?.full_name || user?.username)?.charAt(0)}</Text>
            )}
            
            {/* Edit Badge */}
            <View className="absolute bottom-0 right-2 w-9 h-9 bg-white items-center justify-center rounded-full border-4 border-primary shadow-sm">
              <Ionicons name="camera" size={16} color="#6366F1" />
            </View>

            {/* KYC Badge (positioned opposite) */}
            {(user?.is_kyc_verified || ['verified', 'approved'].includes(user?.kyc_status)) && (
              <View className="absolute top-0 right-2 w-8 h-8 bg-[#10b981] items-center justify-center rounded-full border-4 border-white shadow-sm">
                <Ionicons name="shield-checkmark" size={14} color="white" />
              </View>
            )}
          </TouchableOpacity>
          
          <Text className="text-3xl font-bold text-white mb-1 shadow-sm">{user?.full_name || user?.username}</Text>
          <View className="bg-white/20 px-4 py-1.5 rounded-full mt-1 border border-white/30">
            <Text className="text-xs font-semibold text-white uppercase tracking-widest">{user?.role || 'Caregiver'} Account</Text>
          </View>
          <Text className="text-sm font-medium text-white/80 mt-3 tracking-wide">{user?.email || user?.phone_number}</Text>
        </View>
      </View>

      <View className="px-5 -mt-8">
        {/* Analytics Bento Grid */}
        <View className="flex-row justify-between mb-6">
          <View className="flex-1 bg-white rounded-3xl p-5 mr-2 shadow-sm border border-slate-100 items-center justify-center min-h-[110px]">
            {user?.role === 'ngo' ? (
              <>
                <Text className="text-4xl font-bold text-text">{analytics.completed}</Text>
                <Text className="text-[10px] text-text-muted mt-2 uppercase font-bold tracking-widest text-center">Job Listings</Text>
              </>
            ) : (
              <TouchableOpacity onPress={() => navigation.navigate('History', { activeTab: 'activities' })} className="items-center">
                <Text className="text-4xl font-bold text-text">{analytics.completed}</Text>
                <Text className="text-[10px] text-text-muted mt-2 uppercase font-bold tracking-widest text-center">Completed Jobs</Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="flex-1 bg-white rounded-3xl p-5 ml-2 shadow-sm border border-slate-100 items-center justify-center min-h-[110px]">
            {user?.role === 'ngo' ? (
              <>
                <Text className="text-4xl font-bold text-primary">{analytics.applications}</Text>
                <Text className="text-[10px] text-primary/70 mt-2 uppercase font-bold tracking-widest text-center">Total Applicants</Text>
              </>
            ) : (
              <TouchableOpacity onPress={() => navigation.navigate('History', { activeTab: 'applications' })} className="items-center">
                <Text className="text-4xl font-bold text-primary">{analytics.applications}</Text>
                <Text className="text-[10px] text-primary/70 mt-2 uppercase font-bold tracking-widest text-center">Job Apps</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Account Settings Card */}
        <View className="bg-white rounded-[32px] p-6 mb-6 shadow-sm border border-slate-100">
          <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-2">Account Management</Text>
          
          <SettingRow 
            icon="person" 
            label="Personal Information" 
            color="#3b82f6" 
            onPress={() => setShowPersonalInfo(!showPersonalInfo)}
            rightElement={<Ionicons name={showPersonalInfo ? "chevron-down" : "chevron-forward"} size={20} color="#cbd5e1" />}
          />
          
          {showPersonalInfo && (
            <View className="bg-slate-50 p-5 rounded-3xl mb-4 mt-2 border border-slate-100">
              <View className="space-y-4">
                <View>
                  <Text className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-wider">Full Name</Text>
                  <Text className="text-[15px] font-semibold text-slate-800">{user?.full_name || 'N/A'}</Text>
                </View>
                <View>
                  <Text className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-wider">Email Address</Text>
                  <Text className="text-[15px] font-semibold text-slate-800">{user?.email || 'N/A'}</Text>
                </View>
                <View>
                  <Text className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-wider">Phone Number</Text>
                  <Text className="text-[15px] font-semibold text-slate-800">{user?.phone_number || 'N/A'}</Text>
                </View>
                {(user?.address || user?.municipality) && (
                  <View>
                    <Text className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-wider">Location</Text>
                    <Text className="text-[15px] font-semibold text-slate-800 leading-5">
                      {user?.address ? `${user.address}, ` : ''}
                      {user?.municipality || ''}
                      {user?.ward ? ` - Ward ${user.ward}` : ''}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
          
          <SettingRow 
            icon="shield-checkmark" 
            label="Identity Verification" 
            color="#10b981" 
            onPress={() => {
              const isVerified = user?.is_kyc_verified || ['verified', 'approved'].includes(user?.kyc_status);
              const status = String(user?.kyc_status || '').toLowerCase();
              if (isVerified || (status && status !== 'none')) {
                navigation.navigate('KycStatus');
              } else {
                navigation.navigate('KycSubmit');
              }
            }}
          />
          
          {user?.role !== 'ngo' && (
            <SettingRow 
              icon="briefcase" 
              label="My Applications" 
              color="#f43f5e" 
              onPress={() => navigation.navigate('History', { activeTab: 'applications' })}
            />
          )}
          
          <SettingRow
            icon="notifications"
            label="Push Notifications"
            color="#f59e0b"
            rightElement={<Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: "#e2e8f0", true: "#6366F1" }} thumbColor="#ffffff" />}
          />
        </View>

        {/* Support Card */}
        <View className="bg-white rounded-[32px] p-6 mb-8 shadow-sm border border-slate-100">
          <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-2">Support & Guidance</Text>
          <SettingRow
            icon="help-buoy"
            label="Help Center & FAQs"
            color="#8b5cf6"
            onPress={() => navigation.navigate('HelpCenter')}
          />
          <SettingRow
            icon="ticket"
            label="My Support Tickets"
            color="#0ea5e9"
            onPress={() => navigation.navigate('MyTickets')}
          />
        </View>

        <TouchableOpacity 
          onPress={handleLogout}
          className="bg-red-50/80 border border-red-100 rounded-3xl py-4 flex-row items-center justify-center mb-12 mx-2"
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" className="mr-2" />
          <Text className="text-red-500 font-bold text-base ml-2">Secure Log Out</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
};

export default ProfileScreen;
