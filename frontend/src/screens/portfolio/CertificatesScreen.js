import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import Screen from '../../components/common/Screen';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import {
  Award,
  School,
  Trophy,
  Download,
  ArrowLeft,
  Ribbon,
  Calendar,
  Building2,
  ChevronRight
} from 'lucide-react-native';

import PortfolioService from '../../services/portfolioService';

const CertificatesScreen = ({ navigation }) => {
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const data = await PortfolioService.getCertificates();
        setCertificates(data);
      } catch (err) {
        console.error('Failed to get certificates', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  const CertificateCard = ({ item }) => {
    // The backend doesn't have a 'type' field currently, so let's check title or default to 'Certificate'
    const typeLabel = item.title.toLowerCase().includes('training') ? 'Training' : 'Certificate';
    const isTraining = typeLabel === 'Training';
    const color = isTraining ? '#3B82F6' : '#F4D03F';
    const Icon = isTraining ? School : Trophy;

    return (
      <Card className="mb-6 bg-white border-none shadow-sm p-0 overflow-hidden">
        <View className="p-6">
          <View className="flex-row items-start justify-between mb-6">
            <View
              className="w-16 h-16 rounded-2xl items-center justify-center"
              style={{ backgroundColor: `${color}15` }}
            >
              <Icon size={32} color={color} />
            </View>
            <Badge label={typeLabel} variant={isTraining ? 'info' : 'warning'} />
          </View>

          <Text
            className="text-xl text-text-primary mb-2"
            style={{ fontFamily: 'Montserrat_700Bold' }}
          >
            {item.title}
          </Text>

          <View className="flex-row items-center mb-1">
            <Building2 size={14} color="#94A3B8" />
            <Text className="text-sm text-text-secondary font-poppins-400 ml-2">Issued by {item.issued_by}</Text>
          </View>

          <View className="flex-row items-center mb-6">
            <Calendar size={14} color="#94A3B8" />
            <Text className="text-sm text-text-secondary font-poppins-400 ml-2">
              {new Date(item.issue_date).toLocaleDateString()}
            </Text>
          </View>

          <View className="flex-row gap-3">
            <Button
              title="Download PDF"
              variant="outline"
              size="sm"
              icon={Download}
              className="flex-1"
              onPress={() => console.log('Download certificate', item.id)}
            />
            <TouchableOpacity
              className="w-12 h-12 bg-surface rounded-xl items-center justify-center border border-border/50"
            >
              <ChevronRight size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>
        <View className="h-2 bg-primary/10" style={{ backgroundColor: `${color}40` }} />
      </Card>
    );
  };

  return (
    <Screen className="bg-surface">
      <View className="mt-4 mb-6">
        <View className="flex-row items-center justify-between mb-6">
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
            My Certificates
          </Text>
          <View className="w-10" />
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center pb-20">
          <ActivityIndicator size="large" color="#6366F1" />
          <Text className="mt-4 font-poppins-500 text-text-secondary">Loading certificates...</Text>
        </View>
      ) : (
        <FlatList
          data={certificates}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <CertificateCard item={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={() => (
          <View className="items-center justify-center py-20 px-10">
            <View className="w-24 h-24 bg-white rounded-full items-center justify-center shadow-sm mb-6 border border-border/30">
              <Ribbon size={48} color="#CBD5E1" />
            </View>
            <Text className="text-xl font-poppins-700 text-text-primary mb-2 text-center">No certificates yet</Text>
            <Text className="text-sm text-text-secondary font-poppins-400 text-center mb-8">
              Keep logging your care activities and complete online trainings to earn official recognition.
            </Text>
            <Button
              title="Log Care Hours"
              onPress={() => navigation.navigate('AddActivity')}
              className="w-full shadow-sm"
            />
          </View>
        )}
      />
      )}
    </Screen>
  );
};

export default CertificatesScreen;
