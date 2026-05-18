import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, RefreshControl, Platform } from 'react-native';
import Screen from '../../components/common/Screen';
import { useFocusEffect } from '@react-navigation/native';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Clock,
  User,
  ArrowLeft
} from 'lucide-react-native';
import AdminService from '../../services/adminService';

const KycRequestsScreen = ({ navigation }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, verified, rejected

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getPendingKYCs();
      
      // Filter for pending status to prevent processed items from appearing
      const pendingItems = data.filter(item => 
        item.status === 'pending' || item.status === 'submitted' || !item.status
      );
      
      setRequests(pendingItems);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const filteredRequests = requests.filter(req => {
    const userObj = req.user || {};
    const name = req.ngo_name 
      || req.user_name
      || req.user_email
      || userObj.full_name 
      || `${userObj.first_name || ''} ${userObj.last_name || ''}`.trim()
      || req.full_name
      || `${req.first_name || ''} ${req.last_name || ''}`.trim()
      || userObj.username
      || 'Anonymous';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'verified': return { bg: 'bg-green-50', text: 'text-green-700', icon: <CheckCircle size={12} color="#15803d" /> };
      case 'rejected': return { bg: 'bg-red-50', text: 'text-red-700', icon: <XCircle size={12} color="#b91c1c" /> };
      default: return { bg: 'bg-amber-50', text: 'text-amber-700', icon: <Clock size={12} color="#b45309" /> };
    }
  };

  return (
    <Screen 
      scrollable 
      className="bg-background"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366F1']} />
      }
    >
      <View className="px-6 pt-6 pb-4">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="w-8 h-8 items-center justify-center bg-white rounded-full shadow-sm mr-3"
          >
            <ArrowLeft size={20} color="#0F172A" />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-poppins-700 text-text-primary mb-1">KYC Verifications</Text>
            <Text className="text-text-secondary font-poppins-400 text-xs">Review and verify identity submissions</Text>
          </View>
        </View>

        {/* Search */}
        <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 border border-border/50 shadow-sm mb-6">
          <Search size={20} color="#94A3B8" />
          <TextInput
            className="flex-1 ml-3 font-poppins-400 text-sm text-text-primary"
            placeholder="Search by name..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          
                    style={Platform.OS === 'web' ? { outlineStyle: 'none', borderWidth: 0, backgroundColor: 'transparent' } : {}}
                    />
        </View>

        {/* List */}
        {loading && !refreshing ? (
          <View className="py-20">
            <ActivityIndicator size="large" color="#6366F1" />
          </View>
        ) : filteredRequests.length > 0 ? (
          <View className="space-y-4 pb-10">
            {filteredRequests.map((req) => {
              const statusStyle = getStatusStyle(req.status || 'pending');
              const userObj = req.user || {};
              const name = req.ngo_name 
                || req.user_name
                || req.user_email
                || userObj.full_name 
                || `${userObj.first_name || ''} ${userObj.last_name || ''}`.trim()
                || req.full_name
                || `${req.first_name || ''} ${req.last_name || ''}`.trim()
                || userObj.username
                || 'User #' + req.id;
              
              return (
                <TouchableOpacity 
                  key={req.id}
                  className="bg-white rounded-3xl p-5 shadow-sm border border-border/30"
                  onPress={() => navigation.navigate('KycReview', { kycId: req.id, kycData: req })}
                >
                  <View className="flex-row items-center">
                    <View className="w-12 h-12 bg-slate-100 rounded-2xl items-center justify-center mr-4">
                      {req.user_type === 'ngo' ? <FileText size={24} color="#0F172A" /> : <User size={24} color="#0F172A" />}
                    </View>
                    <View className="flex-1">
                      <View className="flex-row justify-between items-start">
                        <Text className="text-base font-poppins-700 text-text-primary leading-tight flex-1 mr-2" numberOfLines={1}>
                          {name}
                        </Text>
                        <View className={`${statusStyle.bg} px-2 py-1 rounded-lg flex-row items-center`}>
                          {statusStyle.icon}
                          <Text className={`${statusStyle.text} font-poppins-600 text-[8px] uppercase ml-1`}>
                            {req.status || 'PENDING'}
                          </Text>
                        </View>
                      </View>
                      
                      <Text className="text-text-secondary font-poppins-400 text-[10px] mt-1">
                        {req.user_type === 'ngo' ? 'NGO Verification' : 'Professional KYC'} • {new Date(req.created_at || Date.now()).toLocaleDateString()}
                      </Text>
                    </View>
                    <ChevronRight size={20} color="#CBD5E1" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View className="py-20 items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200">
            <AlertCircle size={48} color="#CBD5E1" />
            <Text className="text-text-secondary font-poppins-500 text-sm mt-4">No verification requests found.</Text>
          </View>
        )}
      </View>
    </Screen>
  );
};

export default KycRequestsScreen;
