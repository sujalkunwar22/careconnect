import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, FlatList, Image, Modal, Platform, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  Clock, 
  ShieldCheck, 
  History, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Clock3, 
  Briefcase, 
  XCircle,
  FileText,
  Sparkles,
  Eye,
  Download,
  X,
  ExternalLink,
  MessageSquare,
  Building2
} from 'lucide-react-native';
import Screen from '../../components/common/Screen';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import PortfolioService from '../../services/portfolioService';
import UserService from '../../services/userService';
import useAuthStore from '../../stores/authStore';

import JobsService from '../../services/jobsService';

const HistoryScreen = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState(route?.params?.activeTab || 'applications'); // 'activities', 'kyc', or 'applications'
  const [activities, setActivities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [kycStatus, setKycStatus] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showCvPreview, setShowCvPreview] = useState(false);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (route?.params?.activeTab) {
      setActiveTab(route.params.activeTab);
    }
  }, [route?.params?.activeTab]);

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

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async (signal) => {
    try {
      setIsLoading(true);
      const [activityData, kycData, appData] = await Promise.all([
        PortfolioService.getActivities({ signal }).catch(() => []),
        UserService.getKYCStatus({ signal }).catch(() => null),
        JobsService.getMyApplications({ signal }).catch(() => []),
      ]);
      setActivities(activityData);
      setKycStatus(getLatestKycDoc(kycData));
      setApplications(appData);
    } catch (error) {
      if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
        console.error('Error fetching history data:', error);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const renderActivityItem = ({ item }) => (
    <Card className="mb-4 bg-white border-none shadow-sm">
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate('ActivityDetail', { activity: item })}
      >
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="text-base font-poppins-600 text-text-primary" numberOfLines={1}>{item.title}</Text>
            <View className="flex-row items-center mt-1">
              <Calendar size={12} color="#94A3B8" />
              <Text className="text-xs text-text-secondary font-poppins-400 ml-1">
                {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
          </View>
          <Badge
            label={item.status === 'verified' ? 'Verified' : 'Pending'}
            variant={item.status === 'verified' ? 'success' : 'warning'}
          />
        </View>
        <Text className="text-xs text-text-secondary font-poppins-400" numberOfLines={2}>
          {item.description}
        </Text>
        <View className="mt-3 pt-3 border-t border-border/50 flex-row justify-between">
           <Text className="text-[10px] text-text-secondary font-poppins-400">Hours: {item.hours}h</Text>
           <Text className="text-[10px] text-text-secondary font-poppins-400">{item.location}</Text>
        </View>
      </TouchableOpacity>
    </Card>
  );

  const renderApplicationItem = ({ item }) => {
    const statusConfig = {
      'Accepted': { color: '#10B981', variant: 'success', icon: CheckCircle2 },
      'Reviewed': { color: '#3B82F6', variant: 'info', icon: Clock },
      'Pending': { color: '#F59E0B', variant: 'warning', icon: Clock },
      'Rejected': { color: '#EF4444', variant: 'error', icon: XCircle },
    };
    const config = statusConfig[item.status] || { color: '#94A3B8', variant: 'neutral', icon: AlertCircle };
    
    return (
      <Card className="mb-4 bg-white border-none shadow-sm p-4">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setSelectedApplication(item)}
        >
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-1 mr-2">
              <Text className="text-base font-poppins-600 text-text-primary mb-1" numberOfLines={1}>
                {item.job_title || 'Job Application'}
              </Text>
              <Text className="text-xs font-poppins-500 text-primary mb-2">
                {item.ngo_name || 'Organization'}
              </Text>
              
              <View className="flex-row items-center mb-2">
                {item.application_type === 'cv' ? (
                  <View className="flex-row items-center bg-slate-100 px-2 py-0.5 rounded mr-2">
                    <FileText size={10} color="#64748B" />
                    <Text className="text-[9px] font-poppins-600 text-slate-500 ml-1">CV Attachment</Text>
                  </View>
                ) : (
                  <View className="flex-row items-center bg-primary/10 px-2 py-0.5 rounded mr-2">
                    <Sparkles size={10} color="#0F172A" />
                    <Text className="text-[9px] font-poppins-600 text-primary ml-1">Portfolio Snapshot</Text>
                  </View>
                )}
              </View>

              <View className="flex-row items-center">
                <Calendar size={12} color="#94A3B8" />
                <Text className="text-xs text-text-secondary font-poppins-400 ml-1.5">
                  Applied on {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
            </View>
            <Badge
              label={item.status}
              variant={config.variant}
              containerClassName="px-2 py-0.5"
            />
          </View>
        </TouchableOpacity>
      </Card>
    );
  };

  const renderKycHistory = () => {
    const latestKyc = Array.isArray(kycStatus) ? (kycStatus.length ? kycStatus[0] : null) : kycStatus;
    const fallbackStatus = user?.is_kyc_verified || ['verified', 'approved'].includes(user?.kyc_status) ? 'verified' : user?.kyc_status;
    const status = latestKyc?.status || fallbackStatus;

    if (!latestKyc && !status) return (
      <View className="items-center justify-center py-10">
        <AlertCircle size={40} color="#94A3B8" />
        <Text className="mt-4 font-poppins-500 text-text-secondary">No KYC data available</Text>
      </View>
    );

    const documentTitle = latestKyc?.document_type?.replace('_', ' ').toUpperCase() || 'Document';
    const statusLabel = status?.toUpperCase() || 'UNKNOWN';
    const isVerified = status === 'verified';

    return (
      <View>
        <Card className="mb-6 bg-white border-none shadow-sm">
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-4">
              <ShieldCheck size={24} color={isVerified ? '#10B981' : '#6366F1'} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-poppins-600 text-text-primary">KYC Verification Status</Text>
              <Text className="text-xs text-text-secondary font-poppins-400">Current active status</Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between p-4 bg-background rounded-2xl">
            <View>
              <Text className="text-xs text-text-secondary font-poppins-400 mb-1">Status</Text>
              <Text className={`text-base font-poppins-700 ${
                isVerified ? 'text-success' : status === 'pending' ? 'text-warning' : 'text-danger'
              }`}>
                {statusLabel}
              </Text>
            </View>
            <Badge 
              label={isVerified ? 'Verified' : status === 'rejected' ? 'Rejected' : 'In Review'}
              variant={isVerified ? 'success' : status === 'rejected' ? 'error' : 'warning'}
            />
          </View>

          <View className="mt-4 p-4 bg-white rounded-2xl border border-border/50">
            <Text className="text-sm font-poppins-600 text-text-primary mb-2">Document Type</Text>
            <Text className="text-base font-poppins-700 text-text-primary">{documentTitle}</Text>
            {latestKyc?.created_at ? (
              <Text className="text-xs text-text-secondary font-poppins-400 mt-2">
                Submitted on {new Date(latestKyc.created_at).toLocaleDateString()}
              </Text>
            ) : null}
          </View>

          <View className="mt-4 space-y-4">
            {latestKyc.front_image && (
              <View className="rounded-2xl overflow-hidden border border-border/50">
                <Image source={{ uri: latestKyc.front_image }} className="h-40 w-full" resizeMode="cover" />
                <View className="p-3 bg-background">
                  <Text className="text-sm font-poppins-600 text-text-primary">Front Image</Text>
                </View>
              </View>
            )}
            {latestKyc.back_image && (
              <View className="rounded-2xl overflow-hidden border border-border/50">
                <Image source={{ uri: latestKyc.back_image }} className="h-40 w-full" resizeMode="cover" />
                <View className="p-3 bg-background">
                  <Text className="text-sm font-poppins-600 text-text-primary">Back Image</Text>
                </View>
              </View>
            )}
            {latestKyc.selfie_image && (
              <View className="rounded-2xl overflow-hidden border border-border/50">
                <Image source={{ uri: latestKyc.selfie_image }} className="h-40 w-full" resizeMode="cover" />
                <View className="p-3 bg-background">
                  <Text className="text-sm font-poppins-600 text-text-primary">Selfie with Document</Text>
                </View>
              </View>
            )}
          </View>

          {latestKyc.rejection_reason && (
            <View className="mt-4 p-4 bg-danger/10 rounded-xl border border-danger/20">
              <Text className="text-xs font-poppins-700 text-danger mb-1">Rejection Reason:</Text>
              <Text className="text-xs font-poppins-400 text-danger">{latestKyc.rejection_reason}</Text>
            </View>
          )}

          {!isVerified && (
            <TouchableOpacity 
              className="mt-6 bg-primary py-4 rounded-2xl items-center"
              onPress={() => navigation.navigate('KycSubmit')}
            >
              <Text className="text-white font-poppins-600">
                {status === 'rejected' ? 'Re-submit KYC' : 'Submit KYC Documents'}
              </Text>
            </TouchableOpacity>
          )}
          {isVerified && (
            <View className="mt-6 p-4 bg-success/10 rounded-2xl border border-success/20">
              <Text className="text-sm font-poppins-600 text-success">You are verified.</Text>
              <Text className="text-xs font-poppins-400 text-success mt-1">
                These are the documents you uploaded for verification.
              </Text>
            </View>
          )}
        </Card>

        <Text className="text-base font-poppins-600 text-text-primary mb-4">Submission Logs</Text>
        <View className="bg-white rounded-2xl p-4 shadow-sm">
           <View className="flex-row items-center">
              <View className="w-2 h-10 bg-primary/20 rounded-full mr-4" />
              <View>
                <Text className="text-sm font-poppins-600 text-text-primary">
                  {isVerified ? 'Verification Successful' : 
                   status === 'pending' ? 'Documents Under Review' : 'Documents Submitted'}
                </Text>
                <Text className="text-[10px] text-text-secondary font-poppins-400">
                  {latestKyc?.created_at ? new Date(latestKyc.created_at).toLocaleDateString() : 'Pending'}
                </Text>
              </View>
           </View>
        </View>
      </View>
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
            History
          </Text>
          <View className="w-10" />
        </View>

        {/* Tab Switcher */}
        <View className="flex-row bg-white p-1 rounded-2xl shadow-sm border border-border/30">
          <TouchableOpacity
            onPress={() => setActiveTab('applications')}
            className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${activeTab === 'applications' ? 'bg-primary' : ''}`}
          >
            <Briefcase size={16} color={activeTab === 'applications' ? '#fff' : '#94A3B8'} />
            <Text className={`ml-1.5 font-poppins-600 text-[11px] ${activeTab === 'applications' ? 'text-white' : 'text-text-secondary'}`}>
              Jobs
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('activities')}
            className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${activeTab === 'activities' ? 'bg-primary' : ''}`}
          >
            <Clock3 size={16} color={activeTab === 'activities' ? '#fff' : '#94A3B8'} />
            <Text className={`ml-1.5 font-poppins-600 text-[11px] ${activeTab === 'activities' ? 'text-white' : 'text-text-secondary'}`}>
              Care Logs
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('kyc')}
            className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${activeTab === 'kyc' ? 'bg-primary' : ''}`}
          >
            <ShieldCheck size={16} color={activeTab === 'kyc' ? '#fff' : '#94A3B8'} />
            <Text className={`ml-1.5 font-poppins-600 text-[11px] ${activeTab === 'kyc' ? 'text-white' : 'text-text-secondary'}`}>
              KYC
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading && !isRefreshing ? (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color="#6366F1" />
          <Text className="mt-4 font-poppins-500 text-text-secondary">Loading history...</Text>
        </View>
      ) : (
        <FlatList
          data={
            activeTab === 'applications' ? applications : 
            activeTab === 'activities' ? activities : 
            [1] // Hack for KYC list
          }
          keyExtractor={(item, index) => index.toString()}
          renderItem={
            activeTab === 'applications' ? renderApplicationItem :
            activeTab === 'activities' ? renderActivityItem : 
            renderKycHistory
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#6366F1']} />}
          ListEmptyComponent={() => (
            <View className="items-center justify-center py-20">
              <History size={48} color="#CBD5E1" />
              <Text className="mt-4 font-poppins-600 text-text-primary text-lg">No records found</Text>
              <Text className="text-text-secondary font-poppins-400 text-center px-10">
                You haven't submitted any {activeTab === 'applications' ? 'job applications' : activeTab === 'activities' ? 'care logs' : 'KYC verifications'} yet.
              </Text>
            </View>
          )}
        />
      )}

      {/* ─── APPLICATION DETAILS MODAL ─── */}
      <Modal
        visible={!!selectedApplication}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedApplication(null)}
      >
        <View className="flex-1 bg-slate-950/60 justify-end">
          <View className="bg-white rounded-t-[40px] px-6 pt-8 pb-10 max-h-[85%] border-t border-border shadow-2xl">
            {/* Top Drag Indicator */}
            <View className="w-12 h-1.5 bg-slate-200 rounded-full self-center mb-6" />

            {/* Header */}
            <View className="flex-row justify-between items-start mb-6">
              <View className="flex-1 mr-4">
                <Text className="text-xl font-poppins-700 text-text-primary">
                  {selectedApplication?.job_title}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Building2 size={14} color="#94A3B8" />
                  <Text className="text-sm font-poppins-600 text-primary ml-1">
                    {selectedApplication?.ngo_name}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedApplication(null)}
                className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center"
              >
                <X size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="space-y-6">
              {/* Dynamic Status Banner */}
              <View className="bg-slate-50 border border-slate-200/60 rounded-3xl p-5 mb-4">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-[10px] font-poppins-600 text-text-secondary uppercase tracking-wider">
                      Current Status
                    </Text>
                    <Text className="text-lg font-poppins-700 text-text-primary mt-0.5">
                      {selectedApplication?.status}
                    </Text>
                  </View>
                  {(() => {
                    const statusConfig = {
                      'Accepted': { bg: 'bg-green-500/10 border-green-500/20', text: 'text-green-600' },
                      'Reviewed': { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-600' },
                      'Pending': { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-600' },
                      'Rejected': { bg: 'bg-red-500/10 border-red-500/20', text: 'text-red-600' },
                    };
                    const badgeCfg = statusConfig[selectedApplication?.status] || { bg: 'bg-slate-500/10 border-slate-500/20', text: 'text-slate-600' };
                    return (
                      <View className={`${badgeCfg.bg} border px-4 py-1.5 rounded-full`}>
                        <Text className={`text-[10px] font-poppins-700 uppercase tracking-wider ${badgeCfg.text}`}>
                          {selectedApplication?.status}
                        </Text>
                      </View>
                    );
                  })()}
                </View>
                
                <Text className="text-xs font-poppins-400 text-text-secondary mt-3 leading-5">
                  {selectedApplication?.status === 'Pending' && 'Your application has been received and is waiting for NGO review.'}
                  {selectedApplication?.status === 'Reviewed' && 'The NGO has viewed your application profile and attachment.'}
                  {selectedApplication?.status === 'Accepted' && 'Congratulations! The NGO has accepted your application.'}
                  {selectedApplication?.status === 'Rejected' && 'The NGO has chosen to pass on your application for this position.'}
                </Text>
              </View>

              {/* Cover Letter Quote */}
              {selectedApplication?.cover_letter ? (
                <View className="mb-4">
                  <Text className="text-xs font-poppins-700 text-text-primary uppercase tracking-wider mb-2.5">
                    Your Cover Letter
                  </Text>
                  <View className="bg-primary/5 border-l-4 border-primary rounded-r-2xl p-4 flex-row items-start">
                    <MessageSquare size={16} color="#0F172A" className="mr-2.5 mt-0.5" />
                    <Text className="flex-1 text-xs font-poppins-500 italic leading-5 text-text-primary">
                      "{selectedApplication.cover_letter}"
                    </Text>
                  </View>
                </View>
              ) : null}

              {/* CV / Portfolio Method */}
              <View className="mb-4">
                <Text className="text-xs font-poppins-700 text-text-primary uppercase tracking-wider mb-2.5">
                  Submission Detail
                </Text>
                {selectedApplication?.application_type === 'cv' ? (
                  <View className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1 mr-4">
                      <View className="w-10 h-10 bg-primary/10 rounded-xl items-center justify-center">
                        <FileText size={20} color="#0F172A" />
                      </View>
                      <View className="ml-3 flex-1">
                        <Text numberOfLines={1} className="text-xs font-poppins-600 text-text-primary">
                          {(() => {
                            const rawCv = selectedApplication?.cv_file;
                            if (!rawCv || typeof rawCv !== 'string' || rawCv.includes('[object Object]') || rawCv.includes('%5Bobject%20Object%5D')) {
                              return 'attached_resume.pdf';
                            }
                            return rawCv.split('/').pop() || 'attached_resume.pdf';
                          })()}
                        </Text>
                        <Text className="text-[10px] font-poppins-400 text-text-secondary mt-0.5">
                          PDF Document Attachment
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => setShowCvPreview(true)}
                      className="bg-primary px-3 py-2 rounded-xl flex-row items-center shadow-md shadow-primary/5"
                    >
                      <Eye size={12} color="white" />
                      <Text className="text-[10px] font-poppins-600 text-white ml-1">View CV</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex-row items-center">
                    <View className="w-10 h-10 bg-primary/10 rounded-xl items-center justify-center">
                      <Sparkles size={20} color="#0F172A" />
                    </View>
                    <View className="ml-3">
                      <Text className="text-xs font-poppins-600 text-text-primary">
                        Live Profile Portfolio
                      </Text>
                      <Text className="text-[10px] font-poppins-400 text-text-secondary mt-0.5">
                        Applied using verified system profile snapshot
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Interview details if status is Accepted / Shortlisted */}
              {selectedApplication?.interview_details && (() => {
                const details = selectedApplication.interview_details;
                const date = details.date;
                const time = details.time;
                const platform = details.platform;
                const meetingLink = details.location_or_link || details.link;
                const notes = details.message || details.notes;
                
                // A robust check to see if the link is a URL
                // Checks for http://, https://, or a standard domain/URL pattern (dot in domain, no spaces)
                const isUrl = meetingLink && (
                  meetingLink.trim().startsWith('http://') || 
                  meetingLink.trim().startsWith('https://') || 
                  (/^[^\s]+\.[^\s]+$/i.test(meetingLink.trim()))
                );

                // Format link with https:// if it doesn't already have a protocol
                const formattedLink = isUrl && meetingLink && (
                  (meetingLink.trim().startsWith('http://') || meetingLink.trim().startsWith('https://')) 
                    ? meetingLink.trim() 
                    : `https://${meetingLink.trim()}`
                );

                return (
                  <View className="bg-blue-50/50 border border-blue-200/60 rounded-3xl p-5 mb-4">
                    <Text className="text-sm font-poppins-700 text-primary mb-3">
                      📅 Scheduled Interview
                    </Text>

                    {date && (
                      <Text className="text-xs font-poppins-600 text-text-primary mb-2">
                        Date & Time: <Text className="font-poppins-400 text-text-secondary">{date}{time ? ` at ${time}` : ''}</Text>
                      </Text>
                    )}

                    {platform && (
                      <Text className="text-xs font-poppins-600 text-text-primary mb-2">
                        Platform: <Text className="font-poppins-400 text-text-secondary">{platform}</Text>
                      </Text>
                    )}

                    {meetingLink && (
                      isUrl ? (
                        <TouchableOpacity 
                          onPress={() => {
                            if (Platform.OS === 'web') {
                              window.open(formattedLink, '_blank');
                            } else {
                              Linking.openURL(formattedLink);
                            }
                          }}
                          className="flex-row items-center bg-blue-100/60 border border-blue-200 rounded-xl px-3 py-2 mt-1 mb-2 self-start"
                          activeOpacity={0.7}
                        >
                          <ExternalLink size={12} color="#2563EB" className="mr-1.5" />
                          <Text className="text-xs font-poppins-600 text-blue-700 underline">
                            Join {platform || 'Meeting'} ({meetingLink})
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <Text className="text-xs font-poppins-600 text-text-primary mb-2">
                          Location/Address: <Text className="font-poppins-400 text-text-secondary">{meetingLink}</Text>
                        </Text>
                      )
                    )}

                    {notes && (
                      <View className="bg-white/80 border border-slate-100 rounded-2xl p-3.5 mt-2">
                        <Text className="text-[10px] font-poppins-600 text-text-secondary uppercase tracking-wider mb-1">
                          Message from NGO:
                        </Text>
                        <Text className="text-xs font-poppins-400 text-text-primary italic">
                          "{notes}"
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })()}

              {/* Rejection Details */}
              {selectedApplication?.status === 'Rejected' && selectedApplication?.rejection_reason && (
                <View className="bg-red-50/50 border border-red-200/60 rounded-3xl p-5 mb-4">
                  <Text className="text-sm font-poppins-700 text-danger mb-2">
                    ❌ Application Feedback
                  </Text>
                  {selectedApplication.rejection_category && (
                    <Text className="text-xs font-poppins-600 text-text-primary mb-1">
                      Reason Category: <Text className="font-poppins-400 text-text-secondary capitalize">{selectedApplication.rejection_category.replace('_', ' ')}</Text>
                    </Text>
                  )}
                  <Text className="text-xs font-poppins-400 text-text-secondary leading-5 italic mt-1">
                    "{selectedApplication.rejection_reason}"
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Footer Buttons */}
            <View className="mt-8 flex-row">
              <TouchableOpacity
                onPress={() => {
                  const jobId = selectedApplication.job || selectedApplication.id;
                  setSelectedApplication(null);
                  navigation.navigate('JobDetail', { jobId });
                }}
                className="flex-1 bg-secondary py-4 rounded-2xl items-center justify-center flex-row shadow-lg shadow-secondary/10 mr-3"
              >
                <Briefcase size={16} color="white" className="mr-2" />
                <Text className="text-white font-poppins-600 text-sm">View Job Listing</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSelectedApplication(null)}
                className="flex-1 bg-slate-100 py-4 rounded-2xl items-center justify-center"
              >
                <Text className="text-text-primary font-poppins-600 text-sm">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── CV FILE PREVIEW MODAL ─── */}
      <Modal
        visible={showCvPreview}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowCvPreview(false)}
      >
        <View className="flex-1 bg-slate-950/80 justify-center items-center p-6" style={{ zIndex: 1000 }}>
          <View className="bg-white w-full max-w-2xl h-[80%] rounded-[32px] overflow-hidden border border-border shadow-2xl">
            {/* Preview Header */}
            <View className="flex-row justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <View className="flex-row items-center flex-1 mr-4">
                <FileText size={20} color="#0F172A" />
                <Text numberOfLines={1} className="text-sm font-poppins-600 text-text-primary ml-2">
                  CV Preview: {selectedApplication?.job_title}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowCvPreview(false)}
                className="w-8 h-8 bg-slate-200/60 rounded-full items-center justify-center"
              >
                <X size={16} color="#475569" />
              </TouchableOpacity>
            </View>

            {/* Preview Viewport */}
            <View className="flex-1 p-6 items-center justify-center bg-slate-100">
              {(() => {
                if (Platform.OS !== 'web') {
                  return (
                    <View className="items-center max-w-sm bg-white p-8 rounded-3xl border border-slate-200 shadow-sm w-full">
                      <FileText size={48} color="#0F172A" className="mb-4" />
                      <Text className="text-base font-poppins-700 text-text-primary text-center">
                        Interactive Native Preview
                      </Text>
                      <Text className="text-xs text-text-secondary font-poppins-400 mt-2 text-center leading-5">
                        Your platform will open this file in the default system document reader/viewer.
                      </Text>
                      
                      {/* File Metadata Table */}
                      <View className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 my-5 space-y-2">
                        <View className="flex-row justify-between">
                          <Text className="text-[10px] font-poppins-600 text-text-secondary uppercase">Job</Text>
                          <Text numberOfLines={1} className="text-[10px] font-poppins-600 text-text-primary flex-1 text-right ml-4">{selectedApplication?.job_title}</Text>
                        </View>
                        <View className="flex-row justify-between">
                          <Text className="text-[10px] font-poppins-600 text-text-secondary uppercase">File Type</Text>
                          <Text className="text-[10px] font-poppins-600 text-text-primary">Document File</Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        onPress={() => {
                          if (selectedApplication?.cv_file) {
                            Linking.openURL(selectedApplication.cv_file).catch(() => {
                              Alert.alert('Error', 'Unable to open file in system application.');
                            });
                          }
                        }}
                        className="bg-primary px-6 py-3.5 rounded-2xl flex-row items-center"
                      >
                        <Text className="text-xs font-poppins-600 text-white mr-2">Open with System Reader</Text>
                        <Eye size={14} color="white" />
                      </TouchableOpacity>
                    </View>
                  );
                }

                // If on Web
                if (!selectedApplication?.cv_file) {
                  return (
                    <View className="items-center bg-white p-8 rounded-3xl border border-slate-200 w-full max-w-sm">
                      <FileText size={48} color="#94A3B8" className="mb-4" />
                      <Text className="text-sm font-poppins-600 text-text-secondary">No document submitted</Text>
                    </View>
                  );
                }

                const fileUrl = selectedApplication.cv_file;
                const fileName = fileUrl.split('/').pop() || 'Document';
                const isImage = /\.(png|jpe?g|gif|webp)$/i.test(fileName);
                const isPdf = /\.pdf$/i.test(fileName);

                if (isImage) {
                  return (
                    <Image
                      source={{ uri: fileUrl }}
                      style={{ width: '100%', height: '100%', resizeMode: 'contain', borderRadius: 16 }}
                    />
                  );
                }

                if (isPdf) {
                  return (
                    <View style={{ width: '100%', height: '100%' }}>
                      <iframe
                        src={fileUrl}
                        style={{ width: '100%', height: '100%', border: 'none', borderRadius: 16 }}
                      />
                    </View>
                  );
                }

                return (
                  <View className="items-center max-w-sm bg-white p-8 rounded-3xl border border-slate-200 shadow-sm w-full">
                    <View className="w-16 h-16 bg-[#457B9D]/10 rounded-2xl items-center justify-center mb-4">
                      <FileText size={36} color="#457B9D" />
                    </View>
                    
                    <Text className="text-base font-poppins-700 text-text-primary text-center">
                      Word Document Preview
                    </Text>
                    <Text className="text-xs text-text-secondary font-poppins-400 mt-2 text-center leading-5">
                      Microsoft Word documents (.docx/.doc) cannot be previewed natively inline. Click the button below to download and view this document on your device.
                    </Text>
                    
                    {/* File Metadata Table */}
                    <View className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 my-5 space-y-2">
                      <View className="flex-row justify-between">
                        <Text className="text-[10px] font-poppins-600 text-text-secondary uppercase">Job</Text>
                        <Text numberOfLines={1} className="text-[10px] font-poppins-600 text-text-primary flex-1 text-right ml-4">{selectedApplication?.job_title}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-[10px] font-poppins-600 text-text-secondary uppercase">File Name</Text>
                        <Text numberOfLines={1} className="text-[10px] font-poppins-600 text-text-primary flex-1 text-right ml-4">{fileName}</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => {
                        if (selectedApplication?.cv_file) {
                          Linking.openURL(selectedApplication.cv_file).catch(() => {
                            Alert.alert('Error', 'Unable to download file.');
                          });
                        }
                      }}
                      className="bg-primary py-3 rounded-2xl flex-row items-center w-full justify-center shadow-lg shadow-primary/10"
                    >
                      <Download size={14} color="white" className="mr-2" />
                      <Text className="text-xs font-poppins-600 text-white">Download Document</Text>
                    </TouchableOpacity>
                  </View>
                );
              })()}
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
};

export default HistoryScreen;
