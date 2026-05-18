import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, TextInput, ActivityIndicator, Modal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Screen from '../../components/common/Screen';
import Button from '../../components/common/Button';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ZoomIn, 
  User, 
  Calendar, 
  FileText,
  MapPin,
  ShieldCheck
} from 'lucide-react-native';
import AdminService from '../../services/adminService';

const KycReviewScreen = ({ route, navigation }) => {
  const { kycId, kycData } = route.params || {};
  const [kyc, setKyc] = useState(kycData || null);
  const [loading, setLoading] = useState(!kycData);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  const openImagePreview = (uri) => {
    if (uri) setPreviewImage(uri);
  };

  const closeImagePreview = () => setPreviewImage(null);

  useEffect(() => {
    if (kycId && !kycData) {
      fetchKycDetails();
    }
  }, [kycId]);

  const fetchKycDetails = async () => {
    try {
      // In a real app, we'd fetch specific KYC detail if needed
      // For now we assume data is passed or fetched via pending list
      setLoading(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to load KYC details');
      navigation.goBack();
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await AdminService.approveKYC(kyc.id);
      Alert.alert('Success', 'Verification approved successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejection');
      return;
    }

    setActionLoading(true);
    try {
      await AdminService.rejectKYC(kyc.id, rejectionReason);
      Alert.alert('Success', 'Verification rejected');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator size="large" color="#6366F1" />
      </Screen>
    );
  }

  if (!kyc) return null;

  return (
    <Screen scrollable className="bg-background">
      {/* Header */}
      <View className="px-6 pt-4 flex-row items-center justify-between mb-6">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center bg-white rounded-full shadow-sm"
        >
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-lg font-poppins-700 text-text-primary">KYC Review</Text>
        <View className="flex-row items-center bg-amber-100 px-3 py-1 rounded-full">
          <AlertTriangle size={14} color="#B45309" />
          <Text className="text-amber-700 font-poppins-600 text-[10px] ml-1">PENDING</Text>
        </View>
      </View>

      <View className="px-6 mb-8">
        {/* Applicant Summary */}
        <View className="bg-white rounded-3xl p-5 shadow-sm border border-border/50 mb-6">
          <View className="flex-row items-center">
            <View className="w-16 h-16 bg-primary/10 rounded-2xl items-center justify-center mr-4">
              <User size={32} color="#6366F1" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-poppins-700 text-text-primary">
                {kyc.name 
                  || kyc.ngo_name 
                  || kyc.user_name 
                  || kyc.user_email 
                  || kyc.user?.full_name 
                  || kyc.full_name 
                  || (kyc.user ? `${kyc.user.first_name || ''} ${kyc.user.last_name || ''}`.trim() : '') 
                  || kyc.user?.username 
                  || 'Unknown Applicant'}
              </Text>
              <Text className="text-text-secondary font-poppins-500 text-xs">{kyc.type || 'Identity Verification'}</Text>
              <View className="flex-row items-center mt-1">
                <Calendar size={12} color="#94A3B8" />
                <Text className="text-text-secondary font-poppins-400 text-[10px] ml-1">Submitted: {kyc.submitted || 'Oct 24, 2024'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Document Images */}
        <Text className="text-sm font-poppins-700 text-text-primary mb-4 px-1">Verification Documents</Text>
        
        <View className="space-y-4">
          <View className="bg-white rounded-2xl overflow-hidden border border-border shadow-sm">
            <View className="p-3 bg-slate-50 border-b border-border flex-row justify-between items-center">
              <Text className="font-poppins-600 text-xs text-text-primary">Front Side (Citizenship/ID)</Text>
              <TouchableOpacity onPress={() => openImagePreview(kyc.front_image_url || kyc.id_front || kyc.front_image)}>
                <ZoomIn size={16} color="#0F172A" />
              </TouchableOpacity>
            </View>
            <Image 
              source={{ uri: kyc.front_image_url || kyc.id_front || kyc.front_image || 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1000&auto=format&fit=crop' }} 
              className="w-full h-48 bg-slate-200"
              resizeMode="contain"
            />
          </View>
          
          <View className="bg-white rounded-2xl overflow-hidden border border-border shadow-sm">
            <View className="p-3 bg-slate-50 border-b border-border flex-row justify-between items-center">
              <Text className="font-poppins-600 text-xs text-text-primary">Back Side (Citizenship/ID)</Text>
              <TouchableOpacity onPress={() => openImagePreview(kyc.back_image_url || kyc.id_back || kyc.back_image)}>
                <ZoomIn size={16} color="#0F172A" />
              </TouchableOpacity>
            </View>
            <Image 
              source={{ uri: kyc.back_image_url || kyc.id_back || kyc.back_image || 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1000&auto=format&fit=crop' }} 
              className="w-full h-48 bg-slate-200"
              resizeMode="contain"
            />
          </View>

          <View className="bg-white rounded-2xl overflow-hidden border border-border shadow-sm">
            <View className="p-3 bg-slate-50 border-b border-border flex-row justify-between items-center">
              <Text className="font-poppins-600 text-xs text-text-primary">Verification Selfie</Text>
              <TouchableOpacity onPress={() => openImagePreview(kyc.selfie_image_url || kyc.selfie || kyc.selfie_image)}>
                <ZoomIn size={16} color="#0F172A" />
              </TouchableOpacity>
            </View>
            <Image 
              source={{ uri: kyc.selfie_image_url || kyc.selfie || kyc.selfie_image || 'https://images.unsplash.com/photo-1531123897727-8f129e16fd3c?q=80&w=1000&auto=format&fit=crop' }} 
              className="w-full h-48 bg-slate-200"
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Action Panel */}
        <View className="mt-8 bg-white rounded-3xl p-6 shadow-sm border border-border/50">
          <Text className="text-lg font-poppins-700 text-text-primary mb-2">Decision Actions</Text>
          <Text className="text-text-secondary font-poppins-400 text-xs mb-6">Review carefully before making a final decision.</Text>
          
          <Button
            title="Approve Verification"
            onPress={handleApprove}
            isLoading={actionLoading}
            variant="success"
            className="mb-6 shadow-md"
            icon={<ShieldCheck size={20} color="white" />}
          />
          
          <View className="border-t border-border/50 pt-6">
            <Text className="text-sm font-poppins-600 text-text-primary mb-3">Rejection Reason (Required for rejection)</Text>
            <TextInput
              className="bg-background border border-border rounded-xl p-4 text-text-primary font-poppins-400 mb-4 h-24"
              placeholder="e.g., Image is blurry, Document expired..."
              multiline
              textAlignVertical="top"
              value={rejectionReason}
              onChangeText={setRejectionReason}
            
                    style={Platform.OS === 'web' ? { outlineStyle: 'none', borderWidth: 0, backgroundColor: 'transparent' } : {}}
                    />
            <Button
              title="Reject Submission"
              onPress={handleReject}
              isLoading={actionLoading}
              variant="outline"
              className="border-primary"
              textClassName="text-primary"
              icon={<XCircle size={20} color="#6366F1" />}
            />
          </View>
        </View>
      </View>
      <Modal visible={!!previewImage} transparent animationType="fade">
        <View className="flex-1 bg-black/80 items-center justify-center p-4">
          <TouchableOpacity className="absolute top-10 right-6 z-10 p-3" onPress={closeImagePreview}>
            <Text className="text-white font-poppins-600 text-base">Close</Text>
          </TouchableOpacity>
          <Image source={{ uri: previewImage }} className="w-full h-4/5 rounded-3xl" resizeMode="contain" />
        </View>
      </Modal>
    </Screen>
  );
};

export default KycReviewScreen;
