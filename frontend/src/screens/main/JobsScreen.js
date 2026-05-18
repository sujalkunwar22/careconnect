import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ScrollView, RefreshControl, Platform } from 'react-native';
import Screen from '../../components/common/Screen';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Skeleton from '../../components/common/Skeleton';
import JobsService from '../../services/jobsService';
import useAuthStore from '../../stores/authStore';
import {
  Search,
  SlidersHorizontal,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  FileText,
  Heart,
  Baby,
  Activity,
  Home as HomeIcon,
  ChevronRight,
  ArrowLeft,
  Building2
} from 'lucide-react-native';

const jobCategories = [
  { id: 'All', label: 'All', icon: Briefcase, color: '#0F172A' },
  { id: 'Elderly', label: 'Elderly', icon: Heart, color: '#6366F1' },
  { id: 'Child', label: 'Childcare', icon: Baby, color: '#F4D03F' },
  { id: 'Disability', label: 'Disability', icon: Activity, color: '#3B82F6' },
  { id: 'Household', label: 'Household', icon: HomeIcon, color: '#10B981' },
];

const JobsScreen = ({ navigation }) => {
  const { isAuthenticated } = useAuthStore();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchJobs = async () => {
    try {
      const data = await JobsService.getJobs();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchJobs();
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      if (job.is_active === false) return false;
      const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.ngo_name || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || job.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [jobs, searchQuery, activeCategory]);

  const JobCard = ({ item }) => {
    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => navigation.navigate('JobDetail', { jobId: item.id, jobData: item })}
        className="bg-white rounded-[24px] p-5 mb-4 border border-slate-100"
        style={{
          shadowColor: '#0f172a',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}
        activeOpacity={0.7}
      >
        <View className="flex-row items-start">
          {/* NGO Avatar */}
          <View className="w-14 h-14 bg-primary/10 rounded-2xl items-center justify-center mr-4">
            <Building2 size={24} color="#6366F1" />
          </View>

          <View className="flex-1">
            <Text className="text-base font-bold text-slate-800 mb-1" numberOfLines={1}>{item.title}</Text>
            <Text className="text-sm font-medium text-primary mb-3">{item.ngo_name || 'Organization'}</Text>

            {/* Meta Tags */}
            <View className="flex-row flex-wrap gap-2">
              <View className="flex-row items-center bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                <MapPin size={12} color="#64748B" />
                <Text className="text-[11px] text-slate-500 font-medium ml-1" numberOfLines={1}>{item.location || 'Nepal'}</Text>
              </View>
              <View className="flex-row items-center bg-[#10b981]/10 px-2.5 py-1 rounded-lg border border-[#10b981]/20">
                <DollarSign size={12} color="#10b981" />
                <Text className="text-[11px] text-[#10b981] font-bold ml-1" numberOfLines={1}>
                  {item.salary_min ? `Rs. ${item.salary_min}` : 'Volunteer'}
                </Text>
              </View>
              <View className="flex-row items-center bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                <Clock size={12} color="#64748B" />
                <Text className="text-[11px] text-slate-500 font-medium ml-1 capitalize" numberOfLines={1}>
                  {(item.employment_type || 'full_time').replace('_', ' ')}
                </Text>
              </View>
            </View>
          </View>

          {/* Chevron */}
          <View className="justify-center ml-2">
            <View className="w-8 h-8 bg-slate-50 rounded-full items-center justify-center border border-slate-100">
              <ChevronRight size={16} color="#94a3b8" />
            </View>
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
            className="w-10 h-10 items-center justify-center rounded-full mr-3"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              borderWidth: 1,
            }}
          >
            <ArrowLeft size={22} color="#ffffff" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl text-white font-bold">
              Opportunities
            </Text>
            <Text className="text-white/70 text-xs font-medium">Discover care jobs near you</Text>
          </View>
          {isAuthenticated && (
            <TouchableOpacity
              className="w-12 h-12 rounded-2xl items-center justify-center"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                borderWidth: 1,
              }}
              onPress={() => navigation.navigate('MyApplications')}
            >
              <FileText size={22} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="px-5 -mt-8">
        {/* Floating Search Bar */}
        <View className="flex-row items-center bg-white rounded-2xl px-4 py-3.5 shadow-md shadow-slate-200/50 border border-slate-100 mb-5">
          <Search size={20} color="#94a3b8" />
          <TextInput
            placeholder="Search by job title or NGO..."
            className="flex-1 ml-3 font-medium text-sm text-slate-800"
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          
                    style={[{ borderWidth: 0, backgroundColor: 'transparent' }, Platform.OS === 'web' && { outlineStyle: 'none' }]}
                    />
          <TouchableOpacity className="ml-2 p-2 rounded-xl" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
            <SlidersHorizontal size={16} color="#6366F1" />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
          {jobCategories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setActiveCategory(cat.id)}
                className="flex-row items-center px-5 py-2.5 rounded-2xl mr-3 border"
                style={isSelected ? {
                  backgroundColor: '#6366F1', // primary
                  borderColor: '#6366F1',
                  shadowColor: '#6366F1',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  elevation: 4,
                } : {
                  backgroundColor: '#ffffff',
                  borderColor: '#f1f5f9', // slate-100
                }}
              >
                <Icon size={16} color={isSelected ? 'white' : cat.color} />
                <Text className={`font-bold text-xs ml-2 ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Results Count */}
        {!isLoading && (
          <Text className="text-slate-400 text-xs font-medium mb-4 uppercase tracking-wider">
            {filteredJobs.length} {filteredJobs.length === 1 ? 'opportunity' : 'opportunities'} found
          </Text>
        )}
      </View>

      {/* Job Listings */}
      <View className="px-5 flex-1">
        {isLoading ? (
          <View>
            {[1, 2, 3].map(i => <Skeleton key={i} width="100%" height={130} className="mb-4 rounded-3xl" />)}
          </View>
        ) : (
          <FlatList
            data={filteredJobs}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <JobCard item={item} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 80 }}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#6366F1" />}
            ListEmptyComponent={() => (
              <EmptyState
                title="No opportunities found"
                message="We couldn't find any jobs matching your criteria. Try adjusting your filters."
                icon={Briefcase}
                actionLabel="View All Jobs"
                onAction={() => {
                  setActiveCategory('All');
                  setSearchQuery('');
                }}
              />
            )}
          />
        )}
      </View>
    </Screen>
  );
};

export default JobsScreen;
