import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../../components/common/Screen';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import SupportService from '../../services/supportService';
import Skeleton from '../../components/common/Skeleton';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  ChevronRight,
  Ticket,
  Plus,
  AlertCircle
} from 'lucide-react-native';

const MyTicketsScreen = ({ navigation }) => {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTickets = async () => {
    try {
      const data = await SupportService.getTickets();
      // Handle DRF paginated response
      const ticketList = data.results || data;
      setTickets(Array.isArray(ticketList) ? ticketList : []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
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
    setIsRefreshing(true);
    fetchTickets();
  };

  const getStatusConfig = (status) => {
    switch (status.toLowerCase()) {
      case 'in_progress':
      case 'open':
        return { variant: 'warning', icon: Clock, label: 'Active' };
      case 'resolved':
      case 'closed':
        return { variant: 'success', icon: CheckCircle2, label: 'Resolved' };
      default:
        return { variant: 'neutral', icon: AlertCircle, label: status };
    }
  };

  const TicketCard = ({ item }) => {
    const config = getStatusConfig(item.status);
    return (
      <Card className="mb-4 bg-white border-none shadow-sm p-5">
        <TouchableOpacity
          className="flex-row items-center justify-between"
          onPress={() => navigation.navigate('TicketDetail', { id: item.id })}
        >
          <View className="flex-1 pr-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-[10px] font-poppins-600 text-text-secondary uppercase tracking-widest">#{item.id.toString().padStart(4, '0')}</Text>
              <Badge
                label={config.label}
                variant={config.variant}
                icon={config.icon}
                containerClassName="h-6 px-2.5"
                textClassName="text-[10px]"
              />
            </View>
            <Text className="text-base font-poppins-600 text-text-primary mb-3" numberOfLines={2}>{item.subject}</Text>
            <View className="flex-row items-center pt-3 border-t border-border/30">
              <Text className="text-xs text-text-secondary font-poppins-400">
                Submitted: {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color="#CBD5E1" />
        </TouchableOpacity>
      </Card>
    );
  };

  return (
    <Screen className="bg-surface">
      {/* Header */}
      <View className="flex-row items-center justify-between mt-4 mb-6">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 items-center justify-center bg-white rounded-full shadow-sm"
          >
            <ArrowLeft size={20} color="#0F172A" />
          </TouchableOpacity>
          <Text
            className="text-2xl text-text-primary ml-4"
            style={{ fontFamily: 'Montserrat_700Bold' }}
          >
            My Tickets
          </Text>
        </View>
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center bg-primary/10 rounded-full"
          onPress={() => navigation.navigate('SupportRequest')}
        >
          <Plus size={20} color="#6366F1" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View>
          {[1, 2, 3].map(i => <Skeleton key={i} width="100%" height={120} className="mb-4 rounded-3xl" />)}
        </View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <TicketCard item={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={() => (
            <View className="items-center justify-center py-20 px-10">
              <View className="w-20 h-20 bg-white rounded-full items-center justify-center shadow-sm mb-6 border border-border/30">
                <Ticket size={32} color="#CBD5E1" />
              </View>
              <Text className="text-lg font-poppins-700 text-text-primary mb-2 text-center">No active tickets</Text>
              <Text className="text-sm text-text-secondary font-poppins-400 text-center mb-8">
                Need technical help or have a question? Our team is ready to assist.
              </Text>
              <Button
                title="Open a Ticket"
                onPress={() => navigation.navigate('SupportRequest')}
                className="w-full shadow-sm"
              />
            </View>
          )}
        />
      )}
    </Screen>
  );
};

export default MyTicketsScreen;
