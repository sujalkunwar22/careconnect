import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, Platform } from 'react-native';
import Screen from '../../components/common/Screen';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import JobsService from '../../services/jobsService';
import AdminService from '../../services/adminService';
import useAuthStore from '../../stores/authStore';
import {
  Heart,
  Baby,
  Activity,
  Home as HomeIcon,
  MapPin,
  DollarSign,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Info
} from 'lucide-react-native';

const categories = [
  { id: 'Elderly', label: 'Elderly', icon: Heart, color: '#6366F1' },
  { id: 'Childcare', label: 'Childcare', icon: Baby, color: '#F4D03F' },
  { id: 'Disability', label: 'Disability', icon: Activity, color: '#3B82F6' },
  { id: 'Household', label: 'Household', icon: HomeIcon, color: '#10B981' },
];

const PostJobScreen = ({ navigation, route }) => {
  const { jobToEdit } = route.params || {};
  const isEditing = !!jobToEdit;
  const user = useAuthStore(state => state.user);
  const isAdmin = user?.role === 'admin';

  const [formData, setFormData] = useState({
    title: jobToEdit?.title || '',
    category: jobToEdit?.category || '',
    salary_range: jobToEdit?.salary_min ? String(jobToEdit.salary_min) : '',
    job_type: jobToEdit?.employment_type === 'volunteer' ? 'volunteer' : 'paid',
    duration: jobToEdit?.duration || '',
    location: jobToEdit?.location || '',
    description: jobToEdit?.description || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: null, message: null });

  const handleSubmit = async () => {
    console.log('[PostJob] handleSubmit triggered');
    setSubmitStatus({ type: null, message: null });

    if (!formData.title || !formData.category || !formData.description) {
      const msg = "Please fill in the required fields (Title, Category, and Description).";
      setSubmitStatus({ type: 'error', message: msg });
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert("Missing Fields", msg);
      return;
    }

    setIsLoading(true);
    try {
      const salaryStr = String(formData.salary_range || '');
      const salaryNum = parseInt(salaryStr.replace(/[^0-9]/g, ''));
      
      const payload = {
        title: formData.title,
        category: formData.category,
        location: formData.location || 'Nepal',
        description: formData.description,
        employment_type: formData.job_type === 'volunteer' ? 'volunteer' : 'full_time',
        status: 'Active',
        salary_min: isNaN(salaryNum) ? null : salaryNum,
        remote: (formData.location || '').toLowerCase().includes('remote'),
        requirements: [] // Default requirements to empty list
      };

      console.log('[PostJob] Sending payload:', payload);
      
      if (isEditing) {
        if (isAdmin) {
          await AdminService.updateJob(jobToEdit.id, payload);
        } else {
          await JobsService.updateNgoJob(jobToEdit.id, payload);
        }
      } else {
        await JobsService.postJob(payload);
      }
      
      setSubmitStatus({ type: 'success', message: isEditing ? "Job Updated Successfully!" : "Job Published Successfully!" });
      
      const successMsg = isEditing ? "Your care opportunity has been updated." : "Your care opportunity is now live!";
      if (Platform.OS === 'web') {
        alert(successMsg);
        navigation.goBack();
      } else {
        Alert.alert(
          isEditing ? "Job Updated!" : "Job Published!",
          successMsg,
          [{ text: "Great", onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('[PostJob] Error:', error);
      const errorMsg = error.response?.data?.detail || 
                       (error.response?.data ? JSON.stringify(error.response?.data) : null) || 
                       error.message || 
                       "Failed to publish job.";
      setSubmitStatus({ type: 'error', message: errorMsg });
      if (Platform.OS === 'web') alert("Error: " + errorMsg);
      else Alert.alert("Submission Error", errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen className="bg-surface">
      {/* Header */}
      <View className="flex-row items-center mt-4 mb-6">
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
          {isEditing ? 'Edit Job' : 'Post a Job'}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Step 1: Basic Info */}
        <View className="mb-8">
          <Text className="text-sm font-poppins-600 text-primary uppercase tracking-widest mb-4">Step 1: Role Details</Text>
          <Card className="bg-white border-none shadow-sm p-6 overflow-hidden">
            <Input
              label="Job Title"
              placeholder="e.g. Senior Companion for Weekend"
              value={formData.title}
              onChangeText={(val) => setFormData({ ...formData, title: val })}
              containerClassName="mb-6"
            />

            <Text className="text-sm font-poppins-600 text-text-primary mb-3">Care Category</Text>
            <View className="flex-row flex-wrap gap-3 mb-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = formData.category === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setFormData({ ...formData, category: cat.id })}
                    className={`flex-row items-center px-4 py-3 rounded-2xl border ${isSelected ? 'bg-primary border-primary shadow-md' : 'bg-surface border-border/50'}`}
                  >
                    <Icon size={16} color={isSelected ? 'white' : cat.color} />
                    <Text className={`text-xs font-poppins-600 ml-2 ${isSelected ? 'text-white' : 'text-text-primary'}`}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </Card>
        </View>

        {/* Step 2: Logistics */}
        <View className="mb-8">
          <Text className="text-sm font-poppins-600 text-primary uppercase tracking-widest mb-4">Step 2: Logistics & Budget</Text>
          <Card className="bg-white border-none shadow-sm p-6">
            <Input
              label="Location"
              placeholder="City or Neighborhood"
              icon={MapPin}
              value={formData.location}
              onChangeText={(val) => setFormData({ ...formData, location: val })}
              containerClassName="mb-6"
            />

            <View className="flex-row gap-4 mb-2">
              <View className="flex-1">
                <Input
                  label="Budget/Rate"
                  placeholder="Rs. or Vol."
                  icon={DollarSign}
                  value={formData.salary_range}
                  onChangeText={(val) => setFormData({ ...formData, salary_range: val })}
                />
              </View>
              <View className="flex-1">
                <Input
                  label="Duration/Schedule"
                  placeholder="e.g. Weekends"
                  icon={Clock}
                  value={formData.duration}
                  onChangeText={(val) => setFormData({ ...formData, duration: val })}
                />
              </View>
            </View>
          </Card>
        </View>

        {/* Step 3: Requirements */}
        <View className="mb-8">
          <Text className="text-sm font-poppins-600 text-primary uppercase tracking-widest mb-4">Step 3: Expectations</Text>
          <Card className="bg-white border-none shadow-sm p-6">
            <Text className="text-sm font-poppins-600 text-text-primary mb-3">Description & Skills Needed</Text>
            <TextInput
              className="bg-surface border border-border/50 rounded-2xl p-4 font-poppins-400 text-sm text-text-primary h-32 mb-6"
              placeholder="Outline responsibilities, required training, and any specific preferences..."
              placeholderTextColor="#CBD5E1"
              multiline
              textAlignVertical="top"
              value={formData.description}
              onChangeText={(val) => setFormData({ ...formData, description: val })}
              style={Platform.OS === 'web' ? { outlineStyle: 'none' } : {}}
            />

            <View className="bg-secondary/5 p-4 rounded-2xl flex-row items-start border border-secondary/10">
              <Info size={16} color="#3B82F6" className="mt-0.5" />
              <Text className="text-[10px] text-text-secondary font-poppins-400 flex-1 ml-3 leading-4">
                Tip: Being specific about requirements helps reduce irrelevant applications.
              </Text>
            </View>
          </Card>
        </View>

        {submitStatus.message && (
          <View className={`mb-4 p-4 rounded-xl ${submitStatus.type === 'success' ? 'bg-success/10' : 'bg-error/10'}`}>
            <Text className={`font-poppins-500 text-sm text-center ${submitStatus.type === 'success' ? 'text-success' : 'text-error'}`}>
              {submitStatus.message}
            </Text>
          </View>
        )}

        <Button
          title={isEditing ? "Save Changes" : "Publish Opportunity"}
          icon={CheckCircle2}
          onPress={handleSubmit}
          isLoading={isLoading}
          className="w-full py-4 shadow-lg shadow-primary/30"
        />
      </ScrollView>
    </Screen>
  );
};

export default PostJobScreen;
