import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuthStore from '../../stores/authStore';
import useNotificationStore from '../../stores/notificationStore';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Bell, Menu, ShieldAlert, FileText, CheckCircle2, AlertCircle, Building2, Users, Briefcase, TrendingUp, AlertTriangle, UserPlus, Ticket } from 'lucide-react-native';
import AdminService from '../../services/adminService';

const COLORS = {
  primary: '#6366F1',
  primaryContainer: '#818CF8',
  secondary: '#485f84',
  tertiary: '#286182',
  surface: '#F8FAFC',
  surfaceContainer: '#EEF2FF',
  onSurface: '#0F172A',
  onSurfaceVariant: '#475569',
  outline: '#94A3B8',
  outlineVariant: '#E2E8F0',
  success: '#2D6A4F',
  white: '#ffffff',
  border: '#E9ECEF',
  navy: '#0F172A',
  red: '#6366F1',
};

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
    case 'ticket_created':
      return <Ticket size={18} color='#6366F1' />;
    case 'ticket_resolved':
      return <CheckCircle2 size={18} color='#16a34a' />;
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
      return '#dbeafe';
    case 'job_updated':
      return '#dbeafe';
    case 'user_registered':
      return '#d1fae5';
    case 'ticket_created':
      return '#fde8ea';
    case 'ticket_resolved':
      return '#dcfce7';
    default:
      return '#f8fafc';
  }
};

