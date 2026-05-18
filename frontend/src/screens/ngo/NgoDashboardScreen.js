import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import useAuthStore from '../../stores/authStore';
import useNotificationStore from '../../stores/notificationStore';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Bell, CheckCircle2, MapPin, Briefcase, Users, PlusCircle, Eye, Building2, Clock, XCircle, Shield } from 'lucide-react-native';
import JobsService from '../../services/jobsService';
import { getMediaUrl } from '../../lib/api';
import Screen from '../../components/common/Screen';
import Skeleton from '../../components/common/Skeleton';
import Avatar from '../../components/common/Avatar';

const NgoDashboardScreen = () => {
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount);

  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    active_jobs: 0,
    new_applications: 0,
    shortlisted: 0,
  });
  const [activeListings, setActiveListings] = useState([]);
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBanner(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, jobsData, appsData] = await Promise.all([
        JobsService.getNgoStats(),
        JobsService.getNgoJobs(),
        JobsService.getNgoApplications(), // Fetch all to get counts
      ]);
      
      if (statsData) {
        setDashboardStats({
          active_jobs: statsData.active_jobs || 0,
          new_applications: statsData.new_applications || (appsData ? appsData.length : 0),
          shortlisted: appsData ? appsData.filter(a => a.status?.toLowerCase() === 'shortlisted').length : 0,
        });
      }

      // Sync user profile for KYC status
      try {
        const fetchProfile = useAuthStore.getState().fetchProfile;
        if (fetchProfile) await fetchProfile();
      } catch (e) {
        console.warn("Profile sync failed in NGO dashboard", e);
      }
      
      if (jobsData && Array.isArray(jobsData)) {
        setActiveListings(jobsData.slice(0, 5).map((item) => ({
          id: item.id,
          title: item.title,
          applicants: item.applicant_count || 0,
          daysLeft: 14,
          location: item.location || 'Remote',
          raw: item
        })));
      }

      if (appsData && Array.isArray(appsData)) {
        setRecentApplicants(appsData.slice(0, 5).map((app) => ({
          id: app.id,
          name: `${app.first_name || ''} ${app.last_name || ''}`.trim() || app.applicant_name || 'Applicant',
          role: app.job_title || 'Role',
          status: app.status || 'pending',
        })));
      }
    } catch (error) {
      console.error("Error fetching NGO dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
      fetchUnreadCount();
    }, [fetchUnreadCount])
  );

  if (loading) {
    return (
      <Screen className="bg-surface">
        <View className="mt-6">
          <Skeleton width="60%" height={28} className="mb-2 rounded-l" />
          <Skeleton width="40%" height={16} className="mb-8 rounded-s" />
          <Skeleton width="100%" height={200} className="mb-6 rounded-l" />
          <View className="flex-row gap-3 mb-6">
            {[1, 2, 3].map(i => <Skeleton key={i} width="31%" height={90} className="rounded-l" />)}
          </View>
          <Skeleton width="100%" height={160} className="rounded-l" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scrollable className="bg-[#FAFAFA]" style={{ paddingHorizontal: 0 }}>
      {/* Premium Header */}
      <View className="bg-primary px-6 pt-10 pb-20 rounded-b-[40px] shadow-lg shadow-primary/20">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-white/80 text-sm font-semibold uppercase tracking-widest mb-1">
              Organization Dashboard
            </Text>
            <Text className="text-3xl text-white font-bold">
              Care Connect
            </Text>
          </View>
          <TouchableOpacity
            className="w-12 h-12 rounded-full bg-white/20 items-center justify-center border border-white/30 shadow-sm"
            onPress={() => navigation.navigate('Notifications')}
          >
            <Bell size={22} color="#ffffff" />
            {unreadCount > 0 && (
              <View className="absolute top-2 right-2 w-3 h-3 bg-red-400 border-2 border-primary rounded-full" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-5 -mt-10">
        {/* Verification Banner */}
        {(() => {
          const isVerified = user?.is_kyc_verified || ['verified', 'approved'].includes(user?.kyc_status);
          const status = user?.kyc_status;

          if (isVerified && showBanner) {
            return (
              <View className="flex-row items-center gap-3 bg-emerald-50 px-4 py-3 rounded-2xl border border-emerald-100 shadow-sm mb-4">
                <View className="w-10 h-10 rounded-xl bg-emerald-100 items-center justify-center">
                  <CheckCircle2 size={20} color="#10b981" />
                </View>
                <Text className="flex-1 text-emerald-700 text-sm font-medium">
                  Your organization is verified. You can post premium job listings.
                </Text>
              </View>
            );
          }

          if (status === 'pending' || status === 'submitted' || status === 'in_review') {
            return (
              <TouchableOpacity 
                onPress={() => navigation.navigate('KycStatus')}
                className="flex-row items-center gap-3 bg-blue-50 px-4 py-3 rounded-2xl border border-blue-100 shadow-sm mb-4"
              >
                <View className="w-10 h-10 rounded-xl bg-blue-100 items-center justify-center">
                  <Clock size={20} color="#3b82f6" />
                </View>
                <Text className="flex-1 text-blue-700 text-sm font-medium">
                  Organization verification in review. Usually takes 24-48 hours.
                </Text>
              </TouchableOpacity>
            );
          }

          if (status === 'rejected' || status === 'failed') {
            return (
              <TouchableOpacity 
                onPress={() => navigation.navigate('KycStatus')}
                className="flex-row items-center gap-3 bg-red-50 px-4 py-3 rounded-2xl border border-red-100 shadow-sm mb-4"
              >
                <View className="w-10 h-10 rounded-xl bg-red-100 items-center justify-center">
                  <XCircle size={20} color="#ef4444" />
                </View>
                <Text className="flex-1 text-red-700 text-sm font-medium">
                  Verification failed. Please re-submit your organization documents.
                </Text>
              </TouchableOpacity>
            );
          }

          if (!isVerified && status !== 'pending' && status !== 'in_review' && status !== 'rejected' && status !== 'failed') {
            return (
              <TouchableOpacity 
                onPress={() => navigation.navigate('KycSubmit')}
                className="flex-row items-center gap-3 bg-amber-50 px-4 py-3 rounded-2xl border border-amber-100 shadow-sm mb-4"
              >
                <View className="w-10 h-10 rounded-xl bg-amber-100 items-center justify-center">
                  <Shield size={20} color="#f59e0b" />
                </View>
                <Text className="flex-1 text-amber-700 text-sm font-medium">
                  Organization unverified. Submit documents for KYC to post jobs.
                </Text>
              </TouchableOpacity>
            );
          }
          return null;
        })()}

        {/* Profile Card Overlay */}
        <View className="bg-white rounded-[32px] p-6 border border-slate-100 mb-8 shadow-md shadow-slate-200/50">
          <View className="flex-row items-center">
            <View className="w-20 h-20 rounded-full overflow-hidden border-[3px] border-white shadow-sm bg-slate-50 mr-4 items-center justify-center">
              {user?.profile_image ? (
                <Image source={{ uri: getMediaUrl(user.profile_image) }} className="w-full h-full" />
              ) : (
                <Building2 size={32} color="#10b981" />
              )}
            </View>
            <View className="flex-1">
              <View className="flex-row items-center flex-wrap gap-2 mb-1">
                <Text className="text-xl text-slate-800 font-bold" numberOfLines={1}>
                  {user?.ngo_profile?.organization_name || user?.full_name || user?.username || 'Organization'}
                </Text>
                {user?.is_kyc_verified && (
                  <View className="flex-row items-center gap-1 bg-emerald-500 px-2 py-0.5 rounded-md shadow-sm">
                    <CheckCircle2 size={10} color="#ffffff" />
                    <Text className="text-white text-[9px] uppercase font-bold tracking-widest">Verified</Text>
                  </View>
                )}
              </View>
              <Text className="text-sm text-slate-500 font-medium mb-3" numberOfLines={2}>
                {user?.ngo_profile?.description || user?.bio || 'Registered organization on Care Connect Nepal.'}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            className="flex-row bg-primary py-3.5 rounded-2xl shadow-sm items-center justify-center mt-4"
            onPress={() => navigation.navigate('Post Job')}
          >
            <PlusCircle size={18} color="#ffffff" className="mr-2" />
            <Text className="text-white text-sm font-semibold tracking-wide">Post New Job</Text>
          </TouchableOpacity>
        </View>

        {/* Premium Stats Bento Grid */}
        <View className="flex-row gap-3 mb-8">
          {[
            { label: 'Active Jobs', value: dashboardStats.active_jobs.toString(), icon: Briefcase, color: '#0ea5e9', bg: '#f0f9ff' },
            { label: 'Applicants', value: dashboardStats.new_applications.toString(), icon: Users, color: '#10b981', bg: '#ecfdf5' },
            { label: 'Shortlisted', value: dashboardStats.shortlisted.toString(), icon: CheckCircle2, color: '#f43f5e', bg: '#fff1f2' },
          ].map((stat, idx) => (
            <View key={idx} className="flex-1 bg-white rounded-3xl p-5 border border-slate-100 shadow-sm items-center">
              <View style={{ backgroundColor: stat.bg }} className="w-12 h-12 rounded-full items-center justify-center mb-3">
                <stat.icon size={20} color={stat.color} />
              </View>
              <Text className="text-2xl text-slate-800 font-bold mb-1">{stat.value}</Text>
              <Text className="text-[9px] uppercase text-slate-400 font-bold tracking-widest text-center">
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Active Jobs Header */}
        <View className="flex-row justify-between items-end mb-4 px-1">
          <Text className="text-xl text-slate-800 font-bold">Active Jobs</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MyJobs')} className="bg-primary/5 px-4 py-1.5 rounded-full">
            <Text className="text-xs text-primary font-bold uppercase tracking-wider">View All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8 -mx-5 px-5">
          {activeListings.map((job, idx) => {
            const accents = [
              { bg: 'bg-red-50', borderColor: 'border-red-100', iconColor: '#ef4444' },
              { bg: 'bg-blue-50', borderColor: 'border-blue-100', iconColor: '#3b82f6' },
              { bg: 'bg-emerald-50', borderColor: 'border-emerald-100', iconColor: '#10b981' },
            ];
            const accent = accents[idx % accents.length];
            return (
              <TouchableOpacity
                key={job.id}
                activeOpacity={0.85}
                className="w-72 bg-white rounded-[24px] p-5 mr-4 border border-slate-100 shadow-sm"
                onPress={() => navigation.navigate('JobDetail', { jobId: job.id, jobData: job.raw })}
              >
                <View className="flex-row justify-between items-start mb-4">
                  <View className={`w-12 h-12 rounded-2xl items-center justify-center ${accent.bg} border ${accent.borderColor}`}>
                    <Briefcase size={20} color={accent.iconColor} />
                  </View>
                  <View className="flex-row items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                    <Clock size={10} color="#10b981" />
                    <Text className="text-emerald-600 text-[8px] uppercase font-bold tracking-widest">{job.daysLeft} Days Left</Text>
                  </View>
                </View>

                <Text className="text-lg text-slate-800 font-bold mb-3" numberOfLines={2}>
                  {job.title}
                </Text>

                <View className="flex-row gap-2 mb-6 flex-wrap">
                  <View className="flex-row items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                    <MapPin size={12} color="#64748b" />
                    <Text className="text-xs text-slate-600 font-medium">{job.location}</Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between pt-4 border-t border-slate-100">
                  <View className="flex-row items-center gap-2">
                    <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center">
                      <Users size={14} color="#64748b" />
                    </View>
                    <Text className="text-sm text-slate-700 font-semibold">{job.applicants} Applicants</Text>
                  </View>
                  <Eye size={18} color="#94a3b8" />
                </View>
              </TouchableOpacity>
            );
          })}
          {activeListings.length === 0 && (
            <View className="w-72 bg-white rounded-[24px] p-8 border border-dashed border-slate-300 items-center justify-center">
              <Briefcase size={32} color="#cbd5e1" />
              <Text className="text-slate-400 text-sm mt-3 text-center font-medium">
                No active listings. Post your first job!
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Recent Applicants Header */}
        <View className="flex-row justify-between items-end mb-4 px-1">
          <Text className="text-xl text-slate-800 font-bold">Recent Applicants</Text>
        </View>

        <View className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden mb-8">
          {recentApplicants.map((applicant, idx) => {
            const status = applicant.status || 'pending';
            const modernStatusBg = status === 'pending' ? 'bg-amber-50 border-amber-100' : 
                                  status === 'shortlisted' ? 'bg-blue-50 border-blue-100' : 
                                  ['interview', 'accepted'].includes(status) ? 'bg-emerald-50 border-emerald-100' : 
                                  'bg-red-50 border-red-100';
            const modernStatusText = status === 'pending' ? 'text-amber-600' : 
                                    status === 'shortlisted' ? 'text-blue-600' : 
                                    ['interview', 'accepted'].includes(status) ? 'text-emerald-600' : 
                                    'text-red-600';

            return (
              <View
                key={applicant.id}
                className={`flex-row items-center px-5 py-4 ${idx !== recentApplicants.length - 1 ? 'border-b border-slate-50' : ''}`}
              >
                <View className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 items-center justify-center mr-4">
                  <Avatar size={46} name={applicant.name || '?'} source={applicant.profile_image} />
                </View>
                <View className="flex-1 pr-3">
                  <Text className="text-base text-slate-800 font-semibold mb-0.5" numberOfLines={1}>
                    {applicant.name}
                  </Text>
                  <Text className="text-xs text-slate-500 font-medium" numberOfLines={1}>
                    {applicant.role}
                  </Text>
                </View>
                <View className={`px-3 py-1.5 rounded-full border ${modernStatusBg}`}>
                  <Text className={`text-[9px] uppercase font-bold tracking-widest ${modernStatusText}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </View>
              </View>
            );
          })}
          {recentApplicants.length === 0 && (
            <View className="p-8 items-center">
              <Users size={32} color="#cbd5e1" />
              <Text className="text-slate-400 text-sm mt-3 text-center font-medium">
                No recent applicants yet.
              </Text>
            </View>
          )}
        </View>

      </View>
    </Screen>
  );
};

export default NgoDashboardScreen;

