import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, TextInput, Platform } from 'react-native';
import Screen from '../../components/common/Screen';
import { 
  User, 
  Search, 
  Filter, 
  ChevronRight, 
  Briefcase, 
  MapPin, 
  Calendar,
  Building
} from 'lucide-react-native';
import AdminService from '../../services/adminService';

const ApplicantsListScreen = ({ navigation }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      // Fetch applications across all jobs (Admin view)
      const data = await AdminService.getJobs(); // Simplified
      // For now using mock
      setApplications([
        { id: 1, name: 'Aarati Sharma', job: 'Community Outreach Coordinator', ngo: 'Save The Children', status: 'Pending', date: '2 days ago' },
        { id: 2, name: 'Bikash Thapa', job: 'Senior Project Manager', ngo: 'Red Cross Nepal', status: 'Interview', date: '1 week ago' },
        { id: 3, name: 'Puja Gurung', job: 'Data Entry Specialist', ngo: 'UNICEF Nepal', status: 'Hired', date: 'Oct 15' }
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApps = applications.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    app.job.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Screen scrollable className="bg-background">
      <View className="px-6 pt-6 pb-4">
        <Text className="text-2xl font-poppins-700 text-text-primary mb-1">Global Applicants</Text>
        <Text className="text-text-secondary font-poppins-400 text-xs mb-8">Monitoring hiring activity across the platform</Text>

        {/* Search */}
        <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 border border-border/50 shadow-sm mb-8">
          <Search size={20} color="#94A3B8" />
          <TextInput
            className="flex-1 ml-3 font-poppins-400 text-sm text-text-primary"
            placeholder="Search applicants or jobs..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          
                    style={Platform.OS === 'web' ? { outlineStyle: 'none', borderWidth: 0, backgroundColor: 'transparent' } : {}}
                    />
        </View>

        {loading ? (
          <View className="py-20">
            <ActivityIndicator size="large" color="#6366F1" />
          </View>
        ) : filteredApps.length > 0 ? (
          <View className="space-y-4 pb-10">
            {filteredApps.map((app) => (
              <TouchableOpacity 
                key={app.id}
                className="bg-white rounded-3xl p-5 shadow-sm border border-border/30"
                onPress={() => navigation.navigate('ApplicantProfile', { applicantId: app.id, applicantData: app })}
              >
                <View className="flex-row items-start">
                  <View className="w-12 h-12 bg-slate-100 rounded-2xl items-center justify-center mr-4">
                    <User size={24} color="#0F172A" />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row justify-between items-start">
                      <Text className="text-base font-poppins-700 text-text-primary">{app.name}</Text>
                      <View className="bg-slate-50 px-2 py-1 rounded-lg">
                        <Text className="font-poppins-600 text-[8px] uppercase text-text-secondary">{app.status}</Text>
                      </View>
                    </View>
                    
                    <View className="flex-row items-center mt-2">
                      <Briefcase size={12} color="#94A3B8" />
                      <Text className="text-text-secondary font-poppins-500 text-[10px] ml-1 flex-1" numberOfLines={1}>
                        {app.job}
                      </Text>
                    </View>

                    <View className="flex-row items-center mt-1">
                      <Building size={12} color="#94A3B8" />
                      <Text className="text-text-secondary font-poppins-400 text-[10px] ml-1">{app.ngo}</Text>
                    </View>
                    
                    <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-slate-50">
                      <View className="flex-row items-center">
                        <Calendar size={12} color="#94A3B8" />
                        <Text className="text-text-secondary font-poppins-400 text-[9px] ml-1">Applied {app.date}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <Text className="text-primary font-poppins-600 text-[10px] mr-1">View Details</Text>
                        <ChevronRight size={14} color="#6366F1" />
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View className="py-20 items-center justify-center">
            <Text className="text-text-secondary font-poppins-500 text-sm">No applicants found.</Text>
          </View>
        )}
      </View>
    </Screen>
  );
};

export default ApplicantsListScreen;
