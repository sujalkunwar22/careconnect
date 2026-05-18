import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import Screen from '../../components/common/Screen';
import Card from '../../components/common/Card';
import {
  Search,
  MessageCircle,
  Ticket,
  BookOpen,
  Rocket,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  X,
  HelpCircle,
  Sparkles
} from 'lucide-react-native';

const faqs = [
  {
    id: '1',
    category: 'Activity',
    question: 'How do I log my care hours?',
    answer: 'Navigate to the Activities tab and tap the "+" button. Fill in the required details including category, duration, and optional photo evidence to submit it for verification.'
  },
  {
    id: '2',
    category: 'Verification',
    question: 'How does verification work?',
    answer: 'Once you submit an activity, our trusted NGO partners review the details and any attached evidence. Verified hours count towards your official digital portfolio and milestones.'
  },
  {
    id: '3',
    category: 'Jobs',
    question: 'Can I apply for paid jobs?',
    answer: 'Yes! Browse the Jobs tab to find both volunteer and paid opportunities posted by verified NGOs. You can apply directly through the app.'
  },
  {
    id: '4',
    category: 'Rewards',
    question: 'How do I earn certificates?',
    answer: 'Certificates are automatically awarded when you hit specific milestones (e.g., 100 hours of Elderly Care) or when you complete verified training programs.'
  }
];

const HelpCenterScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState('1');

  const filteredFaqs = useMemo(() => {
    return faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <Screen className="bg-[#FAFAFA]" style={{ paddingHorizontal: 0 }}>
      {/* Premium Header */}
      <View className="bg-primary px-6 pt-6 pb-20 rounded-b-[40px] shadow-lg shadow-primary/20">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 items-center justify-center bg-white/20 rounded-full border border-white/30 mr-3"
          >
            <ArrowLeft size={20} color="#ffffff" />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl text-white font-bold">Help Center</Text>
            <Text className="text-white/70 text-xs font-medium">We're here to help</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        <View className="px-5 -mt-8">
          {/* Floating Search Bar */}
          <View className="flex-row items-center bg-white border border-slate-100 rounded-2xl px-4 h-14 mb-6 shadow-md shadow-slate-200/50">
            <Search size={20} color="#94a3b8" />
            <TextInput
              className="flex-1 ml-3 text-sm font-medium text-slate-800 h-full"
              placeholder="Search FAQs & articles..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Categories */}
          <View className="flex-row justify-between mb-6 gap-3">
            {[
              { label: 'Contact', icon: MessageCircle, screen: 'SupportRequest', color: '#3b82f6' },
              { label: 'Tickets', icon: Ticket, screen: 'MyTickets', color: '#10b981' },
              { label: 'Manual', icon: BookOpen, screen: 'UserManual', color: '#f59e0b' },
            ].map((cat, idx) => (
              <TouchableOpacity
                key={idx}
                className="flex-1 bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm items-center"
                onPress={() => navigation.navigate(cat.screen)}
              >
                <View
                  className="w-12 h-12 rounded-2xl items-center justify-center mb-2"
                  style={[{ borderWidth: 0, backgroundColor: cat.color + '15' }, Platform.OS === 'web' && { outlineStyle: 'none' }]}
                >
                  <cat.icon size={22} color={cat.color} />
                </View>
                <Text className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Tutorials */}
          <Text className="text-lg text-slate-800 font-bold mb-4">Quick Tutorials</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
            <TouchableOpacity 
              className="bg-primary p-5 rounded-[24px] w-52 mr-4 shadow-lg shadow-primary/20"
              onPress={() => navigation.navigate('UserManual', { section: 'getting-started' })}
            >
              <Rocket size={28} color="white" style={{ marginBottom: 12 }} />
              <Text className="text-white font-bold text-base mb-1">Getting Started Guide</Text>
              <Text className="text-white/70 text-[10px] font-bold uppercase tracking-wider">2 MIN READ</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="bg-[#485f84] p-5 rounded-[24px] w-52 shadow-lg shadow-[#485f84]/20"
              onPress={() => navigation.navigate('UserManual', { section: 'portfolio' })}
            >
              <PlayCircle size={28} color="white" style={{ marginBottom: 12 }} />
              <Text className="text-white font-bold text-base mb-1">Building Your Portfolio</Text>
              <Text className="text-white/70 text-[10px] font-bold uppercase tracking-wider">3 MIN VIDEO</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* FAQs */}
          <Text className="text-lg text-slate-800 font-bold mb-4">Frequently Asked Questions</Text>
          <View className="bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-sm">
            {filteredFaqs.map((faq, index) => {
              const isExpanded = expandedFaq === faq.id;
              return (
                <View key={faq.id}>
                  <TouchableOpacity
                    className={`flex-row justify-between items-center p-5 ${isExpanded ? 'bg-primary/5' : ''}`}
                    onPress={() => setExpandedFaq(isExpanded ? null : faq.id)}
                  >
                    <View className="flex-row items-center flex-1 pr-4">
                      <View className={`w-8 h-8 rounded-xl items-center justify-center mr-3 ${isExpanded ? 'bg-primary/10' : 'bg-slate-50'}`}>
                        <Sparkles size={14} color={isExpanded ? '#6366F1' : '#94a3b8'} />
                      </View>
                      <Text className={`flex-1 font-bold text-sm ${isExpanded ? 'text-primary' : 'text-slate-700'}`}>
                        {faq.question}
                      </Text>
                    </View>
                    {isExpanded ? <ChevronUp size={18} color="#6366F1" /> : <ChevronDown size={18} color="#94a3b8" />}
                  </TouchableOpacity>
                  {isExpanded && (
                    <View className="px-5 pb-5 bg-primary/5">
                      <Text className="text-sm text-slate-600 font-medium leading-6 ml-11">{faq.answer}</Text>
                      <View className="mt-4 flex-row items-center bg-white px-3 py-2 rounded-xl border border-slate-100 self-start ml-11">
                        <Text className="text-[10px] text-slate-400 font-bold mr-4">Helpful?</Text>
                        <TouchableOpacity className="mr-4"><ThumbsUp size={14} color="#10b981" /></TouchableOpacity>
                        <TouchableOpacity><ThumbsDown size={14} color="#ef4444" /></TouchableOpacity>
                      </View>
                    </View>
                  )}
                  {index !== filteredFaqs.length - 1 && <View className="h-[1px] bg-slate-100 mx-5" />}
                </View>
              );
            })}
            {filteredFaqs.length === 0 && (
              <View className="py-10 items-center">
                <HelpCircle size={32} color="#cbd5e1" />
                <Text className="text-sm font-bold text-slate-400 mt-2">No matching questions found.</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
};

export default HelpCenterScreen;
