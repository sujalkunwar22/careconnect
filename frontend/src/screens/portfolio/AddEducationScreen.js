import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { ArrowLeft, Save, GraduationCap, Calendar, MapPin, CheckCircle2 } from 'lucide-react-native';
import Screen from '../../components/common/Screen';
import PortfolioService from '../../services/portfolioService';

const AddEducationScreen = ({ navigation, route }) => {
  const item = route.params?.item;
  const isEditing = !!item;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    degree: item?.degree || '',
    institution: item?.institution || '',
    field_of_study: item?.field_of_study || '',
    start_year: item?.start_year?.toString() || '',
    end_year: item?.end_year?.toString() || '',
  });

  const handleSave = async () => {
    if (!formData.degree || !formData.institution || !formData.start_year) {
      Alert.alert('Error', 'Please fill in Degree, Institution and Start Year');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        start_year: parseInt(formData.start_year),
        end_year: formData.end_year ? parseInt(formData.end_year) : null,
      };
      
      if (isEditing) {
        await PortfolioService.updateEducation(item.id, payload);
        navigation.navigate('Success', {
          title: 'Education Updated',
          message: 'Your educational details have been successfully updated.',
          buttonLabel: 'Back to Portfolio',
          nextScreen: 'Portfolio'
        });
      } else {
        await PortfolioService.addEducation(payload);
        navigation.navigate('Success', {
          title: 'Education Added',
          message: 'New education entry has been successfully added to your profile.',
          buttonLabel: 'Back to Portfolio',
          nextScreen: 'Portfolio'
        });
      }
    } catch (error) {
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'add'} education: ` + (error.response?.data?.detail || 'Invalid data'));
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
        <Text className="text-2xl font-bold text-[#0F172A]" style={{ fontFamily: 'Poppins_700Bold' }}>{isEditing ? 'Edit Education' : 'Add Education'}</Text>
      </View>

      <View className="px-4 gap-6 mb-10">
        <View className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <View className="mb-4">
            <Text className="text-sm font-semibold text-[#475569] mb-2">Degree / Certification Name</Text>
            <View className="flex-row items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4">
              <GraduationCap size={18} color="#485f84" />
              <TextInput
                className="flex-1 py-3 ml-2"
                value={formData.degree}
                onChangeText={(t) => setFormData({...formData, degree: t})}
                placeholder="e.g. BSc in Nursing"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-[#475569] mb-2">Institution / School</Text>
            <View className="flex-row items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4">
              <MapPin size={18} color="#485f84" />
              <TextInput
                className="flex-1 py-3 ml-2"
                value={formData.institution}
                onChangeText={(t) => setFormData({...formData, institution: t})}
                placeholder="e.g. Tribhuvan University"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-[#475569] mb-2">Field of Study (Optional)</Text>
            <TextInput
              className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3"
              value={formData.field_of_study}
              onChangeText={(t) => setFormData({...formData, field_of_study: t})}
              placeholder="e.g. Healthcare Management"
            />
          </View>

          <View className="flex-row gap-4 mb-6">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-[#475569] mb-2">Start Year</Text>
              <TextInput
                className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3"
                value={formData.start_year}
                onChangeText={(t) => setFormData({...formData, start_year: t})}
                placeholder="2018"
                keyboardType="number-pad"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-[#475569] mb-2">End Year (Optional)</Text>
              <TextInput
                className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3"
                value={formData.end_year}
                onChangeText={(t) => setFormData({...formData, end_year: t})}
                placeholder="2022"
                keyboardType="number-pad"
              />
            </View>
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
                <Text className="text-white font-bold text-lg">{isEditing ? 'Update Education' : 'Save Education'}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
};

export default AddEducationScreen;
