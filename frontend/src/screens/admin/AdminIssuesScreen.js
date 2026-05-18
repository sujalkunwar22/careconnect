import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, RefreshControl, FlatList, Platform } from 'react-native';
import Screen from '../../components/common/Screen';
import { useFocusEffect } from '@react-navigation/native';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  Ticket, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Clock,
  User,
  ArrowLeft,
  MessageSquare
} from 'lucide-react-native';
import AdminService from '../../services/adminService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';

const AdminIssuesScreen = ({ navigation }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('open');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getTickets({ all: 'true' });
      // Handle DRF paginated response
      const ticketList = data.results || data;
      setTickets(Array.isArray(ticketList) ? ticketList : []);
    } catch (error) {
      console.error('Error fetching tickets for admin:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTickets();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user_email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'open') return matchesSearch && (ticket.status?.toLowerCase() === 'open' || ticket.status?.toLowerCase() === 'in_progress');
    if (filter === 'resolved') return matchesSearch && (ticket.status?.toLowerCase() === 'resolved' || ticket.status?.toLowerCase() === 'closed');
    
    return matchesSearch;
  });

  const getStatusConfig = (status) => {
    switch (status.toLowerCase()) {
      case 'in_progress':
      case 'open':
        return { variant: 'warning', icon: Clock, label: 'Active' };
      case 'resolved':
      case 'closed':
        return { variant: 'success', icon: CheckCircle, label: 'Resolved' };
      default:
        return { variant: 'neutral', icon: AlertCircle, label: status };
    }
  };

  const TicketItem = ({ item }) => {
    const config = getStatusConfig(item.status);
    return (
      <TouchableOpacity 
        onPress={() => navigation.navigate('AdminTicketDetail', { id: item.id, ticket: item })}
        className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-border/30"
      >
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-slate-100 rounded-lg items-center justify-center mr-2">
              <Ticket size={16} color="#0F172A" />
            </View>
            <Text className="text-[10px] font-poppins-600 text-text-secondary uppercase">#{item.id.toString().padStart(4, '0')}</Text>
          </View>
          <Badge
            label={config.label}
            variant={config.variant}
            icon={config.icon}
            containerClassName="h-6 px-2.5"
            textClassName="text-[10px]"
          />
        </View>

        <Text className="text-base font-poppins-700 text-text-primary mb-2" numberOfLines={1}>{item.subject}</Text>
        
        <View className="flex-row items-center mb-4">
          <View className="w-6 h-6 bg-primary/10 rounded-full items-center justify-center mr-2">
            <User size={12} color="#6366F1" />
          </View>
          <Text className="text-xs text-text-secondary font-poppins-500 flex-1" numberOfLines={1}>
            {item.user_name || 'Anonymous User'}
          </Text>
          <Text className="text-[10px] text-text-tertiary font-poppins-400">
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>

        <View className="flex-row items-center justify-between pt-3 border-t border-border/10">
          <View className="flex-row items-center">
            <MessageSquare size={14} color="#94A3B8" className="mr-1" />
            <Text className="text-[10px] text-text-secondary font-poppins-400">
              {item.response ? 'Replied' : 'Awaiting Reply'}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-[10px] text-primary font-poppins-600 mr-1">Review</Text>
            <ChevronRight size={14} color="#6366F1" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Screen className="bg-background">
      <View className="px-6 pt-6 flex-1">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="w-8 h-8 items-center justify-center bg-white rounded-full shadow-sm mr-3"
          >
            <ArrowLeft size={20} color="#0F172A" />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-poppins-700 text-text-primary mb-1">Support Tickets</Text>
            <Text className="text-text-secondary font-poppins-400 text-xs">Manage user issues and inquiries</Text>
          </View>
        </View>

        {/* Search */}
        <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 border border-border/50 shadow-sm mb-6">
          <Search size={20} color="#94A3B8" />
          <TextInput
            className="flex-1 ml-3 font-poppins-400 text-sm text-text-primary"
            placeholder="Search tickets..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          
                    style={Platform.OS === 'web' ? { outlineStyle: 'none', borderWidth: 0, backgroundColor: 'transparent' } : {}}
                    />
        </View>

        {/* Filter Tabs */}
        <View className="flex-row mb-6">
          {['all', 'open', 'resolved'].map((t) => (
            <TouchableOpacity 
              key={t}
              onPress={() => setFilter(t)}
              className={`px-4 py-2 rounded-full mr-2 ${filter === t ? 'bg-primary' : 'bg-white border border-border/50'}`}
            >
              <Text className={`text-xs font-poppins-600 capitalize ${filter === t ? 'text-white' : 'text-text-secondary'}`}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading && !refreshing ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#6366F1" />
          </View>
        ) : (
          <FlatList
            data={filteredTickets}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <TicketItem item={item} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366F1']} />}
            ListEmptyComponent={() => (
              <View className="py-20 items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200">
                <AlertCircle size={48} color="#CBD5E1" />
                <Text className="text-text-secondary font-poppins-500 text-sm mt-4">No tickets found.</Text>
              </View>
            )}
          />
        )}
      </View>
    </Screen>
  );
};

export default AdminIssuesScreen;
