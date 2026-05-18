import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Image, Platform } from 'react-native';
import Screen from '../../components/common/Screen';
import { 
  Search, 
  MapPin, 
  Clock, 
  ChevronRight,
  Briefcase,
  SlidersHorizontal,
  Bookmark,
  ArrowLeft,
  DollarSign,
  Building2
} from 'lucide-react-native';
import JobsService from '../../services/jobsService';

const JobListingsScreen = ({ navigation }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Healthcare', 'Education', 'Engineering', 'Social Work'];

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await JobsService.getJobs();
      setJobs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = (job.title + job.ngo_name).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || job.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Screen scrollable className="bg-[#FAFAFA]" style={{ paddingHorizontal: 0 }}>
      {/* Premium Header */}
      <View className="bg-primary px-6 pt-6 pb-20 rounded-b-[40px] shadow-lg shadow-primary/20">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 items-center justify-center rounded-full mr-3"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              borderWidth: 1,
            }}
          >
            <ArrowLeft size={20} color="#ffffff" />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl text-white font-bold">Find Opportunities</Text>
            <Text className="text-white/70 text-xs font-medium">Connect with NGOs across Nepal</Text>
          </View>
        </View>
      </View>

      <View className="px-5 -mt-8">
        {/* Floating Search Bar */}
        <View className="flex-row items-center bg-white rounded-2xl px-4 py-3.5 border border-slate-100 shadow-md shadow-slate-200/50 mb-5">
          <Search size={20} color="#94a3b8" />
          <TextInput
            className="flex-1 ml-3 font-medium text-sm text-slate-800"
            placeholder="Search roles or organizations..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          
                    style={[{ borderWidth: 0, backgroundColor: 'transparent' }, Platform.OS === 'web' && { outlineStyle: 'none' }]}
                    />
          <TouchableOpacity className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
            <SlidersHorizontal size={16} color="#6366F1" />
          </TouchableOpacity>
        </View>

        {/* Category Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-6">
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              className="mr-3 px-5 py-2.5 rounded-2xl border"
              style={activeCategory === cat ? {
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
              <Text className={`font-bold text-xs ${activeCategory === cat ? 'text-white' : 'text-slate-600'}`}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Job Listings */}
        {loading ? (
          <View className="py-20">
            <ActivityIndicator size="large" color="#6366F1" />
          </View>
        ) : filteredJobs.length > 0 ? (
          <View className="pb-10 gap-4">
            {filteredJobs.map((job) => (
              <TouchableOpacity 
                key={job.id}
                className="bg-white rounded-[24px] p-5 border border-slate-100"
                style={{
                  shadowColor: '#0f172a',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                onPress={() => navigation.navigate('JobDetail', { jobId: job.id, jobData: job })}
                activeOpacity={0.7}
              >
                <View className="flex-row items-start">
                  <View className="w-12 h-12 bg-primary/10 rounded-2xl items-center justify-center mr-4">
                    {job.ngo_logo ? (
                      <Image source={{ uri: job.ngo_logo }} className="w-full h-full rounded-2xl" />
                    ) : (
                      <Building2 size={22} color="#6366F1" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-slate-800 mb-0.5" numberOfLines={1}>
                      {job.title}
                    </Text>
                    <Text className="text-primary font-bold text-sm mb-3" numberOfLines={1}>
                      {job.ngo_name}
                    </Text>

                    <View className="flex-row flex-wrap gap-2">
                      <View className="flex-row items-center bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                        <MapPin size={11} color="#64748B" />
                        <Text className="text-[10px] text-slate-500 font-medium ml-1">{job.location}</Text>
                      </View>
                      <View className="flex-row items-center bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                        <Clock size={11} color="#64748B" />
                        <Text className="text-[10px] text-slate-500 font-medium ml-1">{job.type} • {job.posted_at || 'Recently'}</Text>
                      </View>
                    </View>
                  </View>
                  <View className="justify-center ml-2">
                    <View className="w-8 h-8 bg-slate-50 rounded-full items-center justify-center border border-slate-100">
                      <ChevronRight size={16} color="#94a3b8" />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View className="py-20 items-center justify-center">
            <View className="w-16 h-16 bg-slate-100 rounded-full items-center justify-center mb-4">
              <Briefcase size={28} color="#cbd5e1" />
            </View>
            <Text className="text-slate-600 font-bold text-sm">No jobs found</Text>
            <Text className="text-slate-400 font-medium text-xs text-center mt-1 px-10">No jobs found matching your criteria.</Text>
          </View>
        )}
      </View>
    </Screen>
  );
};

export default JobListingsScreen;
