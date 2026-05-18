import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import Screen from '../../components/common/Screen';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { 
  ArrowLeft, 
  Briefcase, 
  MapPin, 
  Calendar, 
  Layout,
  ChevronRight,
  ClipboardList
} from 'lucide-react-native';

const PostJobStep1Screen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    type: 'Full-Time',
    location: '',
    deadline: '',
    description: ''
  });

  const categories = ['Healthcare', 'Education', 'Engineering', 'Social Work', 'Other'];
  const types = ['Full-Time', 'Part-Time', 'Contract', 'Volunteer'];

  const handleNext = () => {
    if (!formData.title || !formData.category || !formData.location) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    // In a multi-step form, we'd navigate to Step 2
    // For now, let's just mock the next step or submit if it's the only one
    Alert.alert('Job Posted', 'Job posting successfully created (Demo).', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <Screen scrollable className="bg-background">
      {/* Header */}
      <View className="px-6 pt-4 flex-row items-center justify-between mb-8">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center bg-white rounded-full shadow-sm"
        >
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-lg font-poppins-700 text-text-primary">Post a Job</Text>
        <View className="w-10" />
      </View>

      <View className="px-6 pb-10">
        {/* Progress */}
        <View className="flex-row items-center mb-8 px-2">
          <View className="w-8 h-8 rounded-full bg-primary items-center justify-center">
            <Text className="text-white font-poppins-700 text-xs">1</Text>
          </View>
          <View className="flex-1 h-[2px] bg-slate-100 mx-2" />
          <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center">
            <Text className="text-slate-400 font-poppins-700 text-xs">2</Text>
          </View>
          <View className="flex-1 h-[2px] bg-slate-100 mx-2" />
          <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center">
            <Text className="text-slate-400 font-poppins-700 text-xs">3</Text>
          </View>
        </View>

        <View className="bg-white rounded-3xl p-6 shadow-sm border border-border/50 mb-8">
          <View className="flex-row items-center mb-6">
            <View className="w-10 h-10 bg-primary/10 rounded-xl items-center justify-center mr-3">
              <ClipboardList size={20} color="#6366F1" />
            </View>
            <Text className="text-lg font-poppins-700 text-text-primary">Basic Information</Text>
          </View>

          <View className="space-y-6">
            <View>
              <Text className="text-text-primary font-poppins-600 text-xs mb-2">Job Title *</Text>
              <TextInput
                className="bg-slate-50 border border-border rounded-2xl p-4 text-text-primary font-poppins-400"
                placeholder="e.g., Senior Outreach Officer"
                value={formData.title}
                onChangeText={(val) => setFormData({...formData, title: val})}
              />
            </View>

            <View>
              <Text className="text-text-primary font-poppins-600 text-xs mb-2">Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setFormData({...formData, category: cat})}
                    className={`mr-2 px-4 py-2.5 rounded-xl border ${formData.category === cat ? 'bg-secondary border-secondary' : 'bg-slate-50 border-border'}`}
                  >
                    <Text className={`font-poppins-600 text-[10px] ${formData.category === cat ? 'text-white' : 'text-text-secondary'}`}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View>
              <Text className="text-text-primary font-poppins-600 text-xs mb-2">Employment Type *</Text>
              <View className="flex-row flex-wrap gap-2">
                {types.map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setFormData({...formData, type})}
                    className={`px-4 py-2 rounded-xl border ${formData.type === type ? 'bg-primary border-primary' : 'bg-slate-50 border-border'}`}
                  >
                    <Text className={`font-poppins-600 text-[10px] ${formData.type === type ? 'text-white' : 'text-text-secondary'}`}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text className="text-text-primary font-poppins-600 text-xs mb-2">Location *</Text>
              <View className="flex-row items-center bg-slate-50 border border-border rounded-2xl px-4">
                <MapPin size={16} color="#94A3B8" />
                <TextInput
                  className="flex-1 ml-2 py-4 text-text-primary font-poppins-400"
                  placeholder="e.g., Kathmandu, Nepal"
                  value={formData.location}
                  onChangeText={(val) => setFormData({...formData, location: val})}
                />
              </View>
            </View>

            <View>
              <Text className="text-text-primary font-poppins-600 text-xs mb-2">Application Deadline</Text>
              <View className="flex-row items-center bg-slate-50 border border-border rounded-2xl px-4">
                <Calendar size={16} color="#94A3B8" />
                <TextInput
                  className="flex-1 ml-2 py-4 text-text-primary font-poppins-400"
                  placeholder="YYYY-MM-DD"
                  value={formData.deadline}
                  onChangeText={(val) => setFormData({...formData, deadline: val})}
                />
              </View>
            </View>

            <View>
              <Text className="text-text-primary font-poppins-600 text-xs mb-2">Job Description</Text>
              <TextInput
                className="bg-slate-50 border border-border rounded-2xl p-4 text-text-primary font-poppins-400 h-32"
                placeholder="Describe the role and responsibilities..."
                multiline
                textAlignVertical="top"
                value={formData.description}
                onChangeText={(val) => setFormData({...formData, description: val})}
              />
            </View>
          </View>
        </View>

        <Button
          title="Continue to Next Step"
          onPress={handleNext}
          className="shadow-lg"
          icon={<ChevronRight size={20} color="white" />}
        />
      </View>
    </Screen>
  );
};

export default PostJobStep1Screen;
