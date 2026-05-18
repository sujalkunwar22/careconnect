import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, Image, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Screen from '../../components/common/Screen';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import {
  ArrowLeft,
  MessageSquare,
  AlertTriangle,
  Send,
  Image as ImageIcon,
  Layout,
  ChevronDown
} from 'lucide-react-native';
import SupportService from '../../services/supportService';
import Toast from 'react-native-toast-message';

const SupportRequestScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'Normal',
  });
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need permission to access your gallery.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!formData.subject || !formData.description) return;

    setIsLoading(true);
    console.log('[SupportRequest] Submitting ticket:', formData.subject);
    
    try {
      const payload = {
        subject: formData.subject,
        description: formData.description,
        priority: formData.priority.toLowerCase(),
      };

      if (image) {
        if (Platform.OS === 'web') {
          console.log('[SupportRequest] Web environment detected, preparing file...');
          try {
            // On web, we need to fetch the blob from the URI
            const fetchRes = await fetch(image.uri);
            const blob = await fetchRes.blob();
            
            // Determine filename and type safely
            const fileName = image.fileName || `upload_${Date.now()}.jpg`;
            const mimeType = image.mimeType || blob.type || 'image/jpeg';
            
            payload.attachment = new File([blob], fileName, { type: mimeType });
            console.log(`[SupportRequest] Prepared web file: ${fileName} (${mimeType})`);
          } catch (fetchErr) {
            console.error('[SupportRequest] Failed to process image for web:', fetchErr);
          }
        } else {
          const filename = image.uri.split('/').pop();
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image`;
          
          payload.attachment = {
            uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
            name: filename,
            type: type,
          };
          console.log('[SupportRequest] Prepared RN file:', filename);
        }
      }

      console.log('[SupportRequest] Submitting ticket with payload:', { ...payload, attachment: payload.attachment ? '[File]' : 'None' });
      const response = await SupportService.createTicket(payload);
      console.log('[SupportRequest] Submission successful:', response);

      navigation.replace('Success', {
        title: 'Ticket Submitted',
        message: 'Your request has been received. Our support team will respond within 24 hours.',
        buttonLabel: 'View My Tickets',
        nextScreen: 'MyTickets'
      });

    } catch (error) {
      console.error('[SupportRequest] Failed to submit ticket:', error);
      
      // Better error message extraction
      let errorDetail = 'Could not submit your request. Please try again.';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorDetail = error.response.data;
        } else {
          // Flatten DRF error object
          errorDetail = Object.entries(error.response.data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('\n');
        }
      } else if (error.message) {
        errorDetail = error.message;
      }
      
      Toast.show({
        type: 'error',
        text1: 'Submission Failed',
        text2: errorDetail.length > 50 ? errorDetail.substring(0, 50) + '...' : errorDetail
      });

      Alert.alert("Submission Failed", errorDetail);
    } finally {
      setIsLoading(false);
    }
  };

  const priorities = [
    { label: 'Low', color: '#94A3B8' },
    { label: 'Normal', color: '#3B82F6' },
    { label: 'High', color: '#EF4444' },
  ];

  return (
    <Screen className="bg-surface">
      {/* Header */}
      <View className="flex-row items-center mt-4 mb-6">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center bg-white rounded-full"
          style={{
            shadowColor: '#0f172a',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text
          className="text-2xl text-text-primary ml-4"
          style={{ fontFamily: 'Montserrat_700Bold' }}
        >
          Contact Us
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="text-sm text-text-secondary font-poppins-400 mb-8 leading-6 px-1">
          Having trouble? Describe the issue you're facing or leave feedback. We usually reply within 24 hours.
        </Text>

        <Card className="bg-white border-none shadow-sm p-6 mb-6">
          <Input
            label="Subject"
            placeholder="What do you need help with?"
            value={formData.subject}
            onChangeText={(val) => setFormData({ ...formData, subject: val })}
            containerClassName="mb-6"
          />

          <Text className="text-sm font-poppins-600 text-text-primary mb-3">Priority Level</Text>
          <View className="flex-row gap-3 mb-6">
            {priorities.map((prio) => {
              const isSelected = formData.priority === prio.label;
              return (
                <TouchableOpacity
                  key={prio.label}
                  onPress={() => setFormData({ ...formData, priority: prio.label })}
                  className="flex-1 py-3 rounded-2xl border items-center justify-center"
                  style={isSelected ? {
                    backgroundColor: '#6366F1', // primary
                    borderColor: '#6366F1',
                    shadowColor: '#6366F1',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    elevation: 4,
                  } : {
                    backgroundColor: '#F8FAFC', // slate-50/surface
                    borderColor: 'rgba(226, 232, 240, 0.3)',
                  }}
                >
                  <Text className={`text-xs font-poppins-600 ${isSelected ? 'text-white' : 'text-text-secondary'}`}>
                    {prio.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          <Text className="text-sm font-poppins-600 text-text-primary mb-3">Your Message</Text>
          <TextInput
            className="bg-surface border border-border/50 rounded-2xl p-4 font-poppins-400 text-sm text-text-primary h-40 mb-6"
            placeholder="Provide as much detail as possible (e.g. error messages, what you were doing)..."
            placeholderTextColor="#CBD5E1"
            multiline
            textAlignVertical="top"
            value={formData.description}
            onChangeText={(val) => setFormData({ ...formData, description: val })}
          />

          {!!image && (
            <TouchableOpacity 
              onPress={pickImage}
              className="mb-8 rounded-2xl overflow-hidden border border-border/30"
            >
              <Image source={{ uri: image.uri }} className="w-full h-48" resizeMode="cover" />
              <View className="absolute top-3 right-3 bg-white/90 rounded-full p-2 shadow-sm">
                <ImageIcon size={16} color="#94A3B8" />
              </View>
            </TouchableOpacity>
          )}

          {!image && (
            <TouchableOpacity 
              onPress={pickImage}
              className="h-20 border-2 border-dashed rounded-2xl items-center justify-center flex-row mb-8"
              style={{
                borderColor: 'rgba(226, 232, 240, 0.5)',
                backgroundColor: '#F8FAFC',
              }}
            >
              <ImageIcon size={20} color="#94A3B8" />
              <Text className="text-sm font-poppins-500 text-text-secondary ml-3">Attach Evidence (Optional)</Text>
            </TouchableOpacity>
          )}

          <Button
            title="Submit Ticket"
            icon={Send}
            onPress={handleSubmit}
            isLoading={isLoading}
            disabled={!formData.subject || !formData.description}
            className="py-4 shadow-lg shadow-primary/30"
          />
        </Card>
      </ScrollView>
    </Screen>
  );
};

export default SupportRequestScreen;
