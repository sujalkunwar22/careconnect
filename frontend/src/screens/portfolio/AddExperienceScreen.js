import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { ArrowLeft, Save, Briefcase, Calendar, MapPin, CheckCircle2 } from 'lucide-react-native';
import Screen from '../../components/common/Screen';
import PortfolioService from '../../services/portfolioService';

const AddExperienceScreen = ({ navigation, route }) => {
  const item = route.params?.item;
  const isEditing = !!item;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    job_title: item?.job_title || '',
    organization: item?.organization || '',
    start_date: item?.start_date || new Date().toISOString().split('T')[0],
    end_date: item?.end_date || '',
    is_current: item?.is_current || false,
    description: item?.description || '',
  });

  const handleSave = async () => {
    if (!formData.job_title || !formData.organization || !formData.start_date) {
      Alert.alert('Error', 'Please fill in Job Title, Organization and Start Date');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        end_date: formData.is_current ? null : (formData.end_date || null),
      };
      
      if (isEditing) {
        await PortfolioService.updateExperience(item.id, payload);
        navigation.navigate('Success', {
          title: 'Experience Updated',
          message: 'Your professional experience has been successfully updated.',
          buttonLabel: 'Back to Portfolio',
          nextScreen: 'Portfolio'
        });
      } else {
        await PortfolioService.addExperience(payload);
        navigation.navigate('Success', {
          title: 'Experience Added',
          message: 'New experience entry has been successfully added to your profile.',
          buttonLabel: 'Back to Portfolio',
          nextScreen: 'Portfolio'
        });
      }
    } catch (error) {
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'add'} experience: ` + (error.response?.data?.detail || 'Invalid data'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scrollable className="bg-surface">
      <View className="flex-row items-center mb-6 px-4 pt-4">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center bg-white rounded-full shadow-sm mr-3"
        >
          <ArrowLeft size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-[#0F172A]" style={{ fontFamily: 'Poppins_700Bold' }}>{isEditing ? 'Edit Experience' : 'Add Experience'}</Text>
      </View>

      <View className="px-4 gap-6 mb-10">
        <View className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <View className="mb-4">
            <Text className="text-sm font-semibold text-[#475569] mb-2">Job Title</Text>
            <View className="flex-row items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4">
              <Briefcase size={18} color="#485f84" />
              <TextInput
                className="flex-1 py-3 ml-2"
                value={formData.job_title}
                onChangeText={(t) => setFormData({...formData, job_title: t})}
                placeholder="e.g. Registered Nurse"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-[#475569] mb-2">Organization</Text>
            <View className="flex-row items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4">
              <MapPin size={18} color="#485f84" />
              <TextInput
                className="flex-1 py-3 ml-2"
                value={formData.organization}
                onChangeText={(t) => setFormData({...formData, organization: t})}
                placeholder="e.g. Bir Hospital"
              />
            </View>
          </View>

          <View className="flex-row gap-4 mb-4">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-[#475569] mb-2">Start Date</Text>
              <TextInput
                className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3"
                value={formData.start_date}
                onChangeText={(t) => setFormData({...formData, start_date: t})}
                placeholder="YYYY-MM-DD"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-[#475569] mb-2">End Date</Text>
              <TextInput
                className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3"
                value={formData.end_date}
                onChangeText={(t) => setFormData({...formData, end_date: t})}
                placeholder="YYYY-MM-DD"
                editable={!formData.is_current}
              />
            </View>
          </View>

          <TouchableOpacity 
            onPress={() => setFormData({...formData, is_current: !formData.is_current})}
            className="flex-row items-center mb-4"
          >
            <View className={`w-5 h-5 border rounded mr-2 items-center justify-center ${formData.is_current ? 'bg-success border-success' : 'border-outline'}`}>
              {formData.is_current && <CheckCircle2 size={14} color="white" />}
            </View>
            <Text className="text-sm text-[#475569]">I am currently working in this role</Text>
          </TouchableOpacity>

          <View className="mb-6">
            <Text className="text-sm font-semibold text-[#475569] mb-2">Description</Text>
            <TextInput
              className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 min-h-[100px]"
              value={formData.description}
              onChangeText={(t) => setFormData({...formData, description: t})}
              placeholder="Describe your role and achievements..."
              multiline
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity 
            onPress={handleSave}
            disabled={loading}
            className="bg-[#6366F1] py-4 rounded-xl flex-row items-center justify-center shadow-md"
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <CheckCircle2 size={20} color="white" className="mr-2" />
                <Text className="text-white font-bold text-lg">{isEditing ? 'Update Experience' : 'Save Experience'}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
};

export default AddExperienceScreen;
