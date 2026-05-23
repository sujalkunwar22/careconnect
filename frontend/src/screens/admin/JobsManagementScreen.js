import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, TextInput, ActivityIndicator, Alert, RefreshControl, Platform } from 'react-native';
import { Search, Briefcase, Trash2, Power, Eye, Filter, ChevronRight, AlertCircle, ArrowLeft, Edit } from 'lucide-react-native';
import AdminService from '../../services/adminService';
import Screen from '../../components/common/Screen';

const JobsManagementScreen = ({ navigation }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive

  const normalizeJob = (job) => ({
    ...job,
    is_active: ['open', 'Active'].includes(job.status),
  });

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getJobs();
      setJobs(Array.isArray(data) ? data.map(normalizeJob) : []);
    } catch (error) {
      console.error('Error fetching admin jobs:', error);
      Alert.alert('Error', 'Failed to fetch job listings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobs();
  };

  const handleToggleStatus = async (jobId) => {
    try {
      const result = await AdminService.toggleJob(jobId);
      setJobs(jobs.map(job => 
        job.id === jobId ? normalizeJob({ ...job, status: result.status }) : job
      ));
    } catch (error) {
      Alert.alert('Error', 'Failed to update job status');
    }
  };

  const handleDeleteJob = (jobId) => {
    Alert.alert(
      'Delete Job',
      'Are you sure you want to permanently delete this job listing? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AdminService.deleteJob(jobId);
              setJobs(jobs.filter(job => job.id !== jobId));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete job');
            }
          }
        }
      ]
    );
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = (job.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (job.company_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === 'active') return matchesSearch && job.is_active;
    if (filterStatus === 'inactive') return matchesSearch && !job.is_active && job.status !== 'closed';
    if (filterStatus === 'finished') return matchesSearch && job.status === 'closed';
    return matchesSearch;
  });

  const renderJobCard = (job) => (
    <View key={job.id} className="bg-white rounded-xl p-4 mb-4 border border-slate-100 shadow-sm">
      <View className="flex-row justify-between items-start">
        <View className="flex-1 pr-4">
          <Text className="text-lg font-bold text-slate-900" style={{ fontFamily: 'Poppins_600SemiBold' }}>
            {job.title}
          </Text>
          <Text className="text-slate-500 font-medium mb-2" style={{ fontFamily: 'Inter_500Medium' }}>
            {job.company_name || 'Care Connect NGO'}
          </Text>
          <View className="flex-row items-center gap-2 mb-3">
            <View className={`px-2 py-0.5 rounded-full ${
              job.status === 'closed' ? 'bg-amber-100' : (job.is_active ? 'bg-green-100' : 'bg-slate-100')
            }`}>
              <Text className={`text-[10px] font-bold ${
                job.status === 'closed' ? 'text-amber-700' : (job.is_active ? 'text-green-700' : 'text-slate-600')
              }`}>
                {job.status === 'closed' ? 'FINISHED' : (job.is_active ? 'ACTIVE' : 'INACTIVE')}
              </Text>
            </View>
            <Text className="text-[12px] text-slate-400">• {job.application_count || 0} applicants</Text>
          </View>
        </View>
        
        <View className="flex-row gap-2">
          <TouchableOpacity 
            onPress={() => navigation.navigate('JobDetail', { jobId: job.id, adminMode: true })}
            className="p-2 bg-slate-50 rounded-lg"
          >
            <Eye size={18} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleToggleStatus(job.id)}
            className={`p-2 rounded-lg ${job.is_active ? 'bg-amber-50' : 'bg-blue-50'}`}
          >
            <Power size={18} color={job.is_active ? '#D97706' : '#2563EB'} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleDeleteJob(job.id)}
            className="p-2 bg-red-50 rounded-lg"
          >
            <Trash2 size={18} color="#6366F1" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View className="flex-row justify-between items-center pt-3 border-t border-slate-50">
        <View className="flex-row items-center gap-1">
          <Text className="text-[12px] text-slate-500">Posted on: {new Date(job.created_at).toLocaleDateString()}</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity 
            className="flex-row items-center px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100"
            onPress={() => navigation.navigate('PostJob', { jobToEdit: job })}
          >
            <Text className="text-[11px] text-blue-700 font-bold mr-1">Edit listing</Text>
            <Edit size={12} color="#1D4ED8" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`flex-row items-center px-3 py-1.5 rounded-lg border ${job.is_active ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}
            onPress={() => handleToggleStatus(job.id)}
          >
            <Power size={12} color={job.is_active ? '#B91C1C' : '#15803D'} />
            <Text className={`text-[11px] font-bold ml-1.5 ${job.is_active ? 'text-red-700' : 'text-green-700'}`}>
              {job.is_active ? 'End Listing' : 'Reactivate'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <Screen safe scrollHeader={false} className="bg-[#F8F9FA]">
      <View className="px-6 pt-4 pb-2">
        <View className="flex-row items-center mb-2">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="w-10 h-10 items-center justify-center bg-white rounded-full shadow-sm mr-3"
          >
            <ArrowLeft size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text className="text-[28px] font-bold text-slate-900" style={{ fontFamily: 'Poppins_700Bold' }}>
            Job Management
          </Text>
        </View>
        <Text className="text-slate-500 mb-6" style={{ fontFamily: 'Inter_400Regular' }}>
          Monitor and manage all job listings across the platform.
        </Text>

        <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 py-3 mb-6 shadow-sm">
          <Search size={20} color="#94A3B8" />
          <TextInput
            placeholder="Search by title or NGO..."
            className="flex-1 ml-3 text-slate-900"
            style={[{ fontFamily: 'Inter_400Regular' }, Platform.OS === 'web' && { outlineStyle: 'none', borderWidth: 0, backgroundColor: 'transparent' }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View className="flex-row gap-2 mb-6">
          {['all', 'active', 'inactive', 'finished'].map((status) => (
            <TouchableOpacity
              key={status}
              onPress={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full border ${
                filterStatus === status 
                  ? 'bg-[#0F172A] border-[#0F172A]' 
                  : 'bg-white border-slate-200'
              }`}
            >
              <Text className={`text-xs font-bold capitalize ${
                filterStatus === status ? 'text-white' : 'text-slate-500'
              }`}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366F1']} />
        }
      >
        {loading && !refreshing ? (
          <View className="py-20 items-center">
            <ActivityIndicator size="large" color="#6366F1" />
            <Text className="text-slate-400 mt-4">Loading job records...</Text>
          </View>
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map(renderJobCard)
        ) : (
          <View className="py-20 items-center bg-white rounded-2xl border border-dashed border-slate-300">
            <Briefcase size={48} color="#CBD5E1" />
            <Text className="text-slate-500 mt-4 font-bold text-lg">No Jobs Found</Text>
            <Text className="text-slate-400 text-center px-10">
              Try adjusting your search or filter to find listings.
            </Text>
          </View>
        )}
        <View className="h-20" />
      </ScrollView>
    </Screen>
  );
};

export default JobsManagementScreen;
