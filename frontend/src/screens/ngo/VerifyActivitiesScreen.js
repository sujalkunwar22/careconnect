import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Screen from '../../components/common/Screen';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import PortfolioService from '../../services/portfolioService';
import {
    ArrowLeft,
    ShieldCheck,
    Clock,
    CheckCircle2,
    XCircle,
    Calendar,
    AlertCircle,
    FileText,
    MapPin
} from 'lucide-react-native';

const VerifyActivitiesScreen = ({ navigation }) => {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchLogs = async () => {
        try {
            setIsLoading(true);
            const data = await PortfolioService.getPendingActivities();
            setLogs(data);
        } catch (error) {
            console.error('Failed to fetch pending activities:', error);
            Alert.alert('Error', 'Failed to load pending activities.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleVerify = (id, action) => {
        Alert.alert(
            action === 'Approve' ? "Verify Hours?" : "Reject Log?",
            `Are you sure you want to ${action.toLowerCase()} this care log?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: action,
                    style: action === 'Approve' ? "default" : "destructive",
                    onPress: async () => {
                        try {
                            const apiAction = action === 'Approve' ? 'verify' : 'reject';
                            await PortfolioService.verifyActivity(id, apiAction);
                            setLogs(logs.filter(log => log.id !== id));
                        } catch (error) {
                            console.error('Failed to update activity:', error);
                            Alert.alert('Error', 'Failed to process the activity review.');
                        }
                    }
                }
            ]
        );
    };

    const LogCard = ({ item }) => (
        <Card className="mb-6 bg-white border-none shadow-sm p-0 overflow-hidden">
            <View className="p-5">
                <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-row items-center">
                        <Avatar
                            label={(item.caregiver_name || 'U').charAt(0)}
                            size="md"
                            containerClassName="bg-primary/5"
                            textClassName="text-primary font-poppins-600"
                        />
                        <View className="ml-3">
                            <Text className="text-base font-poppins-600 text-text-primary">{item.caregiver_name || 'Caregiver'}</Text>
                            <Text className="text-xs text-text-secondary font-poppins-400">
                                {new Date(item.date || item.created_at).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                    <Badge label={item.category || 'Other'} variant="info" />
                </View>

                <View className="bg-surface rounded-2xl p-4 mb-4 border border-border/30">
                    <Text className="text-sm text-text-primary font-poppins-500 mb-1">{item.title || 'Activity Description'}</Text>
                    <Text className="text-xs text-text-secondary font-poppins-400 leading-5 mb-3">{item.description}</Text>

                    <View className="flex-row items-center gap-4">
                        <View className="flex-row items-center">
                            <Clock size={14} color="#6366F1" />
                            <Text className="text-xs font-poppins-700 text-text-primary ml-1.5">{item.hours} Hours</Text>
                        </View>
                        <View className="flex-row items-center">
                            <FileText size={14} color={item.evidence_url ? "#10B981" : "#CBD5E1"} />
                            <Text className="text-xs font-poppins-500 text-text-secondary ml-1.5">
                                {item.evidence_url ? "Evidence Attached" : "No Evidence"}
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="flex-row gap-3">
                    <TouchableOpacity
                        onPress={() => handleVerify(item.id, 'Reject')}
                        className="flex-1 h-12 rounded-xl flex-row items-center justify-center border border-error/20 bg-error/5"
                    >
                        <XCircle size={18} color="#EF4444" />
                        <Text className="text-sm font-poppins-600 text-error ml-2">Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleVerify(item.id, 'Approve')}
                        className="flex-1 h-12 rounded-xl flex-row items-center justify-center bg-success shadow-sm shadow-success/30"
                    >
                        <CheckCircle2 size={18} color="white" />
                        <Text className="text-sm font-poppins-600 text-white ml-2">Verify Log</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Card>
    );

    return (
        <Screen className="bg-surface">
            {/* Header */}
            <View className="flex-row items-center justify-between mt-4 mb-6">
                <View className="flex-row items-center">
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
                        Verify Logs
                    </Text>
                </View>
                <Badge label={logs.length + " Pending"} variant="warning" />
            </View>

            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#6366F1" />
                </View>
            ) : (
                <FlatList
                    data={logs}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => <LogCard item={item} />}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    ListEmptyComponent={() => (
                        <View className="items-center justify-center py-20 px-10">
                            <View className="w-24 h-24 bg-white rounded-full items-center justify-center shadow-sm mb-6 border border-border/30">
                                <CheckCircle2 size={48} color="#10B981" />
                            </View>
                            <Text className="text-xl font-poppins-700 text-text-primary mb-2 text-center">All clear!</Text>
                            <Text className="text-sm text-text-secondary font-poppins-400 text-center">
                                There are no pending care logs that require verification at the moment.
                            </Text>
                        </View>
                    )}
                />
            )}
        </Screen>
    );
};

export default VerifyActivitiesScreen;
