import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Animated, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import useAuthStore from '../../stores/authStore';
import useNotificationStore from '../../stores/notificationStore';
import Screen from '../../components/common/Screen';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Skeleton from '../../components/common/Skeleton';
import PortfolioService from '../../services/portfolioService';
import { useLanguage } from '../../context/LanguageContext';
import {
  Clock,
  Award,
  Briefcase,
  PlusCircle,
  Search,
  Heart,
  Bell,
  TrendingUp,
  MapPin,
  CheckCircle2
} from 'lucide-react-native';

const DashboardScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const user = useAuthStore((state) => state.user);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const fetchUnreadCount = useNotificationStore((state) => state.fetchUnreadCount);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const [stats, setStats] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const { width } = Dimensions.get('window');

  const statsAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const fetchData = async () => {
    try {
      const [summary, activities] = await Promise.all([
        PortfolioService.getSummaryStats(),
        PortfolioService.getActivities()
      ]);

      setStats([
        { id: '1', label: 'Hours Logged', value: `${summary.total_hours || 0}h`, icon: Clock, color: '#D85D2D', bg: '#F5A89215' },
        { id: '2', label: 'Verified', value: summary.verified_activities || 0, icon: CheckCircle2, color: '#3D8B6E', bg: '#3D8B6E15' },
        { id: '3', label: 'Skills', value: summary.skills_count || 0, icon: Award, color: '#E8B54E', bg: '#F5D59015' },
      ]);

      setRecentActivities((Array.isArray(activities) ? activities : activities?.results ?? []).slice(0, 3));

      // Stagger animations for stats
      Animated.stagger(100, [
        Animated.spring(statsAnimations[0], { toValue: 1, useNativeDriver: true }),
        Animated.spring(statsAnimations[1], { toValue: 1, useNativeDriver: true }),
        Animated.spring(statsAnimations[2], { toValue: 1, useNativeDriver: true }),
      ]).start();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchUnreadCount();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
    }, [fetchUnreadCount])
  );

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShowGreeting(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const QuickAction = ({ icon: Icon, label, color, onPress }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="w-[48%] mb-4"
    >
      <View
        className="items-center justify-center py-6 rounded-2xl border-2 active:opacity-70"
        style={{
          borderColor: color + '30',
          backgroundColor: color + '08',
        }}
      >
        <View 
          className="w-12 h-12 rounded-full items-center justify-center mb-3"
          style={{ backgroundColor: color + '20' }}
        >
          <Icon size={24} color={color} strokeWidth={2} />
        </View>
        <Text 
          className="text-sm font-poppins-600 text-text-primary text-center"
          style={{ fontFamily: 'Poppins_600SemiBold' }}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const StatCard = ({ stat, index }) => (
    <Animated.View
      style={{
        transform: [
          {
            scale: statsAnimations[index].interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            }),
          },
        ],
        opacity: statsAnimations[index],
      }}
      className="w-32 mr-4"
    >
      <View
        className="rounded-2xl p-5 border-2"
        style={{
          backgroundColor: stat.bg,
          borderColor: stat.color + '30',
        }}
      >
        <View 
          className="w-10 h-10 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: stat.color + '30' }}
        >
          <stat.icon size={20} color={stat.color} strokeWidth={2} />
        </View>
        <Text 
          className="text-text-tertiary font-poppins-400 text-xs mb-2"
          style={{ fontFamily: 'Poppins_400Regular' }}
        >
          {stat.label}
        </Text>
        <Text 
          className="text-text-primary font-poppins-700 text-2xl"
          style={{ fontFamily: 'Poppins_700Bold' }}
        >
          {stat.value}
        </Text>
      </View>
    </Animated.View>
  );

  const LoadingSkeleton = () => (
    <View>
      <View className="flex-row justify-between items-center mt-4 mb-8">
        <View className="flex-row items-center">
          <Skeleton width={48} height={48} variant="circle" />
          <View className="ml-3">
            <Skeleton width={80} height={12} className="mb-2" />
            <Skeleton width={120} height={20} />
          </View>
        </View>
        <Skeleton width={40} height={40} variant="circle" />
      </View>
      <Skeleton width="100%" height={200} className="mb-8 rounded-3xl" />
      <Skeleton width="100%" height={300} className="mb-8 rounded-3xl" />
    </View>
  );

  const HeaderContent = () => (
    <View>
      <View className="flex-row justify-between items-start mb-6">
        <View className="flex-1">
          {showGreeting ? (
            <View>
              <Text 
                className="text-sm text-primary font-poppins-600 mb-2"
                style={{ fontFamily: 'Poppins_600SemiBold' }}
              >
                Welcome Back 👋
              </Text>
            </View>
          ) : null}
          <Text
            className="text-3xl text-text-primary leading-tight"
            style={{ 
              fontFamily: 'Montserrat_900Black',
              fontWeight: '900',
              letterSpacing: -0.5,
            }}
          >
            {user?.full_name?.split(' ')[0] || user?.username || 'User'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Notifications')}
          className="w-12 h-12 items-center justify-center rounded-full border-2 border-border"
          style={{ backgroundColor: '#FAFAF8' }}
        >
          <Bell size={20} color="#1A1A18" strokeWidth={1.5} />
          {unreadCount > 0 && (
            <View className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full" />
          )}
        </TouchableOpacity>
      </View>

      {/* Hero section: Care Stats Overview */}
      <View className="mb-8 p-6 rounded-3xl border-2 border-primary/20" style={{ backgroundColor: '#D85D2D08' }}>
        <View className="flex-row items-center mb-4">
          <Heart size={20} color="#D85D2D" fill="#D85D2D" strokeWidth={1.5} />
          <Text className="ml-2 text-primary font-poppins-700 text-sm" style={{ fontFamily: 'Poppins_700Bold' }}>
            Your Care Impact
          </Text>
        </View>
        <Text className="text-3xl text-text-primary font-montserrat-700 mb-2" style={{ fontFamily: 'Montserrat_700Bold' }}>
          {stats[0]?.value || '0h'}
        </Text>
        <Text className="text-text-secondary text-sm leading-5" style={{ fontFamily: 'Poppins_400Regular' }}>
          of unpaid care work recognized and tracked
        </Text>
      </View>
    </View>
  );

  return (
    <Screen scrollable className="bg-background"
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#D85D2D" />}
    >
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <>
          <HeaderContent />

          {/* Stats Cards (Horizontal) */}
          <View className="mb-8">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              className="flex-row"
            >
              {stats.map((stat, index) => (
                <StatCard key={stat.id} stat={stat} index={index} />
              ))}
            </ScrollView>
          </View>

          {/* Quick Actions Grid */}
          <View className="mb-8">
            <Text 
              className="text-lg text-text-primary mb-4"
              style={{ fontFamily: 'Montserrat_700Bold', fontWeight: '700' }}
            >
              Quick Actions
            </Text>
            <View className="flex-row flex-wrap justify-between">
              <QuickAction icon={PlusCircle} label="Log Care" color="#D85D2D" onPress={() => navigation.navigate('AddActivity')} />
              <QuickAction icon={Search} label="Find Jobs" color="#1B6B7F" onPress={() => navigation.navigate('Jobs')} />
              <QuickAction icon={Briefcase} label="Portfolio" color="#3D8B6E" onPress={() => navigation.navigate('Portfolio')} />
              <QuickAction icon={TrendingUp} label="Rewards" color="#E8B54E" onPress={() => navigation.navigate('Notifications')} />
            </View>
          </View>

          {/* Recent Activity */}
          <View className="mb-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text 
                className="text-lg text-text-primary"
                style={{ fontFamily: 'Montserrat_700Bold', fontWeight: '700' }}
              >
                Recent Activities
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('ActivityLog')}>
                <Text 
                  className="text-primary font-poppins-600 text-sm"
                  style={{ fontFamily: 'Poppins_600SemiBold' }}
                >
                  See All
                </Text>
              </TouchableOpacity>
            </View>

            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <View 
                  key={activity.id} 
                  className="mb-3 p-4 rounded-2xl border-2 flex-row items-center"
                  style={{
                    backgroundColor: activity.status === 'verified' ? '#3D8B6E08' : '#F59E0B' + '08',
                    borderColor: activity.status === 'verified' ? '#3D8B6E30' : '#F59E0B' + '30',
                  }}
                >
                  <View 
                    className="w-12 h-12 rounded-full items-center justify-center mr-4"
                    style={{
                      backgroundColor: activity.status === 'verified' ? '#3D8B6E20' : '#F59E0B' + '20',
                    }}
                  >
                    <Clock 
                      size={20} 
                      color={activity.status === 'verified' ? '#3D8B6E' : '#F59E0B'}
                      strokeWidth={1.5}
                    />
                  </View>
                  <View className="flex-1">
                    <Text 
                      className="text-base font-poppins-600 text-text-primary"
                      style={{ fontFamily: 'Poppins_600SemiBold' }}
                    >
                      {activity.title}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <MapPin size={12} color="#8B8B85" strokeWidth={1.5} />
                      <Text 
                        className="text-xs text-text-tertiary font-poppins-400 ml-1"
                        style={{ fontFamily: 'Poppins_400Regular' }}
                      >
                        {activity.location || 'Nepal'} • {new Date(activity.date).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text 
                      className="text-base font-poppins-700 text-text-primary"
                      style={{ fontFamily: 'Poppins_700Bold' }}
                    >
                      {activity.hours}h
                    </Text>
                    <Badge 
                      label={activity.status === 'verified' ? '✓ Verified' : 'Pending'} 
                      variant={activity.status === 'verified' ? 'success' : 'warning'} 
                      className="mt-1" 
                    />
                  </View>
                </View>
              ))
            ) : (
              <View className="py-10 items-center justify-center rounded-2xl border-2 border-dashed border-border" style={{ backgroundColor: '#FAFAF8' }}>
                <Heart size={32} color="#C7C7C1" strokeWidth={1} />
                <Text 
                  className="text-text-tertiary font-poppins-400 mt-3"
                  style={{ fontFamily: 'Poppins_400Regular' }}
                >
                  Start logging your care work
                </Text>
              </View>
            )}
          </View>
        </>
      )}
    </Screen>
  );
};

export default DashboardScreen;
