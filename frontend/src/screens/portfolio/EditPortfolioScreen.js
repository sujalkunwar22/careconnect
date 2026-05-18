import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { ArrowLeft, Save, Plus, Trash2, Briefcase, GraduationCap, Award, CheckCircle2 } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../../components/common/Screen';
import useAuthStore from '../../stores/authStore';
import UserService from '../../services/userService';
import PortfolioService from '../../services/portfolioService';

const EditPortfolioScreen = ({ navigation }) => {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // User details state
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    professional_title: user?.professional_title || '',
    bio: user?.bio || '',
    skills: Array.isArray(user?.skills) ? user.skills.join(', ') : (user?.skills || ''),
    address: user?.address || '',
  });

  // Education & Experience state
  const [experiences, setExperiences] = useState([]);
  const [education, setEducation] = useState([]);
  const [certifications, setCertifications] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      fetchPortfolioData();
    }, [])
  );

  const fetchPortfolioData = async () => {
    try {
      const [expData, eduData, certData] = await Promise.all([
        PortfolioService.getExperiences(),
        PortfolioService.getEducation(),
        PortfolioService.getCertifications()
      ]);
      console.log('[EditPortfolio] Fetched experiences:', expData?.length, expData?.[0]);
      setExperiences(expData || []);
      setEducation(eduData || []);
      setCertifications(certData || []);
    } catch (error) {
      console.error('[EditPortfolio] Fetch error:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
      };
      const updatedUser = await UserService.updateProfile(payload);
      setUser(updatedUser);
      navigation.navigate('Success', {
        title: 'Profile Updated',
        message: 'Your basic professional information has been successfully saved.',
        buttonLabel: 'Back to Portfolio',
        nextScreen: 'Portfolio'
      });
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExperience = async () => {
    // For simplicity in this edit screen, we'll just show a prompt or navigate to another screen
    // But let's try a simple inline add for demonstration or just navigate to a dedicated form
    navigation.navigate('AddActivity', { type: 'experience' }); 
    // Wait, AddActivity might be for care logs. Let's check if there's a dedicated screen.
  };

  const handleDeleteExperience = async (id) => {
    console.log('[EditPortfolio] handleDeleteExperience called with ID:', id);
    if (!id) {
      Alert.alert('Error', 'This item is missing an ID and cannot be deleted.');
      return;
    }

    const performDelete = async () => {
      try {
        console.log('[EditPortfolio] Proceeding with deletion for ID:', id);
        await PortfolioService.deleteExperience(id);
        setExperiences(prev => prev.filter(e => (e.id || e.uuid) !== id));
        Alert.alert('Success', 'Experience deleted');
      } catch (error) {
        console.error('[DeleteExperience] Error:', error);
        const msg = error.response?.data?.detail || error.message || 'Failed to delete';
        Alert.alert('Error', msg);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this experience?')) {
        performDelete();
      }
    } else {
      Alert.alert('Delete', 'Are you sure you want to delete this experience?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: performDelete }
      ]);
    }
  };

  const handleDeleteEducation = async (id) => {
    console.log('[EditPortfolio] handleDeleteEducation called with ID:', id);
    if (!id) {
      Alert.alert('Error', 'This item is missing an ID and cannot be deleted.');
      return;
    }

    const performDelete = async () => {
      try {
        console.log('[EditPortfolio] Proceeding with deletion for ID:', id);
        await PortfolioService.deleteEducation(id);
        setEducation(prev => prev.filter(e => (e.id || e.uuid) !== id));
        Alert.alert('Success', 'Education entry deleted');
      } catch (error) {
        console.error('[DeleteEducation] Error:', error);
        const msg = error.response?.data?.detail || error.message || 'Failed to delete';
        Alert.alert('Error', msg);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this education entry?')) {
        performDelete();
      }
    } else {
      Alert.alert('Delete', 'Are you sure you want to delete this education entry?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: performDelete }
      ]);
    }
  };

  const handleDeleteCertification = async (id) => {
    console.log('[EditPortfolio] handleDeleteCertification called with ID:', id);
    if (!id) {
      Alert.alert('Error', 'This item is missing an ID and cannot be deleted.');
      return;
    }

    const performDelete = async () => {
      try {
        console.log('[EditPortfolio] Proceeding with deletion for ID:', id);
        await PortfolioService.deleteCertification(id);
        setCertifications(prev => prev.filter(c => (c.id || c.uuid) !== id));
        Alert.alert('Success', 'Certification deleted');
      } catch (error) {
        console.error('[DeleteCertification] Error:', error);
        const msg = error.response?.data?.detail || error.message || 'Failed to delete';
        Alert.alert('Error', msg);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this certification?')) {
        performDelete();
      }
    } else {
      Alert.alert('Delete', 'Delete this certification?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: performDelete }
      ]);
    }
  };

