import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import Screen from '../../components/common/Screen';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Building2,
  Briefcase
} from 'lucide-react-native';

import JobsService from '../../services/jobsService';

const MyApplicationsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchApps = async () => {
      try {
        const data = await JobsService.getMyApplications();
        if (data && Array.isArray(data)) {
          setApplications(data);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const filteredApplications = useMemo(() => {
    if (activeTab === 'All') return applications;
    return applications.filter(app => app.status === activeTab);
  }, [activeTab, applications]);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Accepted': return { color: '#10b981', bgColor: 'bg-[#10b981]/10', icon: CheckCircle2, variant: 'success' };
      case 'Reviewed': return { color: '#3b82f6', bgColor: 'bg-[#3b82f6]/10', icon: FileText, variant: 'info' };
      case 'Pending': return { color: '#f59e0b', bgColor: 'bg-[#f59e0b]/10', icon: Clock, variant: 'warning' };
      case 'Rejected': return { color: '#ef4444', bgColor: 'bg-[#ef4444]/10', icon: XCircle, variant: 'error' };
      default: return { color: '#64748B', bgColor: 'bg-slate-100', icon: AlertCircle, variant: 'neutral' };
    }
  };

  const ApplicationCard = ({ item }) => {
    const displayTitle = item.job_title || item.title;
    const displayNgo = item.ngo_name || item.ngo;
    const displayDate = item.created_at ? new Date(item.created_at).toLocaleDateString() : item.dateApplied;
    const displayType = item.category || item.type || 'Job';

    const config = getStatusConfig(item.status);
    const StatusIcon = config.icon;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.navigate('JobDetail', { jobId: item.job || item.id })}
        className="bg-white rounded-[24px] p-5 mb-4 border border-slate-100 shadow-sm"
      >
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1 pr-3">
            <Text className="text-base font-bold text-slate-800 mb-1.5" numberOfLines={1}>{displayTitle}</Text>
            <View className="flex-row items-center mb-2">
              <Building2 size={12} color="#6366F1" />
              <Text className="text-sm font-bold text-primary ml-1.5">{displayNgo}</Text>
            </View>
            <View className="flex-row items-center">
              <View className="flex-row items-center bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                <Calendar size={11} color="#94a3b8" />
                <Text className="text-[10px] text-slate-400 font-medium ml-1">Applied {displayDate}</Text>
              </View>
            </View>
          </View>

          {/* Status Badge */}
          <View className={`px-3 py-1.5 rounded-xl flex-row items-center ${config.bgColor}`}>
            <StatusIcon size={12} color={config.color} />
            <Text className="font-bold text-[11px] ml-1" style={{ color: config.color }}>{item.status}</Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center pt-3.5 border-t border-slate-100">
          <View className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{displayType}</Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-xs font-bold text-slate-600 mr-1">View Details</Text>
            <ChevronRight size={14} color="#64748B" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Screen className="bg-[#FAFAFA]" style={{ paddingHorizontal: 0 }}>
      {/* Premium Header */}
      <View className="bg-primary px-6 pt-6 pb-20 rounded-b-[40px] shadow-lg shadow-primary/20">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 items-center justify-center bg-white/20 rounded-full border border-white/30 mr-3"
          >
            <ArrowLeft size={20} color="#ffffff" />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl text-white font-bold">
              My Applications
            </Text>
            <Text className="text-white/70 text-xs font-medium">Track your job applications</Text>
          </View>
        </View>
      </View>

      <View className="px-5 -mt-8">
        {/* Floating Tabs */}
        <View className="flex-row bg-white p-1.5 rounded-2xl border border-slate-100 shadow-md shadow-slate-200/50 mb-6">
          {['All', 'Pending', 'Accepted'].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-xl items-center ${activeTab === tab ? 'bg-primary shadow-sm' : ''}`}
            >
              <Text className={`text-xs font-bold ${activeTab === tab ? 'text-white' : 'text-slate-400'}`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Count */}
        {!loading && (
          <Text className="text-slate-400 text-xs font-medium mb-4 uppercase tracking-wider">
            {filteredApplications.length} {filteredApplications.length === 1 ? 'application' : 'applications'}
          </Text>
        )}
      </View>

      <View className="px-5 flex-1">
        <FlatList
          data={filteredApplications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ApplicationCard item={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
          ListEmptyComponent={() => (
            <EmptyState
              title={`No ${activeTab.toLowerCase()} applications`}
              message="You haven't applied to any jobs that are currently in this status."
              icon={FileText}
              actionLabel="Browse All Jobs"
              onAction={() => navigation.navigate('Jobs')}
            />
          )}
        />
      </View>
    </Screen>
  );
};

export default MyApplicationsScreen;
