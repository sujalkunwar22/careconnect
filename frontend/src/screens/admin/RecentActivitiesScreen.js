import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, CheckCircle2, AlertCircle, AlertTriangle, Briefcase, TrendingUp, UserPlus, FileText } from 'lucide-react-native';
import AdminService from '../../services/adminService';

const getActivityIcon = (type) => {
  switch (type) {
    case 'kyc_approved':
      return <CheckCircle2 size={18} color='#16a34a' />;
    case 'kyc_rejected':
      return <AlertCircle size={18} color='#dc2626' />;
    case 'kyc_info_requested':
      return <AlertTriangle size={18} color='#d97706' />;
    case 'job_posted':
      return <Briefcase size={18} color='#2563eb' />;
    case 'job_updated':
      return <TrendingUp size={18} color='#2563eb' />;
    case 'user_registered':
      return <UserPlus size={18} color='#0f766e' />;
    default:
      return <FileText size={18} color='#475569' />;
  }
};

const getActivityBg = (type) => {
  switch (type) {
    case 'kyc_approved':
      return '#dcfce7';
    case 'kyc_rejected':
      return '#fee2e2';
    case 'kyc_info_requested':
      return '#fef3c7';
    case 'job_posted':
    case 'job_updated':
      return '#dbeafe';
    case 'user_registered':
      return '#d1fae5';
    default:
      return '#f8fafc';
  }
};

const COLORS = {
  surface: '#F8FAFC',
  onSurface: '#0F172A',
  onSurfaceVariant: '#475569',
  outline: '#94A3B8',
  border: '#E9ECEF',
  red: '#6366F1',
};

const RecentActivitiesScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState([]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const statsData = await AdminService.getVerifierStats();
      if (statsData && Array.isArray(statsData.recent_activity)) {
        setActivities(statsData.recent_activity);
      } else {
        setActivities([]);
      }
    } catch (error) {
      console.error('Error loading recent activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchActivities();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={22} color={COLORS.red} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Recent Activities</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.red]} />}
      >
        {activities.length > 0 ? (
          activities.map((item, idx) => (
            <View key={item.id ?? idx} style={[styles.activityRow, idx !== activities.length - 1 && { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }]}> 
              <View style={[styles.activityIcon, { backgroundColor: getActivityBg(item.type) }]}> 
                {getActivityIcon(item.type)}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.activityTitle}>{item.title}</Text>
                <Text style={styles.activityDesc}>{item.desc}</Text>
                {item.timestamp ? <Text style={styles.activityMeta}>{new Date(item.timestamp).toLocaleString()}</Text> : null}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No recent activity found.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.surface },
  headerBar: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 18,
    borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: '#fff',
  },
  backBtn: { marginRight: 12, width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  headerTitle: { fontSize: 20, fontFamily: 'Poppins_600SemiBold', color: COLORS.onSurface },
  scrollContainer: { flex: 1, paddingHorizontal: 20, backgroundColor: COLORS.surface },
  activityRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 18, gap: 12 },
  activityIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  activityTitle: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: COLORS.onSurface, marginBottom: 4 },
  activityDesc: { fontSize: 13, fontFamily: 'Inter_400Regular', color: COLORS.onSurfaceVariant, lineHeight: 18 },
  activityMeta: { fontSize: 11, fontFamily: 'Inter_400Regular', color: COLORS.outline, marginTop: 6 },
  emptyState: { padding: 32, alignItems: 'center' },
  emptyText: { fontSize: 14, fontFamily: 'Inter_500Medium', color: COLORS.onSurfaceVariant },
});

export default RecentActivitiesScreen;
