import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import useAuthStore from '../../stores/authStore';
import Screen from '../../components/common/Screen';
import Card from '../../components/common/Card';
import {
    ShieldCheck,
    AlertCircle,
    ChevronRight,
    BarChart3,
    Bell,
    CheckCircle2,
    FileText,
    Activity
} from 'lucide-react-native';
import AdminService from '../../services/adminService';
import Skeleton from '../../components/common/Skeleton';

const VerifierDashboardScreen = ({ navigation }) => {
    const user = useAuthStore((state) => state.user);
    const [stats, setStats] = useState(null);
    const [pendingKYCs, setPendingKYCs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [statsData, kycsData] = await Promise.all([
                AdminService.getVerifierStats(),
                AdminService.getPendingKYCs()
            ]);
            setStats(statsData);
            setPendingKYCs(Array.isArray(kycsData) ? kycsData : []);
        } catch (error) {
            console.error('Failed to fetch verifier data:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchData();
    };

    if (isLoading && !isRefreshing) {
        return (
            <Screen className="bg-surface">
                <View className="mt-4 mb-8">
                    <Skeleton className="w-48 h-8 rounded-lg mb-2" />
                    <Skeleton className="w-32 h-4 rounded-lg" />
                </View>
                <View className="flex-row gap-4 mb-8">
                    <Skeleton className="flex-1 h-32 rounded-2xl" />
                    <Skeleton className="flex-1 h-32 rounded-2xl" />
                </View>
                <Skeleton className="w-full h-32 rounded-2xl mb-8" />
                <Skeleton className="w-40 h-6 rounded-lg mb-4" />
                <Skeleton className="w-full h-20 rounded-2xl mb-4" />
                <Skeleton className="w-full h-20 rounded-2xl mb-4" />
            </Screen>
        );
    }

    return (
        <Screen className="bg-surface">
            {/* Header */}
            <View className="flex-row justify-between items-center mt-4 mb-8">
                <View className="flex-row items-center">
                    <View className="w-12 h-12 bg-secondary/10 rounded-full items-center justify-center mr-4 border border-secondary/20">
                        <ShieldCheck size={24} color="#3B82F6" />
                    </View>
                    <View>
                        <Text className="text-xs text-text-secondary font-poppins-500">System Verifier</Text>
                        <Text
                            className="text-xl text-text-primary"
                            style={{ fontFamily: 'Montserrat_700Bold' }}
                        >
                            {user?.full_name || user?.username || 'Control Center'}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-border/30">
                    <Bell size={20} color="#0F172A" />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#6366F1']} />
                }
            >
                {/* Verification Overview Stats */}
                <View className="flex-row gap-4 mb-8">
                    <Card className="flex-1 bg-white border-none p-5 shadow-sm">
                        <View className="w-10 h-10 bg-warning/10 rounded-xl items-center justify-center mb-4">
                            <AlertCircle size={20} color="#F59E0B" />
                        </View>
                        <Text className="text-text-secondary font-poppins-500 text-xs">Pending KYC</Text>
                        <Text className="text-text-primary font-poppins-700 text-3xl">{stats?.pending_kyc_count || 0}</Text>
                    </Card>

                    <Card className="flex-1 bg-white border-none p-5 shadow-sm">
                        <View className="w-10 h-10 bg-success/10 rounded-xl items-center justify-center mb-4">
                            <CheckCircle2 size={20} color="#10B981" />
                        </View>
                        <Text className="text-text-secondary font-poppins-500 text-xs">Verified Today</Text>
                        <Text className="text-text-primary font-poppins-700 text-3xl">{stats?.verified_today_count || 0}</Text>
                    </Card>
                </View>

                {/* Global Stats */}
                <Card className="bg-white border-none shadow-sm p-6 mb-8">
                    <View className="flex-row items-center justify-between mb-6">
                        <Text
                            className="text-lg text-text-primary"
                            style={{ fontFamily: 'Montserrat_600SemiBold' }}
                        >
                            System Health
                        </Text>
                        <BarChart3 size={20} color="#94A3B8" />
                    </View>

                    <View className="flex-row justify-between">
                        <View className="flex-1">
                            <Text className="text-2xl font-poppins-700 text-text-primary">{stats?.total_caregivers || 0}</Text>
                            <Text className="text-[10px] text-text-secondary font-poppins-600 uppercase tracking-widest">Total Caregivers</Text>
                        </View>
                        <View className="w-[1px] h-10 bg-border/50 mx-4" />
                        <View className="flex-1">
                            <Text className="text-2xl font-poppins-700 text-text-primary">{stats?.active_jobs || 0}</Text>
                            <Text className="text-[10px] text-text-secondary font-poppins-600 uppercase tracking-widest">Active Jobs</Text>
                        </View>
                    </View>
                </Card>

                {/* Pending Tasks */}
                <View className="flex-row justify-between items-center mb-4">
                    <Text
                        className="text-lg text-text-primary"
                        style={{ fontFamily: 'Montserrat_600SemiBold' }}
                    >
                        KYC Queue
                    </Text>
                    <TouchableOpacity>
                        <Text className="text-sm font-poppins-600 text-primary">View All</Text>
                    </TouchableOpacity>
                </View>

                {pendingKYCs.length === 0 ? (
                    <Card className="bg-white border-none shadow-sm p-8 items-center">
                        <CheckCircle2 size={40} color="#10B981" />
                        <Text className="text-sm font-poppins-500 text-text-secondary mt-4 text-center">
                            All caught up! No pending KYC requests.
                        </Text>
                    </Card>
                ) : (
                    pendingKYCs.map((kyc) => (
                        <Card key={kyc.id} className="mb-4 bg-white border-none shadow-sm p-4">
                            <TouchableOpacity
                                className="flex-row items-center justify-between"
                                onPress={() => navigation.navigate('KycReview', { kycData: kyc })}
                            >
                                <View className="flex-row items-center flex-1">
                                    <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-4">
                                        <FileText size={18} color="#6366F1" />
                                    </View>
                                    <View>
                                        <Text className="text-sm font-poppins-600 text-text-primary">{kyc.user_full_name || 'Anonymous User'}</Text>
                                        <Text className="text-[10px] text-text-secondary font-poppins-400 capitalize">
                                            {(kyc.document_type || 'document').replace('_', ' ')} • {kyc.created_at ? new Date(kyc.created_at).toLocaleDateString() : 'Unknown date'}
                                        </Text>
                                    </View>
                                </View>
                                <View className="flex-row items-center bg-surface px-3 py-1.5 rounded-xl border border-border/30">
                                    <Text className="text-[10px] font-poppins-600 text-warning mr-2">Pending</Text>
                                    <ChevronRight size={14} color="#CBD5E1" />
                                </View>
                            </TouchableOpacity>
                        </Card>
                    ))
                )}

                {/* System Logs Shortcut */}
                <TouchableOpacity className="mt-4 bg-primary/5 py-4 rounded-2xl border border-primary/10 flex-row items-center justify-center">
                    <Activity size={16} color="#6366F1" />
                    <Text className="text-sm font-poppins-600 text-primary ml-2 uppercase tracking-tight">Open System Audit Logs</Text>
                </TouchableOpacity>
            </ScrollView>
        </Screen>
    );
};

export default VerifierDashboardScreen;
