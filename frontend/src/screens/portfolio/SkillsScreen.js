import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import Screen from '../../components/common/Screen';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import {
    Star,
    Award,
    CheckCircle,
    Plus,
    Info,
    ArrowLeft,
    ChevronRight,
    ShieldCheck,
    TrendingUp,
    Heart,
    Baby,
    Activity
} from 'lucide-react-native';

const SkillsScreen = ({ navigation }) => {
    const [skills, setSkills] = useState([
        { id: '1', name: 'Elderly Companion Care', level: 'Expert', endorsements: 12, verified: true, icon: Heart, color: '#6366F1' },
        { id: '2', name: 'First Aid & CPR', level: 'Intermediate', endorsements: 5, verified: true, icon: Activity, color: '#3B82F6' },
        { id: '3', name: 'Child Nutrition', level: 'Advanced', endorsements: 8, verified: false, icon: Baby, color: '#F4D03F' },
    ]);

    const suggestedSkills = [
        { name: 'Patient Mobility', icon: TrendingUp },
        { name: 'Medication Management', icon: ShieldCheck },
    ];

    const SkillCard = ({ item }) => {
        const Icon = item.icon;
        return (
            <Card className="mb-4 bg-white border-none shadow-sm p-5">
                <View className="flex-row items-center mb-4">
                    <View
                        className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                        style={{ backgroundColor: `${item.color}15` }}
                    >
                        <Icon size={24} color={item.color} />
                    </View>
                    <View className="flex-1">
                        <View className="flex-row items-center">
                            <Text className="text-lg font-poppins-600 text-text-primary mr-2">{item.name}</Text>
                            {item.verified && <ShieldCheck size={16} color="#10B981" />}
                        </View>
                        <View className="flex-row items-center mt-1">
                            <Badge label={item.level} variant="info" containerClassName="h-5 px-2" textClassName="text-[10px]" />
                            <View className="flex-row items-center ml-3">
                                <Star size={12} color="#F4D03F" fill="#F4D03F" />
                                <Text className="text-xs text-text-secondary font-poppins-500 ml-1">{item.endorsements} endorsements</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <TouchableOpacity className="flex-row items-center justify-between bg-surface p-3 rounded-xl border border-border/30">
                    <Text className="text-xs font-poppins-500 text-text-secondary">Request endorsement from NGO</Text>
                    <Plus size={16} color="#6366F1" />
                </TouchableOpacity>
            </Card>
        );
    };

    return (
        <Screen className="bg-surface">
            {/* Header */}
            <View className="flex-row items-center justify-between mt-4 mb-6">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="w-10 h-10 items-center justify-center bg-white rounded-full shadow-sm"
                >
                    <ArrowLeft size={20} color="#0F172A" />
                </TouchableOpacity>
                <Text
                    className="text-xl text-text-primary"
                    style={{ fontFamily: 'Montserrat_700Bold' }}
                >
                    Skills & Endorsements
                </Text>
                <TouchableOpacity className="w-10 h-10 items-center justify-center bg-primary/10 rounded-full">
                    <Plus size={20} color="#6366F1" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Verification Status Card */}
                <Card className="bg-primary/5 border-primary/20 p-5 mb-8 flex-row items-center">
                    <Award size={32} color="#6366F1" />
                    <View className="flex-1 ml-4">
                        <Text className="text-sm font-poppins-600 text-text-primary">Gain 5 more endorsements</Text>
                        <Text className="text-xs text-text-secondary font-poppins-400 mt-1">To unlock the "Silver Caregiver" badge on your profile.</Text>
                    </View>
                </Card>

                {/* My Skills Section */}
                <View className="mb-8">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text
                            className="text-lg text-text-primary"
                            style={{ fontFamily: 'Montserrat_600SemiBold' }}
                        >
                            My Verified Skills
                        </Text>
                        <TouchableOpacity>
                            <Text className="text-xs font-poppins-600 text-primary">View All</Text>
                        </TouchableOpacity>
                    </View>

                    {skills.map(skill => <SkillCard key={skill.id} item={skill} />)}
                </View>

                {/* Suggested Skills */}
                <View>
                    <View className="flex-row items-center mb-4">
                        <TrendingUp size={18} color="#10B981" />
                        <Text
                            className="text-lg text-text-primary ml-2"
                            style={{ fontFamily: 'Montserrat_600SemiBold' }}
                        >
                            Suggested for you
                        </Text>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                        {suggestedSkills.map((skill, idx) => (
                            <TouchableOpacity
                                key={idx}
                                className="bg-white p-4 rounded-2xl mr-4 border border-border/30 shadow-xs flex-row items-center"
                            >
                                <skill.icon size={16} color="#94A3B8" />
                                <Text className="text-sm font-poppins-600 text-text-primary ml-2">{skill.name}</Text>
                                <Plus size={16} color="#6366F1" className="ml-3" />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View className="bg-blue-50 p-4 rounded-2xl flex-row items-start border border-blue-100">
                        <Info size={16} color="#3B82F6" className="mt-0.5" />
                        <Text className="text-xs text-text-secondary font-poppins-400 flex-1 ml-3 leading-5">
                            Suggestions are based on your recent activity logs in Elderly Care. Add these to attract more NGOs.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </Screen>
    );
};

export default SkillsScreen;