// Already replaced above

  if (fetching) {
    return (
      <Screen className="bg-surface items-center justify-center">
        <ActivityIndicator size="large" color="#6366F1" />
      </Screen>
    );
  }

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
          <Text className="text-2xl font-bold text-[#0F172A]" style={{ fontFamily: 'Poppins_700Bold' }}>Edit Portfolio</Text>
        </View>
        <TouchableOpacity 
          onPress={handleSaveProfile}
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
        {/* Basic Info Section */}
        <View className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <Text className="text-lg font-bold text-[#485f84] mb-4" style={{ fontFamily: 'Poppins_600SemiBold' }}>Basic Information</Text>
          
          <View className="mb-4">
            <Text className="text-sm font-semibold text-[#475569] mb-2">Full Name</Text>
            <TextInput
              className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3"
              value={formData.full_name}
              onChangeText={(t) => setFormData({...formData, full_name: t})}
              placeholder="Your full name"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-[#475569] mb-2">Professional Title</Text>
            <TextInput
              className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3"
              value={formData.professional_title}
              onChangeText={(t) => setFormData({...formData, professional_title: t})}
              placeholder="e.g. Registered Nurse, Senior Health Assistant"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-[#475569] mb-2">Location</Text>
            <TextInput
              className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3"
              value={formData.address}
              onChangeText={(t) => setFormData({...formData, address: t})}
              placeholder="City, District"
            />
          </View>
        </View>

        {/* Expertise & Summary Section */}
        <View className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <Text className="text-lg font-bold text-[#485f84] mb-4" style={{ fontFamily: 'Poppins_600SemiBold' }}>Expertise & Summary</Text>
          
          <View className="mb-4">
            <Text className="text-sm font-semibold text-[#475569] mb-2">Expertise (Skills, comma separated)</Text>
            <TextInput
              className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3"
              value={formData.skills}
              onChangeText={(t) => setFormData({...formData, skills: t})}
              placeholder="Elderly Care, Wound Management, First Aid"
              multiline
            />
          </View>

          <View className="mb-2">
            <Text className="text-sm font-semibold text-[#475569] mb-2">Professional Summary</Text>
            <TextInput
              className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 min-h-[100px]"
              value={formData.bio}
              onChangeText={(t) => setFormData({...formData, bio: t})}
              placeholder="Brief overview of your career and goals"
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Experience Section */}
        <View className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-[#485f84]" style={{ fontFamily: 'Poppins_600SemiBold' }}>Experience</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('AddExperience')}
              className="bg-[#EEF2FF] p-2 rounded-lg"
            >
              <Plus size={20} color="#6366F1" />
            </TouchableOpacity>
          </View>

          {experiences.map((exp) => (
            <View key={exp.id || exp.uuid} className="flex-row items-center justify-between py-3 border-b border-[#f1f5f9]">
              <TouchableOpacity 
                className="flex-1 flex-row items-center"
                onPress={() => navigation.navigate('AddExperience', { item: exp })}
              >
                <View className="w-10 h-10 bg-[#e0f0f8] rounded-lg items-center justify-center mr-3">
                  <Briefcase size={18} color="#286182" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-[#0F172A]" numberOfLines={1}>{exp.job_title || exp.title}</Text>
                  <Text className="text-xs text-[#475569]">{exp.organization || exp.company}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleDeleteExperience(exp.id || exp.uuid)} 
                className="p-3 bg-red-100/50 rounded-full"
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              >
                <Trash2 size={18} color="#6366F1" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Education Section */}
        <View className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-[#485f84]" style={{ fontFamily: 'Poppins_600SemiBold' }}>Education</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('AddEducation')}
              className="bg-[#FEF3C7] p-2 rounded-lg"
            >
              <Plus size={20} color="#B45309" />
            </TouchableOpacity>
          </View>

          {education.map((edu) => (
            <View key={edu.id || edu.uuid} className="flex-row items-center justify-between py-3 border-b border-[#f1f5f9]">
              <TouchableOpacity 
                className="flex-1 flex-row items-center"
                onPress={() => navigation.navigate('AddEducation', { item: edu })}
              >
                <View className="w-10 h-10 bg-[#FEF3C7] rounded-lg items-center justify-center mr-3">
                  <GraduationCap size={18} color="#B45309" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-[#0F172A]" numberOfLines={1}>{edu.degree}</Text>
                  <Text className="text-xs text-[#475569]">{edu.institution}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleDeleteEducation(edu.id || edu.uuid)} 
                className="p-3 bg-red-100/50 rounded-full"
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              >
                <Trash2 size={18} color="#6366F1" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Certifications Section */}
        <View className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm mb-10">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-[#485f84]" style={{ fontFamily: 'Poppins_600SemiBold' }}>Certifications</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('AddCertification')}
              className="bg-[#fde8ea] p-2 rounded-lg"
            >
              <Plus size={20} color="#6366F1" />
            </TouchableOpacity>
          </View>

          {certifications.map((cert) => (
            <View key={cert.id || cert.uuid} className="flex-row items-center justify-between py-3 border-b border-[#f1f5f9]">
              <TouchableOpacity 
                className="flex-1 flex-row items-center"
                onPress={() => navigation.navigate('AddCertification', { item: cert })}
              >
                <View className="w-10 h-10 bg-[#fde8ea] rounded-lg items-center justify-center mr-3">
                  <Award size={18} color="#6366F1" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-[#0F172A]" numberOfLines={1}>{cert.name}</Text>
                  <Text className="text-xs text-[#475569]">{cert.issuer}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleDeleteCertification(cert.id || cert.uuid)} 
                className="p-3 bg-red-100/50 rounded-full"
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              >
                <Trash2 size={18} color="#6366F1" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
};

export default EditPortfolioScreen;
