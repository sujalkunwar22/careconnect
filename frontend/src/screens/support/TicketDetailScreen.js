import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Linking } from 'react-native';
import Screen from '../../components/common/Screen';
import { 
  ArrowLeft, 
  User, 
  Clock, 
  CheckCircle, 
  ExternalLink,
  MessageSquare,
  AlertCircle
} from 'lucide-react-native';
import SupportService from '../../services/supportService';
import Badge from '../../components/common/Badge';
import Skeleton from '../../components/common/Skeleton';

const TicketDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const data = await SupportService.getTickets();
        const ticketList = data.results || data;
        const found = Array.isArray(ticketList) ? ticketList.find(t => t.id === id) : null;
        setTicket(found);
      } catch (error) {
        console.error('Error fetching ticket detail:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id]);

  const getStatusConfig = (status) => {
    if (!status) return { variant: 'neutral', icon: Clock, label: 'Pending' };
    switch (status.toLowerCase()) {
      case 'in_progress':
      case 'open':
        return { variant: 'warning', icon: Clock, label: 'Active' };
      case 'resolved':
      case 'closed':
        return { variant: 'success', icon: CheckCircle, label: 'Resolved' };
      default:
        return { variant: 'neutral', icon: Clock, label: status };
    }
  };

  if (loading) {
    return (
      <Screen className="bg-background">
        <View className="p-6">
          <Skeleton width={100} height={40} className="mb-6 rounded-full" />
          <Skeleton width="100%" height={150} className="mb-6 rounded-3xl" />
          <Skeleton width="100%" height={200} className="rounded-3xl" />
        </View>
      </Screen>
    );
  }

  if (!ticket) {
    return (
      <Screen className="bg-background">
        <View className="flex-1 items-center justify-center p-10">
          <AlertCircle size={48} color="#CBD5E1" />
          <Text className="text-text-primary font-poppins-700 text-lg mt-4">Ticket not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4">
            <Text className="text-primary font-poppins-600">Go Back</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  const config = getStatusConfig(ticket.status);

  return (
    <Screen className="bg-background">
      <View className="px-6 pt-6 flex-row items-center mb-6">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="w-8 h-8 items-center justify-center bg-white rounded-full shadow-sm mr-3"
        >
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-lg font-poppins-700 text-text-primary">Ticket Details</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 60 }}>
        <View className="bg-white rounded-3xl p-6 shadow-sm border border-border/30 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[10px] font-poppins-600 text-text-secondary uppercase tracking-widest">Ticket #{ticket.id.toString().padStart(4, '0')}</Text>
            <Badge
              label={config.label}
              variant={config.variant}
              icon={config.icon}
              containerClassName="h-6 px-2.5"
            />
          </View>

          <Text className="text-xl font-poppins-700 text-text-primary mb-4">{ticket.subject}</Text>
          
          <View className="flex-row items-center">
            <Clock size={14} color="#94A3B8" className="mr-1" />
            <Text className="text-xs text-text-tertiary font-poppins-400">
              Submitted on {new Date(ticket.created_at).toLocaleString()}
            </Text>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-sm font-poppins-700 text-text-primary mb-3 ml-1">Your Message</Text>
          <View className="bg-white rounded-3xl p-5 shadow-sm border border-border/30">
            <Text className="text-sm font-poppins-400 text-text-secondary leading-6">
              {ticket.description}
            </Text>
          </View>
        </View>

        {ticket.attachment && (
          <View className="mb-6">
            <Text className="text-sm font-poppins-700 text-text-primary mb-3 ml-1">Evidence Attachment</Text>
            <TouchableOpacity 
              className="bg-white rounded-3xl p-2 shadow-sm border border-border/30"
              onPress={() => Linking.openURL(ticket.attachment)}
            >
              <Image 
                source={{ uri: ticket.attachment }} 
                className="w-full h-48 rounded-2xl"
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
        )}

        <View className="mb-6">
          <Text className="text-sm font-poppins-700 text-text-primary mb-3 ml-1">Support Response</Text>
          <View className={`rounded-3xl p-6 shadow-sm border ${ticket.response ? 'bg-primary/5 border-primary/10' : 'bg-slate-50 border-slate-100'}`}>
            {ticket.response ? (
              <>
                <View className="flex-row items-center mb-3">
                  <View className="w-8 h-8 bg-primary rounded-full items-center justify-center mr-2">
                    <MessageSquare size={16} color="#fff" />
                  </View>
                  <Text className="text-sm font-poppins-700 text-primary">Admin Reply</Text>
                </View>
                <Text className="text-sm font-poppins-400 text-text-secondary leading-6 italic">
                  "{ticket.response}"
                </Text>
              </>
            ) : (
              <View className="items-center py-4">
                <Clock size={32} color="#CBD5E1" />
                <Text className="text-sm font-poppins-500 text-text-tertiary mt-3 text-center">
                  Our team is reviewing your ticket. We'll get back to you shortly.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
};

export default TicketDetailScreen;
