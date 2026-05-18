import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Screen from '../../components/common/Screen';
import Card from '../../components/common/Card';
import {
  ArrowLeft,
  Download,
  ShieldCheck,
  ClipboardList,
  Briefcase,
  ChevronRight,
  Info
} from 'lucide-react-native';

const UserManualScreen = ({ navigation }) => {
  const sections = [
    {
      id: '1',
      title: 'Verifying Your Identity',
      icon: ShieldCheck,
      color: '#10B981',
      content: "Navigate to your profile and tap 'Verify Identity'. You will need clear photos of your Citizenship document (front and back) and a clear selfie. Approvals take up to 24 hours."
    },
    {
      id: '2',
      title: 'Logging Care Activities',
      icon: ClipboardList,
      color: '#6366F1',
      content: "To build your portfolio, go to Dashboard > '+' icon. Record your hours, category, and attach a photo if possible for faster NGO verification.",
      items: ['Title & Category', 'Hours spent', 'Evidence (Optional)']
    },
    {
      id: '3',
      title: 'Applying for Care Jobs',
      icon: Briefcase,
      color: '#3B82F6',
      content: "Verified caregivers can apply for jobs in the 'Jobs' tab. Simply open a job card and tap 'Apply'. Track progress in 'My Applications'."
    }
  ];

  return (
    <Screen className="bg-surface">
      {/* Header matching Help Center style */}
      <View className="flex-row items-center px-6 py-4">
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
          User Manual
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="bg-surface px-6 pt-4"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-primary/10 rounded-3xl items-center justify-center mb-4 border border-primary/20">
            <Text className="text-2xl font-poppins-700 text-primary">CN</Text>
          </View>
          <Text
            className="text-2xl text-text-primary mb-2 text-center"
            style={{ fontFamily: 'Montserrat_700Bold' }}
          >
            App User Guide
          </Text>
          <Text className="text-xs font-poppins-600 text-primary uppercase tracking-widest">Version 1.2 • Offline</Text>
        </View>

        {sections.map((section) => (
          <View key={section.id} className="mb-10">
            <View className="flex-row items-center mb-4">
              <View
                className="w-10 h-10 rounded-2xl items-center justify-center mr-4"
                style={{ backgroundColor: section.color + '15' }}
              >
                <section.icon size={20} color={section.color} />
              </View>
              <Text
                className="text-lg text-text-primary"
                style={{ fontFamily: 'Montserrat_600SemiBold' }}
              >
                {section.title}
              </Text>
            </View>
            <View className="ml-14">
              <Text className="text-sm text-text-secondary font-poppins-400 leading-7 mb-4">
                {section.content}
              </Text>
              {section.items && (
                <Card className="bg-white border-none shadow-xs p-4 border border-border/30">
                  <View className="flex-row items-center mb-2">
                    <Info size={14} color="#CBD5E1" />
                    <Text className="text-[10px] font-poppins-700 text-text-secondary uppercase ml-2 tracking-wider">Required Fields</Text>
                  </View>
                  {section.items.map((item, idx) => (
                    <Text key={idx} className="text-xs font-poppins-500 text-text-primary mb-2 last:mb-0">• {item}</Text>
                  ))}
                </Card>
              )}
            </View>
          </View>
        ))}

        <TouchableOpacity className="bg-white border border-border/30 p-5 rounded-3xl items-center flex-row justify-between mb-8">
          <View>
            <Text className="text-sm font-poppins-600 text-text-primary">Need more help?</Text>
            <Text className="text-xs text-text-secondary font-poppins-400">Contact our volunteer support team</Text>
          </View>
          <ChevronRight size={20} color="#6366F1" />
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
};

export default UserManualScreen;