const AdminDashboardScreen = () => {
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    total_users: 0,
    total_ngos: 0,
    active_jobs: 0,
    pending_kyc: 0,
  });
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [ticketCount, setTicketCount] = useState(0);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  const fetchData = async () => {
    try {
      setRecentTickets([]);
      setTicketCount(0);
      const [statsData, kycData, ticketsData] = await Promise.all([
        AdminService.getVerifierStats(),
        AdminService.getPendingKYCs(),
        AdminService.getTickets()
      ]);
      
      if (statsData) {
        setDashboardStats({
          total_users: statsData.total_users || 0,
          total_ngos: statsData.total_ngos || 0,
          active_jobs: statsData.active_jobs || 0,
          pending_kyc: statsData.pending_kyc || 0,
        });

        if (Array.isArray(statsData.recent_activity)) {
          setRecentActivity(statsData.recent_activity.slice(0, 9).map(item => ({
            ...item,
            icon: getActivityIcon(item.type),
            bg: getActivityBg(item.type),
          })));
        }
      }
      
      if (kycData && Array.isArray(kycData)) {
        const pendingItems = kycData.filter(item => 
          item.status === 'pending' || item.status === 'submitted' || !item.status
        );

        const formatted = pendingItems.map((item) => {
          const userObj = item.user || {};
          const userName = item.ngo_name 
            || item.user_name
            || item.user_email
            || userObj.full_name 
            || `${userObj.first_name || ''} ${userObj.last_name || ''}`.trim()
            || item.full_name
            || `${item.first_name || ''} ${item.last_name || ''}`.trim()
            || userObj.username
            || 'Unknown User';

          return {
            id: item.id,
            type: item.user_type === 'ngo' ? 'NGO Verification' : 'Professional KYC',
            name: userName,
            submitted: new Date(item.created_at || Date.now()).toLocaleDateString(),
            raw: item
          };
        });
        setPendingApprovals(formatted);
      }

      if (ticketsData) {
        const ticketList = ticketsData.results || ticketsData;
        if (Array.isArray(ticketList)) {
          const openTickets = ticketList.filter(t => 
            t.status?.toLowerCase() === 'open' || 
            t.status?.toLowerCase() === 'in_progress'
          );
          setRecentTickets(openTickets.slice(0, 3));
          setTicketCount(openTickets.length);
        }
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchUnreadCount();
  }, []);

  // Use focus effect to refresh data when returning from review screen
  useFocusEffect(
    useCallback(() => {
      fetchData();
      fetchUnreadCount();
    }, [fetchUnreadCount])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleApprove = async (id) => {
    try {
      await AdminService.approveKYC(id);
      setPendingApprovals(prev => prev.filter(item => item.id !== id));
      setDashboardStats(prev => ({ 
        ...prev, 
        pending_kyc: Math.max(0, prev.pending_kyc - 1) 
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const handleReject = async (id) => {
    try {
      await AdminService.rejectKYC(id, "Rejected via quick dashboard action");
      setPendingApprovals(prev => prev.filter(item => item.id !== id));
      setDashboardStats(prev => ({ 
        ...prev, 
        pending_kyc: Math.max(0, prev.pending_kyc - 1) 
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const stats = [
    { title: 'Total Users', value: (dashboardStats.total_users + dashboardStats.total_ngos) > 1000 ? `${((dashboardStats.total_users + dashboardStats.total_ngos) / 1000).toFixed(1)}k` : (dashboardStats.total_users + dashboardStats.total_ngos).toString(), icon: <Users size={22} color={COLORS.navy} />, bg: '#e8edf4' },
    { title: 'Total NGOs', value: dashboardStats.total_ngos.toString(), icon: <Building2 size={22} color={COLORS.success} />, bg: '#e2f0ea' },
    { title: 'Open Issues', value: ticketCount.toString(), icon: <Ticket size={22} color={COLORS.tertiary} />, bg: '#e0f0f8' },
    { title: 'Pending KYC', value: dashboardStats.pending_kyc.toString(), icon: <FileText size={22} color={COLORS.primaryContainer} />, bg: '#fde8ea' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Prayer Flag + App Bar */}
      <View style={styles.appBar}>
        <View style={styles.prayerStripe} />
        <View style={styles.appBarContent}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.openDrawer?.()}>
            <Menu size={22} color={COLORS.red} />
          </TouchableOpacity>
          <Text style={styles.brandName}>Care Connect Nepal</Text>
          <View style={{ position: 'relative' }}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Notifications')}>
              <Bell size={22} color={COLORS.red} />
            </TouchableOpacity>
            {unreadCount > 0 && <View style={styles.notifDot} />}
          </View>
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.red]} />
        }
      >

        {/* Admin Header */}
        <View style={styles.headerCard}>
          <View style={styles.adminAvatarWrap}>
            {user?.profile_image ? (
              <Image source={{ uri: user.profile_image }} style={styles.adminAvatar} />
            ) : (
              <View style={styles.adminAvatarFallback}>
                <ShieldAlert size={40} color={COLORS.red} />
              </View>
            )}
          </View>
          <View style={styles.adminInfo}>
            <View style={styles.adminNameRow}>
              <Text style={styles.adminName}>{user?.full_name || 'System Administrator'}</Text>
              <View style={styles.adminBadge}>
                <ShieldAlert size={11} color="#fff" />
                <Text style={styles.adminBadgeText}>ADMIN</Text>
              </View>
            </View>
            <Text style={styles.adminSubtitle}>Overview of platform metrics and recent activities.</Text>
            {dashboardStats.pending_kyc > 0 && (
              <View style={styles.alertBanner}>
                <AlertTriangle size={15} color="#92400E" />
                <Text style={styles.alertText}>{dashboardStats.pending_kyc} KYC requests require review</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.manageBtn}
              onPress={() => navigation.navigate('UsersManagement')}
            >
              <Text style={styles.manageBtnText}>Manage System</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={styles.statCard}
              onPress={() => {
                if (stat.title === 'Total Users' || stat.title === 'Total NGOs') navigation.navigate('UsersManagement');
                if (stat.title === 'Active Jobs') navigation.navigate('JobsManagement');
                if (stat.title === 'Pending KYC') navigation.navigate('KycList');
              }}
            >
              <View style={[styles.statIconWrap, { backgroundColor: stat.bg }]}>
                {stat.icon}
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Pending KYC Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Action Required</Text>
          <TouchableOpacity onPress={() => navigation.navigate('KycList')}>
            <Text style={styles.sectionLink}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listCard}>
          {pendingApprovals.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.listRow,
                idx !== pendingApprovals.length - 1 && { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
              ]}
              onPress={() => navigation.navigate('KycReview', { kycId: item.id, kycData: item.raw })}
            >
              <View style={[styles.listIconWrap, { backgroundColor: '#FEF3C7', borderColor: '#FCD34D' }]}>
                {item.type.includes('NGO') ? (
                  <Building2 size={18} color="#92400E" />
                ) : (
                  <FileText size={18} color="#92400E" />
                )}
              </View>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.listTitle}>{item.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.listType}>{item.type}</Text>
                  <Text style={styles.listDate}>• {item.submitted}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TouchableOpacity
                  onPress={() => handleApprove(item.id)}
                  style={styles.approveBtn}
                >
                  <CheckCircle2 size={18} color="#047857" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleReject(item.id)}
                  style={styles.rejectBtn}
                >
                  <AlertCircle size={18} color="#b91c1c" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
          {pendingApprovals.length === 0 && (
            <View style={{ padding: 32, alignItems: 'center' }}>
              <CheckCircle2 size={40} color="#a7d7c5" />
              <Text style={{ color: COLORS.onSurfaceVariant, marginTop: 12, fontFamily: 'Inter_400Regular', fontSize: 14 }}>
                All caught up! No pending verifications.
              </Text>
            </View>
          )}
        </View>

        {/* Pending Issues / Tickets */}
        <View style={[styles.sectionHeader, { marginTop: 28 }]}>
          <Text style={styles.sectionTitle}>Active Issues</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AdminIssues')}>
            <Text style={styles.sectionLink}>Manage All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listCard}>
          {recentTickets.map((ticket, idx) => (
            <TouchableOpacity
              key={ticket.id}
              style={[
                styles.listRow,
                idx !== recentTickets.length - 1 && { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
              ]}
              onPress={() => navigation.navigate('AdminTicketDetail', { id: ticket.id, ticket })}
            >
              <View style={[styles.listIconWrap, { backgroundColor: '#fde8ea', borderColor: '#fca5a5' }]}>
                <ShieldAlert size={18} color="#b91c1c" />
              </View>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={styles.listTitle} numberOfLines={1}>{ticket.subject}</Text>
                  <Text style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'Inter_400Regular' }}>#{ticket.id?.toString().slice(-4)}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.listType}>{ticket.user_name || 'Anonymous'}</Text>
                  <Text style={styles.listDate}>• {ticket.user_email || ticket.created_at}</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: ticket.status?.toLowerCase() === 'open' ? '#FEF3C7' : '#DBEAFE' }]}>
                <Text style={[styles.statusText, { color: ticket.status?.toLowerCase() === 'open' ? '#92400E' : '#1E40AF' }]}>
                  {ticket.status.toUpperCase()}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          {recentTickets.length === 0 && (
            <View style={{ padding: 32, alignItems: 'center' }}>
              <CheckCircle2 size={40} color="#a7d7c5" />
              <Text style={{ color: COLORS.onSurfaceVariant, marginTop: 12, fontFamily: 'Inter_400Regular', fontSize: 14 }}>
                No active issues reported.
              </Text>
            </View>
          )}
        </View>

        {/* Recent Activity */}
        <View style={[styles.sectionHeader, { marginTop: 28 }]}> 
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('RecentActivities')}>
            <Text style={styles.sectionLink}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listCard}>
          {recentActivity.slice(0, 10).map((item, index) => (
            <TouchableOpacity
              key={item.id?.toString() || `activity-${index}`}
              onPress={() => setSelectedActivity(item)}
              style={[
                styles.activityRow,
                index !== Math.min(recentActivity.length, 10) - 1 && { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
              ]}
            >
              <View style={[styles.activityIcon, { backgroundColor: item.bg }]}> 
                {item.icon}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.activityTitle}>{item.title}</Text>
                <Text style={styles.activityDesc} numberOfLines={2}>{item.desc}</Text>
                {item.timestamp ? (
                  <Text style={styles.activityMeta}>{new Date(item.timestamp).toLocaleString()}</Text>
                ) : null}
              </View>
            </TouchableOpacity>
          ))}
          {recentActivity.length === 0 && (
            <View style={{ padding: 32, alignItems: 'center' }}>
              <TrendingUp size={40} color="#CBD5E1" />
              <Text style={{ color: COLORS.onSurfaceVariant, marginTop: 12, fontFamily: 'Inter_400Regular', fontSize: 14 }}>
                No recent activity recorded.
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Activity Detail Modal */}
      <Modal
        visible={!!selectedActivity}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedActivity(null)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: 'white', width: '100%', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 15, elevation: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: selectedActivity?.bg || '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                {selectedActivity?.icon}
              </View>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1e293b', flex: 1 }}>{selectedActivity?.title}</Text>
            </View>
            
            <ScrollView style={{ maxHeight: 200, marginBottom: 20 }}>
              <Text style={{ fontSize: 14, color: '#64748b', lineHeight: 22 }}>
                {selectedActivity?.desc}
              </Text>
            </ScrollView>
            
            {selectedActivity?.timestamp && (
              <Text style={{ fontSize: 10, color: '#94a3b8', marginBottom: 24 }}>
                {new Date(selectedActivity.timestamp).toLocaleString()}
              </Text>
            )}

            <TouchableOpacity 
              onPress={() => setSelectedActivity(null)}
              style={{ backgroundColor: '#6366F1', padding: 16, borderRadius: 16, alignItems: 'center' }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.surface },
  appBar: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  prayerStripe: { height: 3, backgroundColor: COLORS.red },
  appBarContent: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, height: 56,
  },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  brandName: { fontSize: 18, fontFamily: 'Poppins_600SemiBold', color: COLORS.red, letterSpacing: -0.3 },
  notifDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.red },
  scrollContent: { paddingBottom: 24 },

  // Header Card
  headerCard: {
    marginHorizontal: 20, marginTop: 20, backgroundColor: COLORS.white, borderRadius: 16, padding: 24,
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 4,
    alignItems: 'center',
  },
  adminAvatarWrap: {
    width: 88, height: 88, borderRadius: 16, overflow: 'hidden',
    borderWidth: 3, borderColor: COLORS.white,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 6,
    backgroundColor: '#f8fafc', marginBottom: 16,
  },
  adminAvatar: { width: '100%', height: '100%' },
  adminAvatarFallback: {
    width: '100%', height: '100%', backgroundColor: '#fde8ea', alignItems: 'center', justifyContent: 'center',
  },
  adminInfo: { alignItems: 'center' },
  adminNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  adminName: { fontSize: 24, fontFamily: 'Poppins_600SemiBold', color: COLORS.onSurface, lineHeight: 32 },
  adminBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: COLORS.red,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  adminBadgeText: { color: '#fff', fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 0.8 },
  adminSubtitle: { fontSize: 14, fontFamily: 'Inter_400Regular', color: COLORS.onSurfaceVariant, marginTop: 6, textAlign: 'center' },
  alertBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#FCD34D',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginTop: 14,
  },
  alertText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#92400E' },
  manageBtn: {
    backgroundColor: COLORS.navy, paddingHorizontal: 28, paddingVertical: 11, borderRadius: 8, marginTop: 16,
    shadowColor: COLORS.navy, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3,
  },
  manageBtnText: { color: '#fff', fontSize: 14, fontFamily: 'Inter_600SemiBold' },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginHorizontal: 20, marginTop: 20,
  },
  statCard: {
    width: '48%', backgroundColor: COLORS.white, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
    alignItems: 'center',
  },
  statIconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 28, fontFamily: 'Poppins_600SemiBold', color: COLORS.onSurface, lineHeight: 34 },
  statLabel: { fontSize: 12, fontFamily: 'Inter_400Regular', color: COLORS.onSurfaceVariant, marginTop: 2 },

  // Sections
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
    marginHorizontal: 20, marginTop: 28, marginBottom: 14,
  },
  sectionTitle: { fontSize: 20, fontFamily: 'Poppins_600SemiBold', color: COLORS.onSurface },
  sectionLink: { fontSize: 13, fontFamily: 'Inter_500Medium', color: COLORS.tertiary },

  // List Card
  listCard: {
    marginHorizontal: 20, backgroundColor: COLORS.white, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
    overflow: 'hidden',
  },
  listRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14,
  },
  listIconWrap: {
    width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center',
    marginRight: 12, borderWidth: 1,
  },
  listTitle: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: COLORS.onSurface, marginBottom: 1 },
  listType: { fontSize: 12, fontFamily: 'Inter_500Medium', color: COLORS.onSurfaceVariant },
  listDate: { fontSize: 11, fontFamily: 'Inter_400Regular', color: COLORS.outline },

  approveBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#D1FAE5',
    borderWidth: 1, borderColor: '#6EE7B7', alignItems: 'center', justifyContent: 'center',
  },
  rejectBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#FEE2E2',
    borderWidth: 1, borderColor: '#FCA5A5', alignItems: 'center', justifyContent: 'center',
  },

  // Activity
  activityRow: {
    flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  activityIcon: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
  },
  activityTitle: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: COLORS.onSurface, marginBottom: 2 },
  activityDesc: { fontSize: 12, fontFamily: 'Inter_400Regular', color: COLORS.onSurfaceVariant, lineHeight: 18 },
  activityMeta: { fontSize: 11, fontFamily: 'Inter_400Regular', color: COLORS.outline, marginTop: 4 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
});

export default AdminDashboardScreen;
