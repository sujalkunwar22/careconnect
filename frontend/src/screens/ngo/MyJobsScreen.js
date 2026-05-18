import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import Screen from '../../components/common/Screen';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Skeleton from '../../components/common/Skeleton';
import JobsService from '../../services/jobsService';
import {
    ArrowLeft,
    Briefcase,
    Users,
    Clock,
    ChevronRight,
    Calendar
} from 'lucide-react-native';

const MyJobsScreen = ({ navigation }) => {
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchJobs = async () => {
        try {
            const data = await JobsService.getNgoJobs();
            setJobs(data);
        } catch (error) {
            console.error('Error fetching NGO jobs:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchJobs();
    };

    const JobItem = ({ item }) => (
        <Card className="mb-4 bg-white border-none shadow-sm p-4">
            <TouchableOpacity
                className="flex-row items-center justify-between"
                onPress={() => navigation.navigate('JobApplications', { jobId: item.id })}
            >
                <View className="flex-1 pr-4">
                    <View className="flex-row items-center mb-1">
                        <Text className="text-base font-poppins-600 text-text-primary mr-3" numberOfLines={1}>{item.title}</Text>
                        <Badge
                            label={item.status}
                            variant={item.status.toLowerCase() === 'active' ? 'success' : 'neutral'}
                            containerClassName="h-5 px-2"
                            textClassName="text-[10px]"
                        />
                    </View>
                    <View className="flex-row items-center mt-2">
                        <Calendar size={12} color="#94A3B8" />
                        <Text className="text-xs text-text-secondary font-poppins-400 ml-1.5">
                            {new Date(item.created_at).toLocaleDateString()}
                        </Text>
                        <View className="w-1 h-1 bg-border/50 rounded-full mx-2" />
                        <Text className="text-xs text-primary font-poppins-500">{item.category}</Text>
                    </View>
                </View>

                <View className="flex-row items-center">
                    <View className="items-center mr-4">
                        <View className="flex-row items-center">
                            <Users size={14} color="#3B82F6" />
                            <Text className="text-lg font-poppins-700 text-secondary ml-1.5 leading-6">{item.applicants_count || 0}</Text>
                        </View>
                        <Text className="text-[8px] font-poppins-700 text-secondary uppercase tracking-wider">Applicants</Text>
                    </View>
                    <ChevronRight size={18} color="#CBD5E1" />
                </View>
            </TouchableOpacity>
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
                        My Job Postings
                    </Text>
                </View>
            </View>

            {isLoading ? (
                <View>
                    {[1, 2, 3].map(i => <Skeleton key={i} width="100%" height={100} className="mb-4 rounded-3xl" />)}
                </View>
            ) : (
                <FlatList
                    data={jobs}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => <JobItem item={item} />}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={() => (
                        <View className="items-center justify-center py-20 px-10">
                            <View className="w-20 h-20 bg-white rounded-full items-center justify-center shadow-sm mb-6 border border-border/30">
                                <Briefcase size={32} color="#CBD5E1" />
                            </View>
                            <Text className="text-lg font-poppins-700 text-text-primary mb-2 text-center">No active postings</Text>
                            <Text className="text-sm text-text-secondary font-poppins-400 text-center mb-8">
                                Start recruiting verified caregivers by posting your first care opportunity.
                            </Text>
                            <Button
                                title="Post a Job"
                                onPress={() => navigation.navigate('PostJob')}
                                className="w-full shadow-sm"
                            />
                        </View>
                    )}
                />
            )}
        </Screen>
    );
};

export default MyJobsScreen;
