import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert, Linking, Platform } from 'react-native';
import Screen from '../../components/common/Screen';
import { 
  ArrowLeft, 
  MessageSquare, 
  User, 
  Clock, 
  CheckCircle, 
  Trash2, 
  ExternalLink,
  Image as ImageIcon,
  Send
} from 'lucide-react-native';
import AdminService from '../../services/adminService';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Toast from 'react-native-toast-message';

const AdminTicketDetailScreen = ({ route, navigation }) => {
  const { id, ticket: initialTicket } = route.params;
  const [ticket, setTicket] = useState(initialTicket);
  const [response, setResponse] = useState(ticket.response || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdateStatus = async (newStatus) => {
    try {
      setIsSubmitting(true);
      const updated = await AdminService.updateTicket(id, { status: newStatus });
      setTicket(updated);
      Toast.show({
        type: 'success',
        text1: 'Status Updated',
        text2: `Ticket is now marked as ${newStatus}`
      });
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to update status' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendResponse = async () => {
    if (!response.trim()) {
      Toast.show({ type: 'error', text1: 'Response Required', text2: 'Please enter a message' });
      return;
    }

    try {
      setIsSubmitting(true);
      const updated = await AdminService.updateTicket(id, { 
        response: response,
        status: 'resolved' 
      });
      setTicket(updated);
      Toast.show({
        type: 'success',
        text1: 'Response Sent',
        text2: 'The user has been notified and ticket is resolved'
      });
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to send response' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Ticket",
      "Are you sure you want to permanently delete this support ticket?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeleting(true);
              await AdminService.deleteTicket(id);
              Toast.show({ type: 'success', text1: 'Deleted', text2: 'Ticket removed successfully' });
              navigation.goBack();
            } catch (error) {
              console.error(error);
              Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to delete ticket' });
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  const getStatusConfig = (status) => {
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

  const config = getStatusConfig(ticket.status);

  return (
    <Screen className="bg-background">
      <View className="px-6 pt-6 flex-row items-center justify-between mb-6">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="w-8 h-8 items-center justify-center bg-white rounded-full shadow-sm"
        >
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-lg font-poppins-700 text-text-primary">Ticket Details</Text>
        <TouchableOpacity onPress={handleDelete} disabled={isDeleting}>
          {isDeleting ? <ActivityIndicator size="small" color="#6366F1" /> : <Trash2 size={20} color="#6366F1" />}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}>
        {/* Header Info */}
        <View className="bg-white rounded-3xl p-6 shadow-sm border border-border/30 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[10px] font-poppins-600 text-text-secondary uppercase">Ticket #{ticket.id.toString().padStart(4, '0')}</Text>
            <Badge
              label={config.label}
              variant={config.variant}
              icon={config.icon}
              containerClassName="h-6 px-2.5"
            />
          </View>

          <Text className="text-xl font-poppins-700 text-text-primary mb-4">{ticket.subject}</Text>
          
          <View className="flex-row items-center mb-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3">
              <User size={20} color="#6366F1" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-poppins-600 text-text-primary">{ticket.user_name || 'Anonymous'}</Text>
              <Text className="text-xs font-poppins-400 text-text-secondary">{ticket.user_email || 'No email provided'}</Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <Clock size={14} color="#94A3B8" className="mr-1" />
            <Text className="text-xs text-text-tertiary font-poppins-400">
              Submitted on {new Date(ticket.created_at).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Message Content */}
        <View className="mb-6">
          <Text className="text-sm font-poppins-700 text-text-primary mb-3 ml-1">Issue Description</Text>
          <View className="bg-white rounded-3xl p-5 shadow-sm border border-border/30">
            <Text className="text-sm font-poppins-400 text-text-secondary leading-6">
              {ticket.description || ticket.message}
            </Text>
          </View>
        </View>

        {/* Attachment */}
        {ticket.attachment && (
          <View className="mb-6">
            <Text className="text-sm font-poppins-700 text-text-primary mb-3 ml-1">Evidence / Attachment</Text>
            <TouchableOpacity 
              className="bg-white rounded-3xl p-2 shadow-sm border border-border/30 overflow-hidden"
              onPress={() => Linking.openURL(ticket.attachment)}
            >
              <Image 
                source={{ uri: ticket.attachment }} 
                className="w-full h-48 rounded-2xl"
                resizeMode="cover"
              />
              <View className="flex-row items-center justify-center py-3">
                <ExternalLink size={14} color="#6366F1" className="mr-2" />
                <Text className="text-xs font-poppins-600 text-primary">View Full Image</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Admin Response Section */}
        <View className="mb-6">
          <Text className="text-sm font-poppins-700 text-text-primary mb-3 ml-1">Your Response</Text>
          <View className="bg-white rounded-3xl p-5 shadow-sm border border-border/30">
            <TextInput
              multiline
              numberOfLines={6}
              placeholder="Type your response here..."
              className="text-sm font-poppins-400 text-text-primary min-h-[120px]"
              textAlignVertical="top"
              value={response}
              onChangeText={setResponse}
              editable={ticket.status !== 'resolved'}
            
                    style={Platform.OS === 'web' ? { outlineStyle: 'none', borderWidth: 0, backgroundColor: 'transparent' } : {}}
                    />
            
            {ticket.status !== 'resolved' ? (
              <TouchableOpacity 
                className="bg-primary flex-row items-center justify-center py-4 rounded-2xl mt-4 shadow-md"
                onPress={handleSendResponse}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Send size={18} color="#fff" className="mr-2" />
                    <Text className="text-white font-poppins-700">Send Response & Resolve</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <View className="flex-row items-center justify-center py-3 bg-green-50 rounded-2xl mt-4 border border-green-100">
                <CheckCircle size={16} color="#059669" className="mr-2" />
                <Text className="text-green-700 font-poppins-600 text-xs">This ticket has been resolved</Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        {ticket.status !== 'resolved' && (
          <View className="flex-row gap-3 mb-10">
            <TouchableOpacity 
              className="flex-1 bg-white border border-border/50 py-3 rounded-2xl items-center"
              onPress={() => handleUpdateStatus('in_progress')}
              disabled={isSubmitting}
            >
              <Text className="text-text-primary font-poppins-600 text-xs">Mark In Progress</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-1 bg-white border border-green-200 py-3 rounded-2xl items-center"
              onPress={() => handleUpdateStatus('resolved')}
              disabled={isSubmitting}
            >
              <Text className="text-green-600 font-poppins-600 text-xs">Mark Resolved</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
};

export default AdminTicketDetailScreen;
