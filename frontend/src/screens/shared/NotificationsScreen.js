import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import Screen from '../../components/common/Screen';
import { 
  ArrowLeft,
  Bell, 
  Briefcase, 
  ShieldCheck, 
  Settings, 
  Clock, 
  ChevronRight,
  CheckCheck
} from 'lucide-react-native';
import useNotificationStore from '../../stores/notificationStore';
import NotificationsService from '../../services/notificationsService';

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount);

  const [selectedNotification, setSelectedNotification] = useState(null);

  const handleNotificationPress = async (notification) => {
    setSelectedNotification(notification);
    if (!notification.is_read && !notification.read) {
      try {
        await NotificationsService.markAsRead(notification.id);
        setNotifications(notifications.map(n => 
          n.id === notification.id ? { ...n, is_read: true } : n
        ));
        fetchUnreadCount();
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await NotificationsService.getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationType = (notification) => notification.notification_type || notification.type || 'system';

  const getNotificationCategory = (type) => {
    if (!type) return 'system';
    if (type === 'system') return 'system';
    if (type.startsWith('kyc_')) return 'kyc';
    const jobTypes = ['application_received', 'interview_scheduled', 'application_rejected', 'application_hired', 'job_match'];
    if (jobTypes.includes(type)) return 'job';
    return 'system';
  };

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter((notification) => getNotificationCategory(getNotificationType(notification)) === filter);

  const getNotificationStyles = (type) => {
    switch(type) {
      case 'job':
        return { icon: <Briefcase size={20} color="#6366F1" />, bgColor: 'bg-primary/10' };
      case 'kyc':
        return { icon: <ShieldCheck size={20} color="#10b981" />, bgColor: 'bg-[#10b981]/10' };
      case 'system':
      default:
        return { icon: <Settings size={20} color="#64748B" />, bgColor: 'bg-slate-100' };
    }
  };

  const markAllRead = async () => {
    try {
      await NotificationsService.markAllRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      fetchUnreadCount();
    } catch (error) {
      console.error(error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read && !n.read).length;

  const renderNotificationsList = () => {
    if (filteredNotifications.length === 0) {
      return (
        <View className="py-20 items-center justify-center">
          <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-4">
            <Bell size={40} color="#cbd5e1" />
          </View>
          <Text className="text-slate-700 font-bold text-base">No notifications</Text>
          <Text className="text-slate-400 font-medium text-xs text-center mt-2 px-10">
            You're all caught up! Check back later for new updates.
          </Text>
        </View>
      );
    }

    return filteredNotifications.map((notification) => {
      const category = getNotificationCategory(getNotificationType(notification));
      const styles = getNotificationStyles(category);
      const isRead = notification.is_read || notification.read;
      const displayDate = notification.created_at ? new Date(notification.created_at).toLocaleDateString() : notification.time;

      return (
        <TouchableOpacity 
          key={notification.id}
          onPress={() => handleNotificationPress(notification)}
          className="bg-white rounded-[20px] p-4 flex-row border mb-3"
          style={isRead ? {
            borderColor: '#f1f5f9', // slate-100
          } : {
            borderColor: 'rgba(99, 102, 241, 0.2)', // primary/20
            shadowColor: '#6366F1', // primary
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          {!isRead && (
            <View className="absolute top-4 left-1.5 w-2 h-2 bg-primary rounded-full" />
          )}
          <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${styles.bgColor}`}>
            {styles.icon}
          </View>
          <View className="flex-1">
            <View className="flex-row justify-between items-start mb-1">
              <Text className={`font-bold text-sm flex-1 mr-2 ${isRead ? 'text-slate-700' : 'text-primary'}`}>
                {notification.title}
              </Text>
              <View className="flex-row items-center bg-slate-50 px-2 py-0.5 rounded-md">
                <Clock size={9} color="#94A3B8" />
                <Text className="text-slate-400 font-medium text-[9px] ml-1">{displayDate}</Text>
              </View>
            </View>
            <Text 
              className="text-slate-500 font-medium text-xs leading-5"
              numberOfLines={2}
            >
              {notification.message}
            </Text>
          </View>
          <View className="justify-center ml-2">
            <ChevronRight size={16} color="#e2e8f0" />
          </View>
        </TouchableOpacity>
      );
    });
  };

  if (loading) {
    return (
      <Screen className="items-center justify-center bg-[#FAFAFA]">
        <ActivityIndicator size="large" color="#6366F1" />
      </Screen>
    );
  }

  return (
    <Screen scrollable className="bg-[#FAFAFA]" style={{ paddingHorizontal: 0 }}>
      {/* Premium Header */}
      <View className="bg-primary px-6 pt-6 pb-20 rounded-b-[40px] shadow-lg shadow-primary/20">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 items-center justify-center rounded-full"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              borderWidth: 1,
            }}
          >
            <ArrowLeft size={20} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={markAllRead}
            className="flex-row items-center px-4 py-2 rounded-full"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              borderWidth: 1,
            }}
          >
            <CheckCheck size={14} color="#ffffff" />
            <Text className="text-white font-bold text-xs ml-1.5">Mark all read</Text>
          </TouchableOpacity>
        </View>

        <View className="items-center mt-2">
          <View className="w-14 h-14 bg-white/15 rounded-2xl items-center justify-center border border-white/25 mb-3">
            <Bell size={28} color="#ffffff" />
          </View>
          <Text className="text-2xl text-white font-bold">Notifications</Text>
          <Text className="text-white/70 text-xs font-medium mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </Text>
        </View>
      </View>

      <View className="px-5 -mt-8">
        {/* Floating Filter Tabs */}
        <View className="bg-white rounded-2xl p-1.5 shadow-md shadow-slate-200/50 border border-slate-100 mb-6 flex-row">
          {['all', 'job', 'kyc', 'system'].map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              className="flex-1 py-2.5 rounded-xl items-center"
              style={filter === f ? {
                backgroundColor: '#6366F1', // primary
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 1,
              } : {}}
            >
              <Text className={`font-bold text-xs capitalize ${filter === f ? 'text-white' : 'text-slate-400'}`}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notifications List */}
        <View className="space-y-3 pb-20">
          {renderNotificationsList()}
        </View>
      </View>

      {/* Notification Detail Modal */}
      <Modal
        visible={!!selectedNotification}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedNotification(null)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center p-6">
          <View className="bg-white w-full max-w-lg rounded-[32px] p-7 shadow-2xl border border-slate-100">
            <View className="flex-row items-center mb-5">
              <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-3 ${selectedNotification ? getNotificationStyles(getNotificationCategory(getNotificationType(selectedNotification))).bgColor : ''}`}>
                {selectedNotification && getNotificationStyles(getNotificationCategory(getNotificationType(selectedNotification))).icon}
              </View>
              <Text className="text-lg font-bold text-slate-800 flex-1">{selectedNotification?.title}</Text>
            </View>
            
            <ScrollView className="max-h-[300px] mb-6">
              <Text className="text-slate-600 font-medium text-sm leading-6">
                {selectedNotification?.message}
              </Text>
            </ScrollView>
            
            <View className="flex-row items-center mb-6 bg-slate-50 px-3 py-2 rounded-xl">
              <Clock size={12} color="#94A3B8" />
              <Text className="text-slate-400 font-medium text-[10px] ml-1.5">
                {selectedNotification?.created_at ? new Date(selectedNotification.created_at).toLocaleString() : selectedNotification?.time}
              </Text>
            </View>

            <TouchableOpacity 
              onPress={() => setSelectedNotification(null)}
              className="bg-primary py-4 rounded-2xl items-center"
              style={{
                shadowColor: '#6366F1',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.2,
                shadowRadius: 20,
                elevation: 5,
              }}
            >
              <Text className="text-white font-bold">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
};

export default NotificationsScreen;
