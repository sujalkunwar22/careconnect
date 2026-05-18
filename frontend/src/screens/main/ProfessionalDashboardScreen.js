import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../../components/common/Screen';
import Card from '../../components/common/Card';
import Skeleton from '../../components/common/Skeleton';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import useAuthStore from '../../stores/authStore';
import useNotificationStore from '../../stores/notificationStore';
import JobsService from '../../services/jobsService';
import AvatarGenerator from '../../components/AvatarGenerator';
import api from '../../lib/api';
import {
  Bell, CheckCircle2, MapPin, Briefcase, Clock, FileText, Send,
  MessageSquare, Eye, XCircle, ChevronRight, Shield
} from 'lucide-react-native';

const ProfessionalDashboardScreen = ({ navigation }) => {
  const { user } = useAuthStore();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount);
  const [loading, setLoading] = useState(true);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [stats, setStats] = useState({ applied: '0', interviews: '0', views: '0' });

  const fetchData = async (signal) => {
    try {
      // 1. Fetch recommendations based on user title if available
      const jobsPromise = JobsService.getJobs({
        search: user?.professional_title || '',
        limit: 5
      }, { signal }).catch(err => {
        if (err.name === 'AbortError' || err.name === 'CanceledError') return null;
        console.error("Jobs fetch error:", err);
        return [];
      });

      // 2. Fetch applications separately
      const applicationsPromise = JobsService.getMyApplications({ signal }).catch(err => {
        if (err.name === 'AbortError' || err.name === 'CanceledError') return null;
        console.error("Applications fetch error:", err);
        return [];
      });

      // 3. Fetch latest user profile to sync KYC status
      const profilePromise = api.get('/users/me/', { signal }).then(res => {
        useAuthStore.getState().setUser(res.data);
        return res.data;
      }).catch(() => null);

      const [jobsData, applicationsData] = await Promise.all([jobsPromise, applicationsPromise, profilePromise]);

      // If either was aborted, stop here
      if (jobsData === null || applicationsData === null) return;

      // Create a set of job IDs the user has already applied to
      const appliedJobIds = new Set(
        Array.isArray(applicationsData)
          ? applicationsData.map(app => app.job || app.job_id)
          : []
      );

      // 3. Fallback: If no jobs found for the specific title, fetch general jobs
      let finalJobs = jobsData;
      if ((!jobsData || jobsData.length === 0) && user?.professional_title) {
        console.log("No specific matches for title, fetching general jobs...");
        finalJobs = await JobsService.getJobs({ limit: 5 }, { signal }).catch(() => []);
      }

      if (finalJobs && Array.isArray(finalJobs)) {
        const enrichedJobs = finalJobs.map(job => ({
          ...job,
          has_applied: appliedJobIds.has(job.id)
        }));
        setRecommendedJobs(enrichedJobs.slice(0, 5));
      }

      if (applicationsData && Array.isArray(applicationsData)) {
        setRecentApplications(applicationsData.slice(0, 5));
        setStats({
          applied: applicationsData.length.toString(),
          interviews: applicationsData.filter(a => ['interview', 'accepted'].includes(a.status?.toLowerCase())).length.toString(),
          shortlisted: applicationsData.filter(a => a.status?.toLowerCase() === 'shortlisted').length.toString(),
        });
      }
    } catch (error) {
      if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
        console.error("Error in dashboard fetchData:", error);
      }
    } finally {
      setLoading(false);
    }
  };


  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();
      fetchData(controller.signal);
      fetchUnreadCount();
      return () => controller.abort();
    }, [user?.professional_title, fetchUnreadCount])
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending': return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' };
      case 'shortlisted': return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Shortlisted' };
      case 'interview':
      case 'accepted': return { bg: 'bg-green-100', text: 'text-green-800', label: 'Interview' };
      case 'rejected': return { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' };
      default: return { bg: 'bg-surface-container', text: 'text-on-surface-variant', label: status || 'Unknown' };
    }
  };

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
      <View 
        className="bg-primary px-6 pt-10 pb-20 rounded-b-[40px]"
        style={{
          shadowColor: '#6366F1',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.2,
          shadowRadius: 15,
          elevation: 5,
        }}
      >
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text 
              className="text-white text-sm font-semibold uppercase tracking-widest mb-1"
              style={{ color: 'rgba(255, 255, 255, 0.8)' }}
            >
              Welcome Back 👋
            </Text>
            <Text className="text-3xl text-white font-bold">
              {user?.full_name?.split(' ')[0] || user?.username || 'Professional'}
            </Text>
          </View>
          <TouchableOpacity
            className="w-12 h-12 rounded-full items-center justify-center border"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              borderWidth: 1,
              shadowColor: '#94A3B8',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
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
        {/* Profile Card Overlay */}
        <View 
          className="bg-white rounded-[32px] p-6 border border-slate-100 mb-8"
          style={{
            shadowColor: '#CBD5E1',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View className="flex-row items-center">
            <View 
              className="w-20 h-20 rounded-full overflow-hidden bg-slate-50 mr-4"
              style={{
                borderWidth: 3,
                borderColor: '#FFFFFF',
                shadowColor: '#94A3B8',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <Avatar size={74} name={user?.full_name || user?.username || 'P'} source={user?.profile_image} />
            </View>
            <View className="flex-1">
              <Text className="text-xl text-slate-800 font-bold mb-1" numberOfLines={1}>
                {user?.full_name || user?.username || 'Professional User'}
              </Text>
              <Text className="text-sm text-slate-500 font-medium mb-2">
                {user?.professional_title || 'Registered Professional'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  const isVerified = user?.is_kyc_verified || ['verified', 'approved'].includes(user?.kyc_status);
                  const status = String(user?.kyc_status || '').toLowerCase();
                  if (isVerified || (status && status !== 'none')) {
                    navigation.navigate('KycStatus');
                  } else {
                    navigation.navigate('KycSubmit');
                  }
                }}
                className="self-start"
              >
                {(() => {
                  const status = String(user?.kyc_status || '').toLowerCase();
                  const isVerified = user?.is_kyc_verified || ['verified', 'approved'].includes(status);

                  if (isVerified) {
                    return (
                      <View 
                        className="flex-row items-center gap-1 px-3 py-1.5 rounded-full border"
                        style={{
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          borderColor: 'rgba(16, 185, 129, 0.2)',
                          borderWidth: 1,
                        }}
                      >
                        <CheckCircle2 size={12} color="#10b981" />
                        <Text className="text-[#10b981] text-[10px] uppercase font-bold tracking-widest">Verified</Text>
                      </View>
                    );
                  }
                  if (['pending', 'submitted', 'in_review'].includes(status)) {
                    return (
                      <View 
                        className="flex-row items-center gap-1 px-3 py-1.5 rounded-full border"
                        style={{
                          backgroundColor: 'rgba(245, 158, 11, 0.1)',
                          borderColor: 'rgba(245, 158, 11, 0.2)',
                          borderWidth: 1,
                        }}
                      >
                        <Clock size={12} color="#f59e0b" />
                        <Text className="text-amber-600 text-[10px] uppercase font-bold tracking-widest">In Review</Text>
                      </View>
                    );
                  }
                  if (['rejected', 'failed', 'info_requested'].includes(status)) {
                    return (
                      <View 
                        className="flex-row items-center gap-1 px-3 py-1.5 rounded-full border"
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          borderColor: 'rgba(239, 68, 68, 0.2)',
                          borderWidth: 1,
                        }}
                      >
                        <XCircle size={12} color="#ef4444" />
                        <Text className="text-red-500 text-[10px] uppercase font-bold tracking-widest">{status === 'info_requested' ? 'Update Needed' : 'Rejected'}</Text>
                      </View>
                    );
                  }
                  return (
                    <View className="flex-row items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                      <Shield size={12} color="#64748b" />
                      <Text className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Unverified</Text>
                    </View>
                  );
                })()}
              </TouchableOpacity>
            </View>
          </View>
          
          <View className="flex-row gap-3 mt-6">
            <TouchableOpacity
              className="flex-1 bg-primary py-3.5 rounded-2xl items-center justify-center"
              style={{
                shadowColor: '#6366F1',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 1,
              }}
              onPress={() => navigation.navigate('Portfolio')}
            >
              <Text className="text-white text-sm font-semibold tracking-wide">Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-white border border-slate-200 py-3.5 rounded-2xl items-center justify-center"
              onPress={() => navigation.navigate('Portfolio')}
            >
              <Text className="text-slate-600 text-sm font-semibold tracking-wide">View Portfolio</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Premium Stats Bento Grid */}
        <View className="flex-row gap-3 mb-8">
          {[
            { label: 'Applied', value: stats.applied, icon: Send, color: '#0ea5e9', bg: '#f0f9ff' },
            { label: 'Interviews', value: stats.interviews, icon: MessageSquare, color: '#8b5cf6', bg: '#f5f3ff' },
            { label: 'Shortlisted', value: stats.shortlisted, icon: CheckCircle2, color: '#f43f5e', bg: '#fff1f2' },
          ].map((stat, idx) => (
            <View 
              key={idx} 
              className="flex-1 bg-white rounded-3xl p-5 border border-slate-100 items-center"
              style={{
                shadowColor: '#94A3B8',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
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

        {/* Recommended Jobs Header */}
        <View className="flex-row justify-between items-end mb-4 px-1">
          <Text className="text-xl text-slate-800 font-bold">Recommended Jobs</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Jobs')} 
            className="px-4 py-1.5 rounded-full"
            style={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }}
          >
            <Text className="text-xs text-primary font-bold uppercase tracking-wider">View All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8 -mx-5 px-5">
          {recommendedJobs.map((job, idx) => {
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
                className="w-72 bg-white rounded-[24px] p-5 mr-4 border border-slate-100"
                style={{
                  shadowColor: '#94A3B8',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
                onPress={() => navigation.navigate('JobDetail', { jobId: job.id, jobData: job })}
              >
                <View className="flex-row justify-between items-start mb-4">
                  <View className={`w-12 h-12 rounded-2xl items-center justify-center ${accent.bg} border ${accent.borderColor}`}>
                    <Briefcase size={20} color={accent.iconColor} />
                  </View>
                  <View className="flex-row items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                    <CheckCircle2 size={10} color="#10b981" />
                    <Text className="text-emerald-600 text-[8px] uppercase font-bold tracking-widest">Verified NGO</Text>
                  </View>
                </View>

                <Text className="text-lg text-slate-800 font-bold mb-1" numberOfLines={1}>
                  {job.title}
                </Text>
                <Text className="text-sm text-slate-500 font-medium mb-4">
                  {job.ngo_name || 'Organization'}
                </Text>

                <View className="flex-row gap-2 mb-6 flex-wrap">
                  <View className="flex-row items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                    <MapPin size={12} color="#64748b" />
                    <Text className="text-xs text-slate-600 font-medium">{job.location || 'Nepal'}</Text>
                  </View>
                  <View className="flex-row items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                    <Clock size={12} color="#64748b" />
                    <Text className="text-xs text-slate-600 font-medium capitalize">
                      {(job.employment_type || 'full_time').replace('_', ' ')}
                    </Text>
                  </View>
                </View>

                <View className={`py-3 rounded-xl items-center border ${job.has_applied ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                  <Text className={`${job.has_applied ? 'text-emerald-600' : 'text-slate-600'} text-sm font-semibold tracking-wide`}>
                    {job.has_applied ? 'Application Submitted' : 'Apply Now'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
          {recommendedJobs.length === 0 && (
            <View className="w-72 bg-white rounded-[24px] p-8 border border-dashed border-slate-300 items-center justify-center">
              <Briefcase size={32} color="#cbd5e1" />
              <Text className="text-slate-400 text-sm mt-3 text-center font-medium">
                No jobs available right now. Check back soon!
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Recent Applications Header */}
        <View className="flex-row justify-between items-end mb-4 px-1">
          <Text className="text-xl text-slate-800 font-bold">Recent Applications</Text>
        </View>

        <View 
          className="bg-white rounded-[24px] border border-slate-100 overflow-hidden mb-8"
          style={{
            shadowColor: '#94A3B8',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          {recentApplications.map((app, idx) => {
            const st = getStatusStyle(app.status);
            // Replace generic status colors with more modern equivalents
            const modernStatusBg = app.status === 'pending' ? 'bg-amber-50 border-amber-100' : 
                                  app.status === 'shortlisted' ? 'bg-blue-50 border-blue-100' : 
                                  ['interview', 'accepted'].includes(app.status) ? 'bg-emerald-50 border-emerald-100' : 
                                  'bg-red-50 border-red-100';
            const modernStatusText = app.status === 'pending' ? 'text-amber-600' : 
                                    app.status === 'shortlisted' ? 'text-blue-600' : 
                                    ['interview', 'accepted'].includes(app.status) ? 'text-emerald-600' : 
                                    'text-red-600';

            return (
              <View
                key={app.id}
                className={`flex-row items-center px-5 py-4 ${idx !== recentApplications.length - 1 ? 'border-b border-slate-50' : ''}`}
              >
                <View className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 items-center justify-center mr-4">
                  <FileText size={20} color="#64748b" />
                </View>
                <View className="flex-1 pr-3">
                  <Text className="text-base text-slate-800 font-semibold mb-0.5" numberOfLines={1}>
                    {app.job_title || 'Job Application'}
                  </Text>
                  <Text className="text-xs text-slate-500 font-medium">
                    {app.ngo_name || 'NGO'} • {new Date(app.created_at || Date.now()).toLocaleDateString()}
                  </Text>
                </View>
                <View className={`px-3 py-1.5 rounded-full border ${modernStatusBg}`}>
                  <Text className={`text-[9px] uppercase font-bold tracking-widest ${modernStatusText}`}>
                    {st.label}
                  </Text>
                </View>
              </View>
            );
          })}
          {recentApplications.length === 0 && (
            <View className="p-8 items-center">
              <FileText size={32} color="#cbd5e1" />
              <Text className="text-slate-400 text-sm mt-3 text-center font-medium">
                No applications yet. Start exploring opportunities!
              </Text>
            </View>
          )}
        </View>

        {/* Premium Banner */}
        <View 
          className="bg-secondary rounded-[24px] overflow-hidden mb-12"
          style={{
            shadowColor: '#0F172A',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 15,
            elevation: 5,
          }}
        >
          <View className="p-6 relative">
            <View 
              className="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-2xl"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            />
            <Text className="text-white text-xl font-bold mb-2">
              Empowering Professionals
            </Text>
            <Text 
              className="text-white text-sm leading-6"
              style={{ color: 'rgba(255, 255, 255, 0.8)' }}
            >
              Making a difference in Nepal's healthcare landscape, one connection at a time.
            </Text>
          </View>
        </View>
      </View>
    </Screen>
  );
};

export default ProfessionalDashboardScreen;
