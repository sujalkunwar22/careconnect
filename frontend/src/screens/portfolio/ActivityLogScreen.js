import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ScrollView, RefreshControl, ActivityIndicator, Platform } from 'react-native';
import Screen from '../../components/common/Screen';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import PortfolioService from '../../services/portfolioService';
import {
  Plus,
  Search,
  ArrowLeft,
  Filter,
  Clock,
  Calendar,
  MapPin,
  Baby,
  Heart,
  Home as HomeIcon,
  Activity
} from 'lucide-react-native';

const ActivityLogScreen = ({ navigation }) => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const categories = {
    'Elderly': { icon: Heart, color: '#6366F1', bg: '#6366F115' },
    'Child': { icon: Baby, color: '#F4D03F', bg: '#F4D03F15' },
    'Disability': { icon: Activity, color: '#3B82F6', bg: '#3B82F615' },
    'Household': { icon: HomeIcon, color: '#10B981', bg: '#10B98115' },
    'Community': { icon: Activity, color: '#9B59B6', bg: '#9B59B615' },
    'Other': { icon: Activity, color: '#94A3B8', bg: '#F8F9FA' },
  };

  const fetchActivities = useCallback(async () => {
    try {
      const data = await PortfolioService.getActivities();
      setActivities(data);
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchActivities();
  };

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (activity.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === 'All' ||
        (activeFilter === 'Verified' && activity.status === 'verified') ||
        (activeFilter === 'Pending' && activity.status === 'pending');
      return matchesSearch && matchesFilter;
    });
  }, [activities, searchQuery, activeFilter]);

  const ActivityCard = ({ item }) => {
    const category = categories[item.category] || { icon: Activity, color: '#94A3B8', bg: '#F8F9FA' };
    const Icon = category.icon;

    return (
      <Card className="mb-4 bg-white border-none shadow-sm">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('ActivityDetail', { activity: item })}
        >
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-row items-center flex-1">
              <View
                className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
                style={{ backgroundColor: category.bg }}
              >
                <Icon size={20} color={category.color} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-poppins-600 text-text-primary" numberOfLines={1}>{item.title}</Text>
                <View className="flex-row items-center mt-0.5">
                  <Calendar size={12} color="#94A3B8" />
                  <Text className="text-xs text-text-secondary font-poppins-400 ml-1">
                    {item.date ? new Date(item.date).toLocaleDateString() : ''}
                  </Text>
                </View>
              </View>
            </View>
            <View className="items-end bg-background px-3 py-1.5 rounded-xl">
              <Text className="text-sm font-poppins-700 text-text-primary">{item.hours}h</Text>
            </View>
          </View>

          <Text className="text-xs text-text-secondary font-poppins-400 mb-4 leading-5" numberOfLines={2}>
            {item.description}
          </Text>

          <View className="flex-row justify-between items-center pt-3 border-t border-border/50">
            <View className="flex-row items-center">
              <MapPin size={12} color="#94A3B8" />
              <Text className="text-[10px] text-text-secondary font-poppins-400 ml-1">{item.location}</Text>
            </View>
            <Badge
              label={item.status === 'verified' ? 'Verified' : 'Pending'}
              variant={item.status === 'verified' ? 'success' : 'warning'}
            />
          </View>
        </TouchableOpacity>
      </Card>
    );
  };

  return (
    <Screen className="bg-surface">
      {/* Header */}
      <View className="mt-4 mb-6">
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 items-center justify-center bg-white rounded-full shadow-sm"
          >
            <ArrowLeft size={20} color="#0F172A" />
          </TouchableOpacity>
          <Text
            className="text-xl text-text-primary"
            style={{ fontFamily: 'Montserrat_700Bold' }}
          >
            Activity Logs
          </Text>
          <View className="w-10" />
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 shadow-sm border border-border/30 mb-6">
          <Search size={20} color="#94A3B8" />
          <TextInput
            placeholder="Search activities..."
            className="flex-1 ml-3 font-poppins-400 text-sm text-text-primary"
            value={searchQuery}
            onChangeText={setSearchQuery}
          
                    style={[{ borderWidth: 0, backgroundColor: 'transparent' }, Platform.OS === 'web' && { outlineStyle: 'none' }]}
                    />
          <TouchableOpacity className="ml-2">
            <Filter size={20} color="#6366F1" />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          {['All', 'Verified', 'Pending'].map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter)}
              className={`px-6 py-2.5 rounded-full mr-3 border ${activeFilter === filter ? 'bg-primary border-primary' : 'bg-white border-border'}`}
            >
              <Text className={`font-poppins-600 text-xs ${activeFilter === filter ? 'text-white' : 'text-text-secondary'}`}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color="#6366F1" />
          <Text className="mt-4 font-poppins-500 text-text-secondary">Loading activities...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredActivities}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <ActivityCard item={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#6366F1']} />}
          ListEmptyComponent={() => (
            <EmptyState
              title="No logs found"
              message={searchQuery ? "Try a different search term or filter." : "You haven't logged any activities yet."}
              icon={Activity}
              actionLabel={searchQuery ? "Clear Search" : "Log Activity"}
              onAction={() => searchQuery ? setSearchQuery('') : navigation.navigate('AddActivity')}
            />
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('AddActivity')}
        className="absolute bottom-6 right-6 w-16 h-16 bg-primary rounded-2xl items-center justify-center shadow-lg shadow-primary/40 elevation-5"
      >
        <Plus size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </Screen>
  );
};

export default ActivityLogScreen;
