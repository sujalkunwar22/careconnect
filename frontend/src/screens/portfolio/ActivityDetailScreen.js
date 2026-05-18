import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Screen from '../../components/common/Screen';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import {
    ArrowLeft,
    Calendar,
    Clock,
    MapPin,
    Activity,
    CheckCircle2,
    AlertCircle,
    FileText,
    User,
    MessageSquare
} from 'lucide-react-native';

const ActivityDetailScreen = ({ route, navigation }) => {
    const { activity } = route.params || {};

    if (!activity) {
        return (
            <Screen className="bg-surface items-center justify-center">
                <AlertCircle size={48} color="#EF4444" />
                <Text className="text-lg font-poppins-600 text-text-primary mt-4">Activity not found</Text>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="mt-6 bg-primary px-8 py-3 rounded-2xl"
                >
                    <Text className="text-white font-poppins-600">Go Back</Text>
                </TouchableOpacity>
            </Screen>
        );
    }

    const statusConfig = activity.status === 'verified'
        ? { icon: CheckCircle2, color: '#10B981', label: 'Verified', variant: 'success' }
        : { icon: Clock, color: '#F59E0B', label: 'Pending Verification', variant: 'warning' };

    const StatusIcon = statusConfig.icon;

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
                    className="text-xl text-text-primary ml-4"
                    style={{ fontFamily: 'Montserrat_700Bold' }}
                >
                    Activity Details
                </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Status Banner */}
                <View
                    className="flex-row items-center p-4 rounded-3xl mb-8"
                    style={{ backgroundColor: `${statusConfig.color}15` }}
                >
                    <StatusIcon size={24} color={statusConfig.color} />
                    <View className="ml-4">
                        <Text className="text-sm font-poppins-700" style={{ color: statusConfig.color }}>
                            {statusConfig.label}
                        </Text>
                        <Text className="text-[10px] text-text-secondary font-poppins-400">
                            {activity.status === 'verified'
                                ? 'This activity has been verified by an NGO partner.'
                                : 'Waiting for review by an NGO partner.'}
                        </Text>
                    </View>
                </View>

                {/* Main Content */}
                <Card className="bg-white border-none shadow-sm p-6 mb-8">
                    <View className="flex-row items-center mb-6">
                        <View className="w-12 h-12 bg-primary/10 rounded-2xl items-center justify-center mr-4">
                            <Activity size={24} color="#6366F1" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-2xl text-text-primary mb-1" style={{ fontFamily: 'Montserrat_700Bold' }}>
                                {activity.title}
                            </Text>
                            <Badge label={activity.type} variant="neutral" containerClassName="self-start px-3" />
                        </View>
                    </View>

                    <View className="h-[1px] bg-border/30 mb-6" />

                    {/* Quick Stats Grid */}
                    <View className="flex-row justify-between mb-8">
                        <View className="items-center flex-1">
                            <Clock size={20} color="#94A3B8" />
                            <Text className="text-lg font-poppins-700 text-text-primary mt-1">{activity.hours}h</Text>
                            <Text className="text-[10px] text-text-secondary font-poppins-400 uppercase">Duration</Text>
                        </View>
                        <View className="w-[1px] h-10 bg-border/30" />
                        <View className="items-center flex-1">
                            <Calendar size={20} color="#94A3B8" />
                            <Text className="text-sm font-poppins-600 text-text-primary mt-1">{activity.date}</Text>
                            <Text className="text-[10px] text-text-secondary font-poppins-400 uppercase">Date</Text>
                        </View>
                        <View className="w-[1px] h-10 bg-border/30" />
                        <View className="items-center flex-1">
                            <MapPin size={20} color="#94A3B8" />
                            <Text className="text-sm font-poppins-600 text-text-primary mt-1" numberOfLines={1}>{activity.location}</Text>
                            <Text className="text-[10px] text-text-secondary font-poppins-400 uppercase">Location</Text>
                        </View>
                    </View>

                    <Text className="text-sm font-poppins-600 text-text-primary mb-2">Detailed Description</Text>
                    <Text className="text-sm text-text-secondary font-poppins-400 leading-7">
                        {activity.description}
                    </Text>
                </Card>

                {/* Evidence Section */}
                <Text className="text-lg text-text-primary mb-4" style={{ fontFamily: 'Montserrat_600SemiBold' }}>
                    Verification Evidence
                </Text>
                <Card className="bg-white border-none shadow-sm p-5 mb-8">
                    <View className="flex-row items-center">
                        <View className="w-10 h-10 bg-secondary/10 rounded-xl items-center justify-center mr-4">
                            <FileText size={20} color="#3B82F6" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-sm font-poppins-600 text-text-primary">DailyCare_Log.pdf</Text>
                            <Text className="text-xs text-text-secondary font-poppins-400">Attached on Oct 11, 2023</Text>
                        </View>
                        <TouchableOpacity className="bg-surface px-4 py-2 rounded-xl border border-border/50">
                            <Text className="text-xs font-poppins-600 text-primary">View</Text>
                        </TouchableOpacity>
                    </View>
                </Card>

                {/* Verifier Note (If verified) */}
                {activity.status === 'verified' && (
                    <>
                        <Text className="text-lg text-text-primary mb-4" style={{ fontFamily: 'Montserrat_600SemiBold' }}>
                            NGO Feedback
                        </Text>
                        <Card className="bg-success/5 border-success/10 p-5 mb-8">
                            <View className="flex-row items-center mb-3">
                                <User size={16} color="#10B981" />
                                <Text className="text-sm font-poppins-600 text-text-primary ml-2">Verified by Ramesh at SaveNepal</Text>
                            </View>
                            <View className="flex-row items-start">
                                <MessageSquare size={16} color="#94A3B8" className="mt-1" />
                                <Text className="text-sm text-text-secondary font-poppins-400 italic flex-1 ml-3 leading-6">
                                    "Thank you for your dedicated service. The documentation provided was thorough and correctly logged. Keep up the great work!"
                                </Text>
                            </View>
                        </Card>
                    </>
                )}
            </ScrollView>
        </Screen>
    );
};

export default ActivityDetailScreen;
