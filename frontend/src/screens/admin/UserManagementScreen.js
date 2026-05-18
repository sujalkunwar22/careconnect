import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, TextInput, Alert, Platform } from 'react-native';
import Screen from '../../components/common/Screen';
import { 
  Users, 
  User,
  Search, 
  Filter, 
  MoreHorizontal, 
  Shield, 
  ShieldOff, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Mail,
  MapPin,
  ChevronRight,
  ArrowLeft
} from 'lucide-react-native';
import AdminService from '../../services/adminService';

const UserManagementScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('All');
  const [stats, setStats] = useState({ total: 0, professionals: 0, ngos: 0 });

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await AdminService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await AdminService.getStats();
      setStats({
        total: (data.total_users || 0) + (data.total_ngos || 0),
        professionals: data.total_users || 0,
        ngos: data.total_ngos || 0,
      });
    } catch (error) {
      console.error(error);
      setStats({ total: 0, professionals: 0, ngos: 0 });
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await AdminService.toggleUserStatus(user.id);
      Alert.alert('Success', `User ${user.is_active ? 'deactivated' : 'activated'} successfully`);
      fetchUsers();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update status');
    }
  };

  const handleDeleteUser = (user) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to permanently delete user ${user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AdminService.deleteUser(user.id);
              Alert.alert('Success', 'User deleted');
              fetchUsers();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete user');
            }
          }
        }
      ]
    );
  };

  const filteredUsers = (users || []).filter(user => {
    if (!user) return false;
    const name = user.full_name || user.name || '';
    const email = user.email || '';
    const username = user.username || '';
    const role = (user.role || '').toLowerCase();
    const query = (searchQuery || '').toLowerCase();
    const matchesQuery = name.toLowerCase().includes(query) || 
                         email.toLowerCase().includes(query) ||
                         username.toLowerCase().includes(query);
    const matchesType = userTypeFilter === 'All' ||
      (userTypeFilter === 'Professional' && ['user', 'professional'].includes(role)) ||
      (userTypeFilter === 'NGO' && role === 'ngo');

    return matchesQuery && matchesType;
  });

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
            <Text className="text-3xl font-poppins-700 text-text-primary mb-1">User Management</Text>
            <Text className="text-text-secondary font-poppins-400 text-sm">Oversee platform professionals and NGOs</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View className="flex-row gap-4 mb-8">
          <View className="flex-1 bg-white p-4 rounded-3xl border border-border/50 shadow-sm">
            <View className="w-8 h-8 bg-blue-50 rounded-xl items-center justify-center mb-3">
              <Users size={16} color="#0F172A" />
            </View>
            <Text className="text-3xl font-poppins-700 text-text-primary">{stats.total}</Text>
            <Text className="text-text-secondary font-poppins-500 text-xs uppercase">Total Users</Text>
          </View>
          <View className="flex-1 bg-white p-4 rounded-3xl border border-border/50 shadow-sm">
            <View className="w-8 h-8 bg-green-50 rounded-xl items-center justify-center mb-3">
              <CheckCircle size={16} color="#2D6A4F" />
            </View>
            <Text className="text-3xl font-poppins-700 text-text-primary">{stats.professionals}</Text>
            <Text className="text-text-secondary font-poppins-500 text-xs uppercase">Professionals</Text>
          </View>
          <View className="flex-1 bg-white p-4 rounded-3xl border border-border/50 shadow-sm">
            <View className="w-8 h-8 bg-amber-50 rounded-xl items-center justify-center mb-3">
              <AlertCircle size={16} color="#B45309" />
            </View>
            <Text className="text-3xl font-poppins-700 text-text-primary">{stats.ngos}</Text>
            <Text className="text-text-secondary font-poppins-500 text-xs uppercase">NGOs</Text>
          </View>
        </View>

        {/* Search */}
        <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 border border-border/50 shadow-sm mb-4">
          <Search size={20} color="#94A3B8" />
          <TextInput
            className="flex-1 ml-3 font-poppins-400 text-base text-text-primary"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          
                    style={Platform.OS === 'web' ? { outlineStyle: 'none', borderWidth: 0, backgroundColor: 'transparent' } : {}}
                    />
        </View>

        <View className="flex-row items-center justify-between mb-6">
          {['All', 'Professional', 'NGO'].map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setUserTypeFilter(type)}
              className={`px-4 py-2 rounded-full border ${userTypeFilter === type ? 'bg-primary text-white border-primary' : 'bg-white text-text-primary border-border/50'}`}
            >
              <Text className={`font-poppins-600 ${userTypeFilter === type ? 'text-white' : 'text-text-primary'}`}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Users List */}
        {loading ? (
          <View className="py-20">
            <ActivityIndicator size="large" color="#6366F1" />
          </View>
        ) : filteredUsers.length > 0 ? (
          <View className="space-y-4 pb-10">
            {filteredUsers.map((user) => (
              <View 
                key={user.id}
                className="bg-white rounded-3xl p-5 shadow-sm border border-border/30"
              >
                <View className="flex-row justify-between items-start mb-4">
                  <TouchableOpacity
                    onPress={() => navigation.navigate('UserDetail', { userId: user.id, userData: user })}
                    className="flex-row flex-1"
                  >
                    <View className="w-12 h-12 bg-slate-100 rounded-2xl items-center justify-center mr-4">
                      <User size={24} color="#94A3B8" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-poppins-700 text-text-primary leading-tight">
                        {user.full_name || user.name || user.username || 'Unknown User'}
                      </Text>
                      <Text className="text-text-secondary font-poppins-400 text-sm mt-1">
                        {user.email || 'No email'}
                      </Text>
                      <View className="flex-row mt-2">
                        {(() => {
                          const normalizedRole = (user.role || '').toLowerCase();
                          const roleLabel = normalizedRole === 'user' ? 'Professional' : normalizedRole === 'ngo' ? 'NGO' : user.role || 'Unknown';
                          const isPro = ['user', 'professional'].includes(normalizedRole);
                          return (
                            <View className={`px-2 py-1 rounded-full mr-2 ${isPro ? 'bg-blue-50' : 'bg-purple-50'}`}>
                              <Text className={`font-poppins-600 text-xs ${isPro ? 'text-blue-700' : 'text-purple-700'}`}>
                                {roleLabel}
                              </Text>
                            </View>
                          );
                        })()}
                        <View className={`px-2 py-1 rounded-full ${user.is_kyc_verified ? 'bg-green-50' : 'bg-amber-50'}`}>
                          <Text className={`font-poppins-600 text-xs ${user.is_kyc_verified ? 'text-green-700' : 'text-amber-700'}`}>
                            KYC: {user.is_kyc_verified ? 'Verified' : 'Pending'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>

                <View className="flex-row items-center justify-between mt-2 pt-4 border-t border-slate-50">
                  <View className="flex-row items-center">
                    <MapPin size={12} color="#94A3B8" />
                    <Text className="text-text-secondary font-poppins-400 text-sm ml-1">{user.location}</Text>
                  </View>
                  
                  <View className="flex-row gap-3">
                    <TouchableOpacity 
                      onPress={() => handleToggleStatus(user)}
                      className={`w-10 h-10 rounded-full items-center justify-center ${user.is_active ? 'bg-amber-50' : 'bg-green-50'}`}
                    >
                      {user.is_active ? <ShieldOff size={18} color="#B45309" /> : <Shield size={18} color="#2D6A4F" />}
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => handleDeleteUser(user)}
                      className="w-10 h-10 rounded-full bg-red-50 items-center justify-center"
                    >
                      <Trash2 size={18} color="#6366F1" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="py-20 items-center justify-center">
            <Text className="text-text-secondary font-poppins-500 text-base">No users found.</Text>
          </View>
        )}
      </View>
    </Screen>
  );
};

export default UserManagementScreen;
