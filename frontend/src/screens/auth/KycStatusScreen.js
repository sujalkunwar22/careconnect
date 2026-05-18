import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import useAuthStore from '../../stores/authStore';
import Screen from '../../components/common/Screen';
import Button from '../../components/common/Button';
import { Clock, CheckCircle2, AlertTriangle, ArrowRight, HelpCircle, MessageSquare } from 'lucide-react-native';
import Badge from '../../components/common/Badge';
import AuthService from '../../services/authService';

const KycStatusScreen = ({ navigation, route }) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const [kycDoc, setKycDoc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const normalizeKycResponse = (data) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
  };

  const getLatestKycDoc = (data) => {
    const docs = normalizeKycResponse(data);
    if (!docs.length) return null;
    const sorted = docs
      .map((doc) => ({ ...doc, createdAt: new Date(doc.created_at || 0) }))
      .sort((a, b) => b.createdAt - a.createdAt);

    const verifiedDoc = sorted.find((doc) => ['verified', 'approved'].includes(doc.status));
    return verifiedDoc || sorted[0];
  };

  useEffect(() => {
    const fetchStatus = async () => {
      if (!accessToken) {
        // This screen can be visited during pre-auth onboarding flow.
        // Skip protected API call when no token is available.
        setIsLoading(false);
        return;
      }

      try {
        const docs = await AuthService.getKycStatus();
        const latestDoc = getLatestKycDoc(docs);
        if (latestDoc) {
          setKycDoc(latestDoc);
          
          // Sync global user state if it's out of date
          const currentStoreStatus = String(user?.kyc_status || '').toLowerCase();
          const liveStatus = String(latestDoc.status || '').toLowerCase();
          
          if (currentStoreStatus !== liveStatus) {
            const fetchProfile = useAuthStore.getState().fetchProfile;
            if (fetchProfile) await fetchProfile();
          }
        }
      } catch (err) {
        // Avoid noisy console stack for expected auth-related failures.
        console.warn('Could not fetch live KYC status, showing local status.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatus();
  }, [accessToken]);

  const role = user?.role || 'professional';

  // Use document status if available, fallback to current user state or route param
  const rawStatus = kycDoc?.status || (user?.is_kyc_verified || ['verified', 'approved'].includes(user?.kyc_status) ? 'verified' : user?.kyc_status) || route?.params?.status || 'pending';
  const status = String(rawStatus).toLowerCase();

  const statusConfig = {
    pending: {
      title: 'Verification Pending',
      subtitle: 'Your documents are currently being reviewed by our team. This usually takes 24-48 hours.',
      icon: Clock,
      color: '#F59E0B', // warning
      bg: '#F59E0B15',
      badge: 'In Review'
    },
    submitted: {
      title: 'Verification Submitted',
      subtitle: 'Your documents have been submitted and are awaiting review.',
      icon: Clock,
      color: '#F59E0B',
      bg: '#F59E0B15',
      badge: 'Submitted'
    },
    in_review: {
      title: 'Verification Pending',
      subtitle: 'Your documents are currently being reviewed by our team. This usually takes 24-48 hours.',
      icon: Clock,
      color: '#F59E0B',
      bg: '#F59E0B15',
      badge: 'In Review'
    },
    info_requested: {
      title: 'Additional Info Required',
      subtitle: 'We need more information to complete your verification.',
      icon: AlertTriangle,
      color: '#E07A27',
      bg: '#FDE68A30',
      badge: 'Info Requested'
    },
    verified: {
      title: 'Identity Verified!',
      subtitle: 'Great news! Your identity has been successfully verified. You now have full access to all features.',
      icon: CheckCircle2,
      color: '#10B981', // success
      bg: '#10B98115',
      badge: 'Verified'
    },
    approved: {
      title: 'Identity Verified!',
      subtitle: 'Great news! Your identity has been successfully verified. You now have full access to all features.',
      icon: CheckCircle2,
      color: '#10B981',
      bg: '#10B98115',
      badge: 'Verified'
    },
    rejected: {
      title: 'Verification Failed',
      subtitle: 'We couldn\'t verify your identity. This might be due to unclear photos or mismatched information.',
      icon: AlertTriangle,
      color: '#EF4444', // error
      bg: '#EF444415',
      badge: 'Rejected',
      reason: kycDoc?.rejection_reason || 'There was an issue verifying your documents.'
    },
    failed: {
      title: 'Verification Failed',
      subtitle: 'We couldn\'t verify your identity. Please try uploading clearer documents.',
      icon: AlertTriangle,
      color: '#EF4444',
      bg: '#EF444415',
      badge: 'Failed',
      reason: kycDoc?.rejection_reason || 'Document verification failed.'
    }
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  const handleResubmitPress = () => {
    console.log('[KycStatusScreen] handleResubmitPress triggered');
    // Blurring focus to avoid ARIA-hidden focus errors on Web transitions
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const activeElement = document.activeElement;
      if (activeElement && typeof activeElement.blur === 'function') {
        activeElement.blur();
      }
    }
    console.log('[KycStatusScreen] Navigating to KycSubmit via push');
    navigation.push('KycSubmit');
  };

  const handleDashboardPress = () => {
    if (['rejected', 'failed', 'info_requested'].includes(status)) {
      handleResubmitPress();
      return;
    }

    // Navigate based on role
    if (role === 'admin') {
      navigation.navigate('AdminMain');
    } else if (role === 'ngo') {
      navigation.navigate('NgoMain');
    } else {
      navigation.navigate('ProfessionalMain');
    }
  };

  if (isLoading) {
    return (
      <Screen className="bg-surface">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#6366F1" />
          <Text className="mt-4 font-poppins-500 text-text-secondary">Loading verification status...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen className="bg-surface">
      <View className="flex-1 justify-center items-center px-6">
        <View
          className="w-32 h-32 rounded-full items-center justify-center mb-8"
          style={{ backgroundColor: config.bg }}
        >
          <Icon size={64} color={config.color} />
        </View>

        <Text
          className="text-3xl text-text-primary mb-4 text-center"
          style={{ fontFamily: 'Montserrat_700Bold' }}
        >
          {config.title}
        </Text>

        <Text
          className="text-center text-text-secondary text-base mb-10 leading-6"
          style={{ fontFamily: 'Poppins_400Regular' }}
        >
          {config.subtitle}
        </Text>

        <View className="w-full bg-white rounded-3xl p-6 shadow-sm border border-border/50 mb-10">
          <View className="flex-row items-center justify-between pb-4 border-b border-border/50">
            <Text className="text-text-secondary font-poppins-400">Date Submitted</Text>
            <Text className="text-text-primary font-poppins-600">
              {kycDoc?.created_at ? new Date(kycDoc.created_at).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
          <View className="flex-row items-center justify-between pt-4">
            <Text className="text-text-secondary font-poppins-400">Current Status</Text>
            <Badge label={config.badge} variant={status === 'verified' || status === 'approved' ? 'success' : ['rejected', 'failed'].includes(status) ? 'error' : 'warning'} />
          </View>
          {(status === 'rejected' || status === 'failed' || status === 'info_requested') && (
            <View className="mt-4 pt-4 border-t border-border/50">
              <Text className="text-text-secondary font-poppins-400 text-xs mb-1">Note/Reason:</Text>
              <Text className="text-error font-poppins-600 text-sm">{config.reason || 'Please update your documents.'}</Text>
            </View>
          )}
        </View>

        {['rejected', 'failed', 'info_requested'].includes(status) ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleResubmitPress}
            className="w-full rounded-2xl border border-primary/40 bg-transparent py-4 items-center mb-6"
            style={{
              shadowColor: '#B84A1A',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.18,
              shadowRadius: 10,
              elevation: 5,
            }}
          >
            <Text className="text-primary font-poppins-600 text-base">Edit & Resubmit Documents</Text>
          </TouchableOpacity>
        ) : (
          <Button
            title="Go to Dashboard"
            onPress={handleDashboardPress}
            className="w-full shadow-md mb-6"
            size="lg"
            variant="primary"
            icon={ArrowRight}
            iconPosition="right"
          />
        )}

        <TouchableOpacity
          className="flex-row items-center justify-center py-2"
          activeOpacity={0.7}
        >
          <MessageSquare size={18} color="#3B82F6" />
          <Text className="ml-2 text-secondary font-poppins-600">Contact Support</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
};

export default KycStatusScreen;
