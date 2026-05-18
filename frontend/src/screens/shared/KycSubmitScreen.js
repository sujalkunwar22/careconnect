import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform, Alert } from 'react-native';
import Screen from '../../components/common/Screen';
import Button from '../../components/common/Button';
import Checkbox from '../../components/common/Checkbox';
import { Camera, Image as ImageIcon, CheckCircle, ArrowLeft, ShieldCheck, HelpCircle, AlertTriangle, Upload } from 'lucide-react-native';

import useAuthStore from '../../stores/authStore';
import UserService from '../../services/userService';
import * as ImagePicker from 'expo-image-picker';

const KycSubmitScreen = ({ navigation }) => {
  console.log('[KycSubmitScreen] Mounting');
  const { user } = useAuthStore();
  const [docType, setDocType] = useState('citizenship');
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState(null);

  useEffect(() => {
    const fetchExistingKyc = async () => {
      try {
        const response = await UserService.getKYCStatus();
        const docs = Array.isArray(response) ? response : (response?.results || []);
        if (docs.length > 0) {
          const latest = docs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
          if (latest.document_type) setDocType(latest.document_type);
          if (latest.rejection_reason) setRejectionReason(latest.rejection_reason);
        }
      } catch (err) {
        console.warn('Failed to fetch existing KYC status', err);
      }
    };
    fetchExistingKyc();
  }, []);

  useEffect(() => {
    console.log('[KycSubmitScreen] Mounted effect');
    return () => console.log('[KycSubmitScreen] Unmounting');
  }, []);

  const setImageForType = (type, fileMeta) => {
    if (type === 'front') setFrontImage(fileMeta);
    if (type === 'back') setBackImage(fileMeta);
    if (type === 'selfie') setSelfieImage(fileMeta);
  };

  const openWebFileChooser = (type) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const selectedFile = input.files?.[0];
      if (!selectedFile) return;

      setImageForType(type, {
        uri: URL.createObjectURL(selectedFile),
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        file: selectedFile
      });
    };
    input.click();
  };

  const needsBackSide = docType === 'citizenship';

  const pickImage = async (type, useCamera) => {
    try {
      const permission = useCamera 
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permission.status !== 'granted') {
        Alert.alert('Permission Denied', `We need ${useCamera ? 'camera' : 'gallery'} permissions to upload documents.`);
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
          });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setImageForType(type, {
          uri: asset.uri,
          name: asset.fileName || `${type}.jpg`,
          type: 'image/jpeg',
          size: asset.fileSize,
        });
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleUploadDocument = async (type) => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      openWebFileChooser(type);
      return;
    }

    Alert.alert(
      'Upload Document',
      'Choose a source',
      [
        { text: 'Take Photo', onPress: () => pickImage(type, true) },
        { text: 'Choose from Gallery', onPress: () => pickImage(type, false) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSubmit = async () => {
    const currentStatus = String(user?.kyc_status || '').toLowerCase();
    if (['pending', 'submitted', 'in_review'].includes(currentStatus)) {
      Alert.alert('Request Already Sent', 'Your verification request is already in review.');
      navigation.replace('KycStatus');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('document_type', docType);
      
      if (Platform.OS === 'web') {
        formData.append('front_image', frontImage.file);
        if (needsBackSide) {
          formData.append('back_image', backImage.file);
        }
        formData.append('selfie_image', selfieImage.file);
      } else {
        formData.append('front_image', { uri: frontImage.uri, name: 'front.jpg', type: 'image/jpeg' });
        if (needsBackSide) {
          formData.append('back_image', { uri: backImage.uri, name: 'back.jpg', type: 'image/jpeg' });
        }
        formData.append('selfie_image', { uri: selfieImage.uri, name: 'selfie.jpg', type: 'image/jpeg' });
      }

      await UserService.uploadKyc(formData);
      
      try {
        const fetchProfile = useAuthStore.getState().fetchProfile;
        if (fetchProfile) {
          await fetchProfile();
        } else {
          const profile = await UserService.getProfile();
          useAuthStore.getState().setUser(profile);
        }
      } catch (e) {
        console.warn('Failed to refresh profile after KYC submission', e);
      }

      setIsLoading(false);
      navigation.replace('KycStatus');
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Upload Failed', error.message || 'An error occurred during upload');
    }
  };


  const requiredFields = [frontImage, selfieImage];
  if (needsBackSide) requiredFields.splice(1, 0, backImage);
  
  const progress = requiredFields.filter(Boolean).length;
  const totalSteps = needsBackSide ? 3 : 2;
  const isFormValid = progress === totalSteps && agreed;

  const PhotoPlaceholder = ({ title, fileMeta, onPress, subtitle }) => (
    <View className="mb-5">
      <Text className="text-slate-700 font-bold text-sm mb-1">{title}</Text>
      {subtitle && <Text className="text-slate-400 font-medium text-xs mb-3">{subtitle}</Text>}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        className={`h-44 border-2 border-dashed rounded-[20px] items-center justify-center overflow-hidden
          ${fileMeta ? 'border-[#10b981] bg-[#10b981]/5' : 'border-slate-200 bg-white'}`}
      >
        {fileMeta ? (
          <View className="items-center">
            <View className="w-16 h-16 bg-[#10b981]/15 rounded-full items-center justify-center mb-3">
              <CheckCircle size={32} color="#10b981" />
            </View>
            <Text className="text-[#10b981] font-bold">Document Captured</Text>
            <Text className="text-slate-400 font-medium text-xs mt-1" numberOfLines={1}>
              {fileMeta.name || 'Tap to retake'}
            </Text>
          </View>
        ) : (
          <View className="items-center">
            <View className="w-16 h-16 bg-slate-50 rounded-full items-center justify-center mb-3 border border-slate-100">
              <Upload size={28} color="#94a3b8" />
            </View>
            <View className="flex-row items-center">
              <Text className="text-slate-600 font-bold">Take Photo</Text>
              <Text className="text-slate-300 font-medium mx-2">or</Text>
              <Text className="text-primary font-bold">Upload</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <Screen scrollable className="bg-[#FAFAFA]" style={{ paddingHorizontal: 0 }}>
      {/* Premium Header */}
      <View className="bg-primary px-6 pt-6 pb-20 rounded-b-[40px] shadow-lg shadow-primary/20">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 items-center justify-center bg-white/20 rounded-full border border-white/30"
          >
            <ArrowLeft size={22} color="#ffffff" />
          </TouchableOpacity>
          <View className="flex-row items-center bg-white/20 px-3 py-1.5 rounded-full border border-white/30">
            <ShieldCheck size={14} color="#ffffff" />
            <Text className="text-white font-bold text-xs ml-1.5">Safe & Secure</Text>
          </View>
        </View>

        <View className="items-center mt-2">
          <View className="w-14 h-14 bg-white/15 rounded-2xl items-center justify-center border border-white/25 mb-3">
            <ShieldCheck size={28} color="#ffffff" />
          </View>
          <Text className="text-2xl text-white font-bold">Verify Identity</Text>
          <Text className="text-white/70 text-xs font-medium mt-1">
            Step {progress + 1 > totalSteps ? totalSteps : progress + 1} of {totalSteps}: Upload your documents
          </Text>
        </View>
      </View>

      <View className="px-5 -mt-8">
        {/* Progress Bar Card */}
        <View className="bg-white rounded-[20px] p-4 mb-6 border border-slate-100 shadow-md shadow-slate-200/50">
          <View className="flex-row justify-between mb-2">
            <Text className="text-xs text-slate-500 font-bold">Progress</Text>
            <Text className="text-xs text-primary font-bold">{Math.round((progress / totalSteps) * 100)}%</Text>
          </View>
          <View className="flex-row h-2 bg-slate-100 rounded-full overflow-hidden">
            <View
              className="h-full bg-primary rounded-full"
              style={{ width: `${(progress / totalSteps) * 100}%` }}
            />
          </View>
        </View>

        {rejectionReason && (
          <View className="mb-6 p-4 bg-[#ef4444]/5 border border-[#ef4444]/20 rounded-[20px]">
            <View className="flex-row items-center mb-1">
              <AlertTriangle size={16} color="#ef4444" />
              <Text className="text-[#ef4444] font-bold text-sm ml-2">Previous Rejection:</Text>
            </View>
            <Text className="text-slate-500 font-medium text-xs italic ml-6">"{rejectionReason}"</Text>
          </View>
        )}

        {/* Document Type Selector */}
        <View className="mb-6">
          <Text className="text-slate-700 font-bold text-sm mb-3">Select Document Type</Text>
          <View className="flex-row gap-3">
            {['citizenship', 'passport', 'license'].map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setDocType(type)}
                className={`flex-1 py-3.5 border-2 rounded-2xl items-center ${docType === type ? 'border-primary bg-primary/5' : 'border-slate-200 bg-white'}`}
              >
                <Text className={`capitalize font-bold text-xs ${docType === type ? 'text-primary' : 'text-slate-400'}`}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <PhotoPlaceholder
          title="Front Side"
          subtitle="Ensure all details are clearly visible"
          fileMeta={frontImage}
          onPress={() => handleUploadDocument('front')}
        />

        {needsBackSide && (
          <PhotoPlaceholder
            title="Back Side"
            subtitle="Ensure the address and dates are readable"
            fileMeta={backImage}
            onPress={() => handleUploadDocument('back')}
          />
        )}

        <PhotoPlaceholder
          title="Selfie with Document"
          subtitle="Hold the document near your face"
          fileMeta={selfieImage}
          onPress={() => handleUploadDocument('selfie')}
        />

        <View className="bg-white p-4 rounded-[20px] mb-6 flex-row items-center border border-slate-100">
          <View className="w-8 h-8 bg-slate-50 rounded-xl items-center justify-center mr-3">
            <HelpCircle size={16} color="#94a3b8" />
          </View>
          <Text className="text-slate-500 font-medium text-xs flex-1 leading-5">
            We use this information only for verification purposes and it will not be shared with anyone.
          </Text>
        </View>

        <Checkbox
          label="I agree to the Terms & Conditions and Privacy Policy for KYC verification."
          checked={agreed}
          onPress={() => setAgreed(!agreed)}
          containerClassName="mb-8"
        />

        <Button
          title="Submit for Verification"
          onPress={handleSubmit}
          disabled={!isFormValid}
          isLoading={isLoading}
          size="lg"
          className="mb-10 shadow-lg shadow-primary/20 rounded-2xl"
        />
      </View>
    </Screen>
  );
};

export default KycSubmitScreen;
