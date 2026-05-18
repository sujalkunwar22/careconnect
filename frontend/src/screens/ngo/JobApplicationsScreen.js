import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../../components/common/Screen';
import { 
  User, 
  MapPin, 
  ChevronRight, 
  Filter, 
  Search,
  Briefcase,
  CheckCircle,
  Clock
} from 'lucide-react-native';
import JobsService from '../../services/jobsService';

const JobApplicationsScreen = ({ navigation }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('All');

  const statuses = ['All', 'Pending', 'Shortlisted', 'Interview', 'Hired', 'Rejected'];

  const fetchApplications = async () => {
    setLoading(true);
    try {
      // In real app, we fetch applicants for the current NGO's jobs
      const data = await JobsService.getNgoApplications(); 
      setApplications(data);
    } catch (error) {
      console.error(error);
      // Mock if needed
      setApplications([
        {
          id: 1,
          applicant_name: 'Aarati Sharma',
          job_title: 'Community Outreach Coordinator',
          status: 'Pending',
          location: 'Kathmandu',
          verified: true,
          applied_at: '2 days ago'
        },
        {
          id: 2,
          applicant_name: 'Bikash Thapa',
          job_title: 'Senior Project Manager',
          status: 'Interview',
          location: 'Pokhara',
          verified: true,
          applied_at: '1 week ago'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchApplications();
    }, [])
  );

  const filteredApps = activeStatus === 'All' 
    ? applications 
    : applications.filter(app => app.status?.toLowerCase() === activeStatus.toLowerCase());

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'shortlisted': return 'bg-cyan-100 text-cyan-700';
      case 'interview': return 'bg-blue-100 text-blue-700';
      case 'hired': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <Screen scrollable className="bg-background">
      <View className="px-6 pt-6 pb-4">
        <Text className="text-2xl font-poppins-700 text-text-primary mb-1">Applicants</Text>
        <Text className="text-text-secondary font-poppins-400 text-xs mb-6">Review candidates for your postings</Text>

        {/* Status Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-6">
          {statuses.map((status) => (
            <TouchableOpacity
              key={status}
              onPress={() => setActiveStatus(status)}
              className={`mr-3 px-5 py-2.5 rounded-full ${activeStatus === status ? 'bg-secondary' : 'bg-white border border-border'}`}
            >
              <Text className={`font-poppins-600 text-xs ${activeStatus === status ? 'text-white' : 'text-text-secondary'}`}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

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
                onPress={() => navigation.navigate('ApplicationReview', { applicationId: app.id, applicationData: app })}
              >
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-row flex-1">
                    <View className="w-12 h-12 bg-secondary/10 rounded-2xl items-center justify-center mr-4">
                      <User size={24} color="#0F172A" />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Text className="text-base font-poppins-700 text-text-primary mr-2">{app.applicant_name}</Text>
                        {app.verified && <CheckCircle size={12} color="#2D6A4F" />}
                      </View>
                      <Text className="text-text-secondary font-poppins-500 text-[10px] mt-1" numberOfLines={1}>
                        {app.job_title}
                      </Text>
                    </View>
                  </View>
                  <View className={`px-2 py-1 rounded-lg ${getStatusColor(app.status)}`}>
                    <Text className="font-poppins-600 text-[9px] uppercase">{app.status}</Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between mt-auto pt-3 border-t border-slate-50">
                  <View className="flex-row items-center">
                    <MapPin size={12} color="#94A3B8" />
                    <Text className="text-text-secondary font-poppins-400 text-[10px] ml-1">{app.location}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Clock size={12} color="#94A3B8" />
                    <Text className="text-text-secondary font-poppins-400 text-[10px] ml-1">Applied {app.applied_at}</Text>
                  </View>
                  <ChevronRight size={16} color="#CBD5E1" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View className="py-20 items-center justify-center">
            <Text className="text-text-secondary font-poppins-500 text-sm">No applications found.</Text>
          </View>
        )}
      </View>
    </Screen>
  );
};

export default JobApplicationsScreen;
