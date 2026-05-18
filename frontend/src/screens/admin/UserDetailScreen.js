import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import Screen from '../../components/common/Screen';
import { ArrowLeft, User, Mail, Phone, MapPin, ShieldCheck, ShieldOff, Clock, Briefcase } from 'lucide-react-native';
import AdminService from '../../services/adminService';

const UserDetailScreen = ({ route, navigation }) => {
  const { userId, userData } = route.params || {};
  const [user, setUser] = useState(userData || null);
  const [loading, setLoading] = useState(!userData);

  useEffect(() => {
    if (!userData && userId) {
      fetchUser();
    }
  }, [userId, userData]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const data = await AdminService.getUser(userId);
      setUser(data);
    } catch (error) {
      console.error('Failed to load user details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator size="large" color="#6366F1" />
      </Screen>
    );
  }

  if (!user) {
    return (
      <Screen className="items-center justify-center">
        <Text className="text-text-secondary font-poppins-500 text-base">Unable to load user details.</Text>
      </Screen>
    );
  }

  const normalizedRole = (user.role || '').toLowerCase();
  const roleLabel = normalizedRole === 'user' ? 'Professional' : normalizedRole === 'ngo' ? 'NGO' : user.role || 'Unknown';
  const statusLabel = user.is_active ? 'Active' : 'Inactive';
  const kycLabel = user.is_kyc_verified ? 'Verified' : 'Not Verified';
  const joinedDate = user.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A';

  return (
    <Screen scrollable className="bg-background">
      <View className="px-6 pt-6 pb-4">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="w-8 h-8 items-center justify-center bg-white rounded-full shadow-sm mr-3"
          >
            <ArrowLeft size={20} color="#0F172A" />
          </TouchableOpacity>
          <View>
            <Text className="text-3xl font-poppins-700 text-text-primary mb-1">User Details</Text>
            <Text className="text-text-secondary font-poppins-400 text-sm">Complete profile information for this user.</Text>
          </View>
        </View>

        <View className="bg-white rounded-3xl p-6 shadow-sm border border-border/50 mb-6">
          <View className="flex-row items-center mb-5">
            <View className="w-20 h-20 rounded-3xl bg-slate-100 items-center justify-center mr-4 overflow-hidden">
              {user.profile_image ? (
                <Image source={{ uri: user.profile_image }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <User size={42} color="#94A3B8" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-poppins-700 text-text-primary">{user.full_name || user.username || 'Unnamed User'}</Text>
              <Text className="text-text-secondary font-poppins-400 text-sm mt-1">{roleLabel}</Text>
            </View>
          </View>

          <View className="grid grid-cols-2 gap-4">
            <View className="bg-slate-50 rounded-3xl p-4">
              <Text className="text-xs font-poppins-600 text-text-secondary uppercase mb-2">Status</Text>
              <Text className="text-base font-poppins-700 text-text-primary">{statusLabel}</Text>
            </View>
            <View className="bg-slate-50 rounded-3xl p-4">
              <Text className="text-xs font-poppins-600 text-text-secondary uppercase mb-2">KYC</Text>
              <Text className="text-base font-poppins-700 text-text-primary">{kycLabel}</Text>
            </View>
            <View className="bg-slate-50 rounded-3xl p-4">
              <Text className="text-xs font-poppins-600 text-text-secondary uppercase mb-2">Joined</Text>
              <Text className="text-base font-poppins-700 text-text-primary">{joinedDate}</Text>
            </View>
            <View className="bg-slate-50 rounded-3xl p-4">
              <Text className="text-xs font-poppins-600 text-text-secondary uppercase mb-2">Role</Text>
              <Text className="text-base font-poppins-700 text-text-primary">{roleLabel}</Text>
            </View>
          </View>
        </View>

        <View className="space-y-4 mb-6">
          <View className="bg-white rounded-3xl p-5 shadow-sm border border-border/50">
            <View className="flex-row items-center mb-3">
              <Mail size={16} color="#0F172A" />
              <Text className="font-poppins-700 text-text-primary text-sm ml-2">Email</Text>
            </View>
            <Text className="text-text-secondary font-poppins-400 text-sm">{user.email || 'N/A'}</Text>
          </View>

          <View className="bg-white rounded-3xl p-5 shadow-sm border border-border/50">
            <View className="flex-row items-center mb-3">
              <Phone size={16} color="#0F172A" />
              <Text className="font-poppins-700 text-text-primary text-sm ml-2">Phone</Text>
            </View>
            <Text className="text-text-secondary font-poppins-400 text-sm">{user.phone_number || 'N/A'}</Text>
          </View>

          <View className="bg-white rounded-3xl p-5 shadow-sm border border-border/50">
            <View className="flex-row items-center mb-3">
              <MapPin size={16} color="#0F172A" />
              <Text className="font-poppins-700 text-text-primary text-sm ml-2">Location</Text>
            </View>
            <Text className="text-text-secondary font-poppins-400 text-sm">{user.address || 'N/A'}</Text>
            <Text className="text-text-secondary font-poppins-400 text-sm mt-1">
              {user.municipality ? `${user.municipality}${user.ward ? `, Ward ${user.ward}` : ''}` : 'N/A'}
            </Text>
          </View>

          {(normalizedRole === 'user' || normalizedRole === 'professional') && (
            <View className="bg-white rounded-3xl p-5 shadow-sm border border-border/50">
              <View className="flex-row items-center mb-3">
                <Briefcase size={16} color="#0F172A" />
                <Text className="font-poppins-700 text-text-primary text-sm ml-2">Professional Details</Text>
              </View>
              <Text className="text-text-secondary font-poppins-400 text-sm mb-2">Title: {user.professional_title || 'N/A'}</Text>
              <Text className="text-text-secondary font-poppins-400 text-sm">Skills: {user.skills || 'N/A'}</Text>
              <Text className="text-text-secondary font-poppins-400 text-sm mt-2">Bio: {user.bio || 'N/A'}</Text>
            </View>
          )}

          {normalizedRole === 'ngo' && user.ngo_profile && (
            <View className="bg-white rounded-3xl p-5 shadow-sm border border-border/50">
              <Text className="font-poppins-700 text-text-primary text-sm mb-3">NGO Profile</Text>
              <Text className="text-text-secondary font-poppins-400 text-sm">Organization: {user.ngo_profile.organization_name || 'N/A'}</Text>
              <Text className="text-text-secondary font-poppins-400 text-sm">Registration: {user.ngo_profile.registration_number || 'N/A'}</Text>
              <Text className="text-text-secondary font-poppins-400 text-sm">Sector: {user.ngo_profile.sector || 'N/A'}</Text>
              <Text className="text-text-secondary font-poppins-400 text-sm">Website: {user.ngo_profile.website || 'N/A'}</Text>
              <Text className="text-text-secondary font-poppins-400 text-sm mt-2">Verified: {user.ngo_profile.is_verified ? 'Yes' : 'No'}</Text>
            </View>
          )}
        </View>
      </View>
    </Screen>
  );
};

export default UserDetailScreen;
