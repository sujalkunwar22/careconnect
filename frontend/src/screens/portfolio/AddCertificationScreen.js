import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { ArrowLeft, Save, Trash2, Award, Calendar } from 'lucide-react-native';
import Screen from '../../components/common/Screen';
import PortfolioService from '../../services/portfolioService';

const AddCertificationScreen = ({ navigation, route }) => {
  const editItem = route.params?.item;
  const isEditing = !!editItem;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: editItem?.name || '',
    issuer: editItem?.issuer || '',
    date: editItem?.date || '',
    description: editItem?.description || '',
  });

  const handleSave = async () => {
    if (!formData.name || !formData.issuer) {
      Alert.alert('Error', 'Please fill in Name and Issuer');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await PortfolioService.updateCertification(editItem.id, formData);
        navigation.navigate('Success', {
          title: 'Certification Updated',
          message: 'Your certification has been successfully updated.',
          buttonLabel: 'Back to Portfolio',
          nextScreen: 'Portfolio'
        });
      } else {
        await PortfolioService.addCertification(formData);
        navigation.navigate('Success', {
          title: 'Certification Added',
          message: 'New certification has been successfully added to your profile.',
          buttonLabel: 'Back to Portfolio',
          nextScreen: 'Portfolio'
        });
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save certification');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert('Delete', 'Delete this certification?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await PortfolioService.deleteCertification(editItem.id);
            navigation.goBack();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete');
          } finally {
            setLoading(false);
          }
        }
      }
    ]);
  };

  return (
    <Screen scrollable className="bg-surface">
      <View className="flex-row items-center justify-between mb-6 px-4 pt-4">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="w-10 h-10 items-center justify-center bg-white rounded-full shadow-sm mr-3"
          >
            <ArrowLeft size={22} color="#0F172A" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-[#0F172A]" style={{ fontFamily: 'Poppins_700Bold' }}>
            {isEditing ? 'Edit Certification' : 'Add Certification'}
          </Text>
        </View>
        <TouchableOpacity 
          onPress={handleSave}
          disabled={loading}
          className="bg-[#6366F1] px-4 py-2 rounded-lg flex-row items-center"
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Save size={18} color="white" className="mr-2" />
              <Text className="text-white font-bold">Save</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View className="px-4 gap-6">
        <View className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <View className="mb-4">
            <Text className="text-sm font-semibold text-[#475569] mb-2">Certification Name</Text>
            <TextInput
              className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3"
              value={formData.name}
              onChangeText={(t) => setFormData({...formData, name: t})}
              placeholder="e.g. ACLS, PALS, Critical Care Cert"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-[#475569] mb-2">Issuing Organization</Text>
            <TextInput
              className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3"
              value={formData.issuer}
              onChangeText={(t) => setFormData({...formData, issuer: t})}
              placeholder="e.g. American Heart Association"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-[#475569] mb-2">Date Obtained</Text>
            <TextInput
              className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3"
              value={formData.date}
              onChangeText={(t) => setFormData({...formData, date: t})}
              placeholder="e.g. June 2023"
            />
          </View>

          <View className="mb-2">
            <Text className="text-sm font-semibold text-[#475569] mb-2">Description (Optional)</Text>
            <TextInput
              className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 min-h-[80px]"
              value={formData.description}
              onChangeText={(t) => setFormData({...formData, description: t})}
              placeholder="Brief details about the certification"
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>

        {isEditing && (
          <TouchableOpacity 
            onPress={handleDelete}
            className="bg-white border border-[#6366F1] p-4 rounded-2xl items-center justify-center flex-row mb-10"
          >
            <Trash2 size={20} color="#6366F1" className="mr-2" />
            <Text className="text-[#6366F1] font-bold">Delete Certification</Text>
          </TouchableOpacity>
        )}
      </View>
    </Screen>
  );
};

export default AddCertificationScreen;
