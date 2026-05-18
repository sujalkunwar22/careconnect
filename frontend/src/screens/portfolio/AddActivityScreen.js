import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import Screen from '../../components/common/Screen';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PortfolioService from '../../services/portfolioService';
import {
  ArrowLeft,
  Camera,
  Baby,
  Heart,
  Home as HomeIcon,
  Activity,
  Clock,
  Calendar,
  MapPin,
  CheckCircle,
  AlertCircle
} from 'lucide-react-native';

const AddActivityScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Child',
    hours: '',
    date: new Date().toISOString().split('T')[0], // default to today in YYYY-MM-DD
    description: '',
    location: '',
  });
  const [evidence, setEvidence] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { id: 'Child', icon: Baby, color: '#F4D03F', bg: '#F4D03F15', label: 'Childcare' },
    { id: 'Elderly', icon: Heart, color: '#6366F1', bg: '#6366F115', label: 'Eldercare' },
    { id: 'Community', icon: Activity, color: '#3B82F6', bg: '#3B82F615', label: 'Community' },
    { id: 'Household', icon: HomeIcon, color: '#10B981', bg: '#10B98115', label: 'Household' },
    { id: 'Other', icon: Activity, color: '#94A3B8', bg: '#F8F9FA', label: 'Other' },
  ];

  const handleSubmit = async () => {
    if (!formData.title || !formData.hours || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await PortfolioService.addActivity({
        title: formData.title,
        category: formData.category,
        hours: parseFloat(formData.hours),
        date: formData.date,
        description: formData.description,
        location: formData.location,
      });
      navigation.navigate('Success', {
        title: 'Activity Logged!',
        message: 'Your care activity has been submitted for verification. You will earn points once reviewed.',
        buttonLabel: 'Back to History',
        nextScreen: 'History'
      });
    } catch (err) {
      const msg = err.response?.data?.detail
        || JSON.stringify(err.response?.data)
        || 'Failed to submit activity. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen scrollable className="bg-surface">
      <View className="mt-4 mb-6">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center bg-white rounded-full shadow-sm mb-6"
        >
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text
          className="text-3xl text-text-primary mb-2"
          style={{ fontFamily: 'Montserrat_700Bold' }}
        >
          Log Activity
        </Text>
        <Text className="text-base text-text-secondary font-poppins-400">
          Record your care work to earn recognition & rewards.
        </Text>
      </View>

      <View className="mb-10">
        <Input
          label="Activity Title"
          placeholder="e.g. Preparing meals for elderly neighbor"
          value={formData.title}
          onChangeText={(val) => setFormData({ ...formData, title: val })}
          icon={Activity}
        />

        <Text className="text-sm font-poppins-600 text-text-primary mb-3">Select Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 -mx-1 px-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = formData.category === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setFormData({ ...formData, category: cat.id })}
                activeOpacity={0.8}
                className={`mr-3 px-4 py-3 rounded-2xl border-2 items-center flex-row ${isSelected ? 'border-primary bg-primary/5' : 'border-border bg-white'}`}
              >
                <View className="w-8 h-8 rounded-full items-center justify-center mr-2" style={{ backgroundColor: isSelected ? '#6366F120' : cat.bg }}>
                  <Icon size={18} color={isSelected ? '#6366F1' : cat.color} />
                </View>
                <Text className={`font-poppins-600 text-sm ${isSelected ? 'text-primary' : 'text-text-secondary'}`}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View className="flex-row gap-4">
          <Input
            label="Hours Spent"
            placeholder="e.g. 4"
            keyboardType="number-pad"
            value={formData.hours}
            onChangeText={(val) => setFormData({ ...formData, hours: val })}
            containerClassName="flex-1"
            icon={Clock}
          />
          <Input
            label="Date"
            placeholder="Select Date"
            value={formData.date}
            containerClassName="flex-1"
            icon={Calendar}
            editable={false}
          />
        </View>

        <Input
          label="Location"
          placeholder="e.g. Kathmandu, Ward 4"
          value={formData.location}
          onChangeText={(val) => setFormData({ ...formData, location: val })}
          icon={MapPin}
        />

        <View className="mb-6">
          <Text className="text-sm font-poppins-600 text-text-primary mb-2">Detailed Description</Text>
          <TextInput
            placeholder="Describe the care tasks you performed in detail..."
            className="bg-white border-2 border-border/50 rounded-2xl p-4 text-sm font-poppins-400 min-h-[120px] text-text-primary"
            placeholderTextColor="#94A3B8"
            multiline
            textAlignVertical="top"
            value={formData.description}
            onChangeText={(val) => setFormData({ ...formData, description: val })}
          />
        </View>

        <Text className="text-sm font-poppins-600 text-text-primary mb-3">Evidence (Optional)</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setEvidence('photo_uploaded')}
          className={`h-32 border-2 border-dashed rounded-3xl items-center justify-center mb-10 overflow-hidden
            ${evidence ? 'border-success bg-success/5' : 'border-border bg-white'}`}
        >
          {evidence ? (
            <View className="items-center">
              <CheckCircle size={32} color="#10B981" />
              <Text className="text-success font-poppins-600 mt-2">Document Attached</Text>
              <Text className="text-text-secondary font-poppins-400 text-xs">Tap to change</Text>
            </View>
          ) : (
            <View className="items-center">
              <Camera size={32} color="#94A3B8" />
              <Text className="text-text-secondary font-poppins-600 mt-2">Add Photo or Document</Text>
              <Text className="text-text-secondary font-poppins-400 text-[10px]">Photo, Certificate, or Reference</Text>
            </View>
          )}
        </TouchableOpacity>

        {error ? (
          <View className="flex-row items-center bg-error/10 p-4 rounded-2xl mb-6 border border-error/20">
            <AlertCircle size={18} color="#EF4444" />
            <Text className="text-error font-poppins-400 text-xs ml-2">{error}</Text>
          </View>
        ) : null}

        <Button
          title="Submit Log for Verification"
          onPress={handleSubmit}
          isLoading={isLoading}
          size="lg"
          className="w-full mb-10 shadow-md"
        />
      </View>
    </Screen>
  );
};

export default AddActivityScreen;
