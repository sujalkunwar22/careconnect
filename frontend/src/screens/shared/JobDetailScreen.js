import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share, Alert, Platform, Modal, TextInput, ActivityIndicator, Linking } from 'react-native';
import Screen from '../../components/common/Screen';
import Button from '../../components/common/Button';
import { 
  ArrowLeft, 
  MapPin, 
  Briefcase, 
  Calendar, 
  DollarSign, 
  Share2, 
  Bookmark,
  CheckCircle,
  Building2,
  Clock,
  Award,
  FileText,
  FileUp,
  Trash2,
  Eye,
  X,
  Loader2,
  Sparkles,
  Download
} from 'lucide-react-native';
import JobsService from '../../services/jobsService';
import useAuthStore from '../../stores/authStore';
import AdminService from '../../services/adminService';
import PortfolioService from '../../services/portfolioService';
import { Power, Edit, ChevronRight } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';

const JobDetailScreen = ({ route, navigation }) => {
  const { jobId: routeJobId, jobData, job: routeJob, adminMode } = route.params || {};
  
  const passedJob = jobData || routeJob || null;
  const targetJobId = routeJobId || passedJob?.id;

  const [job, setJob] = useState(passedJob);
  const [loading, setLoading] = useState(!passedJob);
  const [applying, setApplying] = useState(false);
  const user = useAuthStore(state => state.user);
  const isNgo = user?.role === 'ngo';
  const isAdmin = user?.role === 'admin' || adminMode;

  // Job Application States
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [activeTab, setActiveTab] = useState('portfolio'); // 'portfolio' | 'cv'
  const [coverLetter, setCoverLetter] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [portfolio, setPortfolio] = useState(null);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  useEffect(() => {
    if (showApplyModal && activeTab === 'portfolio' && !portfolio && user && !isNgo) {
      fetchPortfolioDetails();
    }
  }, [showApplyModal, activeTab, user]);

  const fetchPortfolioDetails = async () => {
    setLoadingPortfolio(true);
    try {
      const data = await PortfolioService.getPortfolio();
      setPortfolio(data);
    } catch (error) {
      console.warn('Failed to fetch portfolio details:', error);
    } finally {
      setLoadingPortfolio(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    if (targetJobId) {
      fetchJobDetails(targetJobId, controller.signal);
      if (isAdmin) {
        fetchApplicants(targetJobId);
      }
    } else if (!passedJob) {
      setLoading(false);
    }
    return () => controller.abort();
  }, [targetJobId, isAdmin]);

  const fetchApplicants = async (jobId) => {
    setLoadingApplicants(true);
    try {
      const data = await JobsService.getNgoApplications({ job: jobId });
      setApplicants(data || []);
    } catch (error) {
      console.warn('Failed to fetch job applicants for admin:', error);
    } finally {
      setLoadingApplicants(false);
    }
  };

  const fetchJobDetails = async (id, signal) => {
    try {
      const data = await JobsService.getJobDetail(id, { signal });
      setJob(data);
    } catch (error) {
      if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
        Alert.alert('Error', 'Failed to load job details');
        navigation.goBack();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      navigation.navigate('Login', { 
        returnTo: 'JobDetail', 
        jobId: job.id 
      });
      return;
    }

    if (isNgo) {
      if (Platform.OS === 'web') alert('NGOs cannot apply for jobs.');
      else Alert.alert('NGO Account', 'NGOs cannot apply for jobs.');
      return;
    }

    if (job.has_applied) {
      if (Platform.OS === 'web') alert('You have already applied for this job.');
      else Alert.alert('Already Applied', 'You have already applied for this job.');
      return;
    }

    // Open the gorgeous interactive job application options modal
    setShowApplyModal(true);
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/*'
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCvFile(result.assets[0]);
      }
    } catch (err) {
      console.warn('Document picker error:', err);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const submitApplication = async () => {
    if (activeTab === 'cv' && !cvFile) {
      if (Platform.OS === 'web') alert('Please select a CV file to upload.');
      else Alert.alert('CV Required', 'Please select a CV file to upload.');
      return;
    }

    setApplying(true);
    try {
      if (activeTab === 'cv') {
        const formData = new FormData();
        formData.append('cover_letter', coverLetter);
        formData.append('application_type', 'cv');
        
        // Formulate correct file upload payload depending on Platform (Web vs Mobile)
        if (Platform.OS === 'web') {
          const fileToAppend = cvFile.file;
          if (fileToAppend instanceof File) {
            formData.append('cv_file', fileToAppend);
          } else {
            try {
              const response = await fetch(cvFile.uri);
              const blob = await response.blob();
              const rawFile = new File([blob], cvFile.name || 'resume.pdf', { type: cvFile.mimeType || 'application/pdf' });
              formData.append('cv_file', rawFile);
            } catch (fetchErr) {
              console.error('Failed to resolve web CV uri to File:', fetchErr);
              formData.append('cv_file', {
                uri: cvFile.uri,
                name: cvFile.name || 'resume.pdf',
                type: cvFile.mimeType || 'application/pdf',
              });
            }
          }
        } else {
          formData.append('cv_file', {
            uri: cvFile.uri,
            name: cvFile.name || 'resume.pdf',
            type: cvFile.mimeType || 'application/pdf',
          });
        }
        
        await JobsService.applyForJob(job.id, formData, {
          'Content-Type': 'multipart/form-data',
        });

      } else {
        await JobsService.applyForJob(job.id, {
          cover_letter: coverLetter,
          application_type: 'portfolio',
        });
      }

      if (Platform.OS === 'web') alert('Application submitted successfully!');
      else Alert.alert('Success', 'Application submitted successfully!');
      
      setShowApplyModal(false);
      setCoverLetter('');
      setCvFile(null);
      
      // Refresh job details
      fetchJobDetails(job.id);
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to submit application';
      if (Platform.OS === 'web') alert(`Error: ${errorMessage}`);
      else Alert.alert('Error', errorMessage);
    } finally {
      setApplying(false);
    }
  };

  const handleEndJob = async () => {
    const action = job.is_active ? 'end' : 'reactivate';
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Job Listing`,
      `Are you sure you want to ${action} this job listing?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: action === 'end' ? 'End Listing' : 'Reactivate', 
          onPress: async () => {
            try {
              await AdminService.toggleJob(job.id);
              
              // Notify NGO
              try {
                await AdminService.sendNotification({
                  user_id: job.ngo_id || job.posted_by,
                  title: `Job Listing ${action === 'end' ? 'Ended' : 'Reactivated'}`,
                  message: `Your job listing "${job.title}" has been ${action === 'end' ? 'ended' : 'reactivated'} by the system administrator.`,
                  type: 'job_status_change'
                });
              } catch (notifErr) {
                console.warn('Failed to send notification to NGO:', notifErr);
              }

              fetchJobDetails(job.id);
              Alert.alert('Success', `Job ${action === 'end' ? 'ended' : 'reactivated'} successfully and NGO has been notified.`);
            } catch (error) {
              Alert.alert('Error', 'Failed to update job status');
            }
          }
        }
      ]
    );
  };

  const handleEditJob = () => {
    navigation.navigate('PostJob', { jobToEdit: job });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this job: ${job.title} at ${job.ngo_name} on Care Connect Nepal`,
        url: `https://careconnect.np/jobs/${job.id}`,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  if (loading) {
    return (
      <Screen className="items-center justify-center">
        <Text className="text-text-secondary font-poppins-400">Loading job details...</Text>
      </Screen>
    );
  }

  if (!job) return null;

  return (
    <Screen scrollable className="bg-[#FAFAFA]" style={{ paddingHorizontal: 0 }}>
      {/* Premium Glassmorphic Header Background */}
      <View className="bg-primary px-6 pt-6 pb-24 rounded-b-[40px] shadow-lg shadow-primary/20">
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="w-10 h-10 items-center justify-center bg-white/20 rounded-full border border-white/30"
          >
            <ArrowLeft size={22} color="#ffffff" />
          </TouchableOpacity>
          <View className="flex-row gap-3">
            <TouchableOpacity 
              onPress={handleShare}
              className="w-10 h-10 items-center justify-center bg-white/20 rounded-full border border-white/30"
            >
              <Share2 size={20} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity className="w-10 h-10 items-center justify-center bg-white/20 rounded-full border border-white/30">
              <Bookmark size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row items-center mt-2">
          <View className="w-16 h-16 bg-white rounded-2xl items-center justify-center mr-4 shadow-sm">
            <Building2 size={32} color="#6366F1" />
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white leading-tight shadow-sm">
              {job.title}
            </Text>
            <Text className="text-white/80 font-medium mt-1">
              {job.ngo_name || 'Care Connect Partner'}
            </Text>
          </View>
        </View>
      </View>

      <View className="px-5 -mt-12">
        {/* Quick Tags Card */}
        <View className="bg-white rounded-[24px] p-5 shadow-md shadow-slate-200/50 border border-slate-100 mb-6 flex-row flex-wrap gap-2">
          <View className="flex-row items-center bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            <MapPin size={14} color="#64748B" />
            <Text className="text-slate-600 font-medium text-xs ml-1.5">{job.location || 'Nepal'}</Text>
          </View>
          <View className="flex-row items-center bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            <Briefcase size={14} color="#64748B" />
            <Text className="text-slate-600 font-medium text-xs ml-1.5 capitalize">
              {(job.employment_type || job.job_type || 'full_time').replace('_', ' ')}
            </Text>
          </View>
          <View className="flex-row items-center bg-[#10b981]/10 px-3 py-1.5 rounded-full border border-[#10b981]/20">
            <DollarSign size={14} color="#10b981" />
            <Text className="text-[#10b981] font-bold text-xs ml-1">
              {job.salary_min ? `Rs. ${job.salary_min}${job.salary_max ? ` - ${job.salary_max}` : ''}` : 'Volunteer / Negotiable'}
            </Text>
          </View>
        </View>

        {/* Bento Grid Stats */}
        <View className="flex-row gap-4 mb-6">
          <View className="flex-1 bg-white p-4 rounded-[24px] shadow-sm border border-slate-100 items-center justify-center">
            <View className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center mb-2 border border-slate-100">
              <Clock size={18} color="#64748B" />
            </View>
            <Text className="text-slate-500 font-medium text-[10px] uppercase tracking-wider mb-1">Posted</Text>
            <Text className="text-slate-800 font-bold text-xs text-center">
              {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Just now'}
            </Text>
          </View>

          <View className="flex-1 bg-white p-4 rounded-[24px] shadow-sm border border-slate-100 items-center justify-center">
            <View className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center mb-2 border border-slate-100">
              <Calendar size={18} color="#64748B" />
            </View>
            <Text className="text-slate-500 font-medium text-[10px] uppercase tracking-wider mb-1">Deadline</Text>
            <Text className="text-slate-800 font-bold text-xs text-center">
              {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Open'}
            </Text>
          </View>

          <View className="flex-1 bg-white p-4 rounded-[24px] shadow-sm border border-slate-100 items-center justify-center">
            <View className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center mb-2 border border-slate-100">
              <Award size={18} color="#64748B" />
            </View>
            <Text className="text-slate-500 font-medium text-[10px] uppercase tracking-wider mb-1">Category</Text>
            <Text className="text-slate-800 font-bold text-xs text-center capitalize" numberOfLines={1}>
              {job.category || 'General'}
            </Text>
          </View>
        </View>

        {/* Main Content Area */}
        <View className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 mb-24">
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 bg-primary/10 rounded-lg items-center justify-center mr-3">
                <FileText size={16} color="#6366F1" />
              </View>
              <Text className="text-lg font-bold text-slate-800">Job Description</Text>
            </View>
            <Text className="text-slate-600 font-medium leading-relaxed">
              {job.description || "No detailed description provided."}
            </Text>
          </View>

          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 bg-[#10b981]/10 rounded-lg items-center justify-center mr-3">
                <CheckCircle size={16} color="#10b981" />
              </View>
              <Text className="text-lg font-bold text-slate-800">Requirements</Text>
            </View>
            <View className="space-y-3">
              {(Array.isArray(job.requirements) ? job.requirements : (job.requirements || "").split('\n'))
                .filter(r => typeof r === 'string' && r.trim())
                .map((req, index) => (
                  <View key={index} className="flex-row items-start bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <CheckCircle size={16} color="#10b981" className="mt-0.5 mr-3" />
                    <Text className="flex-1 text-slate-600 font-medium leading-5">
                      {req.trim().replace(/^[-*•]\s*/, '')}
                    </Text>
                  </View>
                ))}
              {(!job.requirements || (Array.isArray(job.requirements) && job.requirements.length === 0)) && (
                <Text className="text-slate-500 font-medium italic">No specific requirements listed.</Text>
              )}
            </View>
          </View>

          {/* Admin Management Section */}
          {adminMode && (
            <View className="bg-slate-900 p-6 rounded-3xl shadow-md mt-4">
              <View className="flex-row items-center mb-5">
                <View className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center mr-3 border border-white/20">
                  <Briefcase size={20} color="white" />
                </View>
                <Text className="text-lg font-bold text-white">
                  Admin Controls
                </Text>
              </View>
              
              <View className="flex-row gap-3">
                <TouchableOpacity 
                  onPress={handleEditJob}
                  className="flex-1 flex-row items-center justify-center bg-white/10 border border-white/20 py-4 rounded-2xl active:bg-white/20"
                >
                  <Edit size={18} color="#ffffff" />
                  <Text className="ml-2 font-bold text-white">Edit</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={handleEndJob}
                  className={`flex-1 flex-row items-center justify-center py-4 rounded-2xl border ${job.is_active ? 'bg-red-500/20 border-red-500/30' : 'bg-green-500/20 border-green-500/30'}`}
                >
                  <Power size={18} color={job.is_active ? '#fca5a5' : '#86efac'} />
                  <Text className={`ml-2 font-bold ${job.is_active ? 'text-red-200' : 'text-green-200'}`}>
                    {job.is_active ? 'End Listing' : 'Reactivate'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text className="text-[11px] text-slate-400 font-medium mt-4 leading-relaxed text-center">
                As an admin, you have the authority to manage job listings for quality assurance and policy compliance.
              </Text>
            </View>
          )}

          {/* Admin Applicants List Section */}
          {isAdmin && (
            <View className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 mt-5">
              <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-2" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                Job Applicants ({applicants.length})
              </Text>
              
              {loadingApplicants ? (
                <ActivityIndicator size="small" color="#6366F1" className="py-6" />
              ) : applicants.length > 0 ? (
                <View className="flex-col gap-3">
                  {applicants.map((app) => (
                    <TouchableOpacity
                      key={app.id}
                      onPress={() => navigation.navigate('ApplicationReview', { applicationId: app.id, applicationData: app })}
                      className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex-row justify-between items-center"
                    >
                      <View className="flex-1 mr-4">
                        <Text className="text-sm font-bold text-slate-800" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                          {app.applicant_name}
                        </Text>
                        <Text className="text-xs text-slate-400 font-medium mt-0.5" style={{ fontFamily: 'Inter_400Regular' }}>
                          {app.applicant_title || 'Skilled Professional'}
                        </Text>
                        <Text className="text-[10px] text-slate-400 mt-2" style={{ fontFamily: 'Inter_400Regular' }}>
                          Applied: {new Date(app.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                      
                      <View className="flex-row items-center gap-2">
                        <View className={`px-2 py-1 rounded-lg ${
                          app.status === 'hired' ? 'bg-green-100 text-green-700' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          app.status === 'interview' ? 'bg-blue-100 text-blue-700' :
                          app.status === 'shortlisted' ? 'bg-cyan-100 text-cyan-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          <Text className="text-[9px] font-bold uppercase tracking-wider" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                            {app.status}
                          </Text>
                        </View>
                        <ChevronRight size={16} color="#CBD5E1" />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View className="py-8 items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Text className="text-slate-400 text-sm font-medium" style={{ fontFamily: 'Inter_500Medium' }}>No applications submitted yet.</Text>
                </View>
              )}
            </View>
          )}

          {/* Floating Action Button for Application */}
          {!isNgo && !isAdmin && (
            <View className="mt-4">
              <TouchableOpacity
                onPress={handleApply}
                disabled={job.has_applied}
                className={`py-4 rounded-2xl items-center justify-center flex-row shadow-lg ${
                  job.has_applied ? 'bg-slate-200 shadow-none' : 'bg-primary shadow-primary/30'
                }`}
              >
                <Text className={`text-base font-bold mr-2 ${job.has_applied ? 'text-slate-500' : 'text-white'}`}>
                  {job.has_applied ? "Already Applied" : "Apply Now"}
                </Text>
                {!job.has_applied && <CheckCircle size={18} color="white" />}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* ─── JOB APPLY MODAL ─── */}
      <Modal
        visible={showApplyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowApplyModal(false)}
      >
        <View className="flex-1 bg-slate-900/60 justify-end md:justify-center md:items-center">
          <View className="bg-white w-full max-w-lg rounded-t-[32px] md:rounded-[32px] p-6 max-h-[85%] border border-border/50">
            {/* Modal Header */}
            <View className="flex-row justify-between items-center mb-6">
              <View className="flex-1">
                <Text className="text-xl font-poppins-700 text-text-primary">Apply Now</Text>
                <Text className="text-xs font-poppins-400 text-text-secondary mt-1">
                  Applying for <Text className="font-poppins-600 text-primary">{job?.title}</Text> at {job?.ngo_name || 'NGO'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowApplyModal(false)}
                className="w-8 h-8 bg-slate-100 rounded-full items-center justify-center"
              >
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="space-y-6">
              {/* Cover Letter Input */}
              <View>
                <Text className="text-sm font-poppins-600 text-text-primary mb-2">Cover Letter</Text>
                <TextInput
                  multiline
                  numberOfLines={4}
                  placeholder="Share a brief introduction, your relevant skills, or why you are a great fit for this job..."
                  value={coverLetter}
                  onChangeText={setCoverLetter}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-text-primary font-poppins-400 text-sm"
                  style={[{ borderWidth: 0, backgroundColor: 'transparent', minHeight: 100, textAlignVertical: 'top' }, Platform.OS === 'web' && { outlineStyle: 'none' }]}
                />
              </View>

              {/* Application Type Selector */}
              <View>
                <Text className="text-sm font-poppins-600 text-text-primary mb-3">Application Method</Text>
                <View className="flex-row bg-slate-100 p-1 rounded-2xl">
                  <TouchableOpacity
                    onPress={() => setActiveTab('portfolio')}
                    className={`flex-1 py-3 rounded-xl items-center justify-center flex-row ${
                      activeTab === 'portfolio' ? 'bg-white shadow-sm' : ''
                    }`}
                  >
                    <Sparkles size={16} color={activeTab === 'portfolio' ? '#1E293B' : '#64748B'} />
                    <Text
                      className={`text-xs font-poppins-600 ml-2 ${
                        activeTab === 'portfolio' ? 'text-text-primary' : 'text-text-secondary'
                      }`}
                    >
                      Use Profile Portfolio
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setActiveTab('cv')}
                    className={`flex-1 py-3 rounded-xl items-center justify-center flex-row ${
                      activeTab === 'cv' ? 'bg-white shadow-sm' : ''
                    }`}
                  >
                    <FileText size={16} color={activeTab === 'cv' ? '#1E293B' : '#64748B'} />
                    <Text
                      className={`text-xs font-poppins-600 ml-2 ${
                        activeTab === 'cv' ? 'text-text-primary' : 'text-text-secondary'
                      }`}
                    >
                      Upload External CV
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Tab Content */}
              {activeTab === 'portfolio' ? (
                /* Profile Portfolio Preview Container */
                <View className="bg-slate-50 rounded-3xl p-5 border border-slate-100">
                  <View className="flex-row justify-between items-center mb-4 pb-3 border-b border-slate-200/50">
                    <Text className="text-xs font-poppins-700 text-slate-700 uppercase tracking-wider">
                      Portfolio Live Preview
                    </Text>
                    <View className="flex-row items-center bg-green-50 px-2 py-1 rounded-md">
                      <View className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5" />
                      <Text className="text-[10px] font-poppins-600 text-green-700">Synchronized</Text>
                    </View>
                  </View>

                  {loadingPortfolio ? (
                    <View className="py-8 items-center justify-center">
                      <ActivityIndicator size="small" color="#1E293B" />
                      <Text className="text-xs text-text-secondary font-poppins-400 mt-2">
                        Fetching latest portfolio data...
                      </Text>
                    </View>
                  ) : portfolio ? (
                    <View className="space-y-4">
                      {/* Name & Bio */}
                      <View>
                        <Text className="text-sm font-poppins-600 text-text-primary">
                          {portfolio.name || user?.name || 'Your Profile'}
                        </Text>
                        <Text className="text-xs text-text-secondary font-poppins-400 mt-1 leading-5">
                          {portfolio.bio || 'No bio specified. Update your profile portfolio to stand out!'}
                        </Text>
                      </View>

                      {/* Skills Preview */}
                      {portfolio.skills && portfolio.skills.length > 0 && (
                        <View>
                          <Text className="text-[10px] font-poppins-600 text-text-secondary uppercase mb-1.5">
                            Skills & Expertise
                          </Text>
                          <View className="flex-row flex-wrap gap-1.5">
                            {portfolio.skills.map((skill, idx) => (
                              <View key={idx} className="bg-slate-200/60 px-2.5 py-1 rounded-lg">
                                <Text className="text-[10px] font-poppins-500 text-slate-700">
                                  {skill.name || skill}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      {/* Dynamic highlights (Experience count, education) */}
                      <View className="flex-row gap-3 pt-2 border-t border-slate-200/40">
                        <View className="flex-1 bg-white p-2.5 rounded-xl border border-slate-200/40">
                          <Text className="text-[9px] font-poppins-600 text-text-secondary uppercase">
                            Experience
                          </Text>
                          <Text className="text-xs font-poppins-600 text-text-primary mt-0.5">
                            {portfolio.experiences?.length || 0} Entries
                          </Text>
                        </View>
                        <View className="flex-1 bg-white p-2.5 rounded-xl border border-slate-200/40">
                          <Text className="text-[9px] font-poppins-600 text-text-secondary uppercase">
                            Education
                          </Text>
                          <Text className="text-xs font-poppins-600 text-text-primary mt-0.5">
                            {portfolio.educations?.length || 0} Entries
                          </Text>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <View className="py-6 items-center justify-center">
                      <Text className="text-xs text-text-secondary font-poppins-400 text-center leading-5">
                        Unable to fetch portfolio. Make sure you have created your profile.
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                /* Upload External CV Container */
                <View className="space-y-4">
                  {!cvFile ? (
                    /* Dashboard Style Browse Box */
                    <TouchableOpacity
                      onPress={handlePickDocument}
                      className="border-2 border-dashed border-slate-300 rounded-3xl p-8 items-center justify-center bg-slate-50/50 hover:bg-slate-50"
                    >
                      <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center mb-3">
                        <FileUp size={24} color="#0F172A" />
                      </View>
                      <Text className="text-sm font-poppins-600 text-text-primary">
                        Browse Files
                      </Text>
                      <Text className="text-xs text-text-secondary font-poppins-400 mt-1 text-center">
                        Upload PDF, Word Doc, or Image (Max 5MB)
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    /* Attached CV Card */
                    <View className="bg-slate-50 rounded-3xl p-4 border border-slate-200/80 flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1 mr-3">
                        <View className="w-10 h-10 bg-primary/10 rounded-xl items-center justify-center">
                          <FileText size={20} color="#0F172A" />
                        </View>
                        <View className="ml-3 flex-1">
                          <Text
                            numberOfLines={1}
                            className="text-xs font-poppins-600 text-text-primary"
                          >
                            {cvFile.name}
                          </Text>
                          <Text className="text-[10px] font-poppins-400 text-text-secondary mt-0.5">
                            {cvFile.size ? `${(cvFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Size unknown'}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row gap-2">
                        <TouchableOpacity
                          onPress={() => setShowPreviewModal(true)}
                          className="w-8 h-8 bg-slate-200/80 rounded-full items-center justify-center"
                        >
                          <Eye size={14} color="#334155" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => setCvFile(null)}
                          className="w-8 h-8 bg-red-50 rounded-full items-center justify-center"
                        >
                          <Trash2 size={14} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>

            {/* Modal Actions */}
            <View className="flex-row gap-3 pt-6 border-t border-slate-100 mt-6">
              <TouchableOpacity
                disabled={applying}
                onPress={() => setShowApplyModal(false)}
                className="flex-1 py-4 border border-slate-200 rounded-2xl items-center justify-center"
              >
                <Text className="text-sm font-poppins-600 text-text-secondary">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={applying}
                onPress={submitApplication}
                className="flex-2 bg-primary py-4 rounded-2xl items-center justify-center flex-row shadow-lg shadow-primary/20"
              >
                {applying ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Text className="text-sm font-poppins-600 text-white mr-2">Submit Application</Text>
                    <CheckCircle size={16} color="white" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── CV FILE PREVIEW MODAL ─── */}
      <Modal
        visible={showPreviewModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowPreviewModal(false)}
      >
        <View className="flex-1 bg-slate-950/80 justify-center items-center p-6">
          <View className="bg-white w-full max-w-2xl h-[80%] rounded-[32px] overflow-hidden border border-border">
            {/* Preview Header */}
            <View className="flex-row justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <View className="flex-row items-center flex-1 mr-4">
                <FileText size={20} color="#0F172A" />
                <Text numberOfLines={1} className="text-sm font-poppins-600 text-text-primary ml-2">
                  Preview: {cvFile?.name || 'Resume'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowPreviewModal(false)}
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
                          <Text className="text-[10px] font-poppins-600 text-text-secondary uppercase">File Name</Text>
                          <Text numberOfLines={1} className="text-[10px] font-poppins-600 text-text-primary flex-1 text-right ml-4">{cvFile?.name}</Text>
                        </View>
                        <View className="flex-row justify-between">
                          <Text className="text-[10px] font-poppins-600 text-text-secondary uppercase">File Type</Text>
                          <Text className="text-[10px] font-poppins-600 text-text-primary capitalize">{cvFile?.mimeType || 'Document'}</Text>
                        </View>
                        <View className="flex-row justify-between">
                          <Text className="text-[10px] font-poppins-600 text-text-secondary uppercase">File Size</Text>
                          <Text className="text-[10px] font-poppins-600 text-text-primary">{cvFile?.size ? `${(cvFile.size / (1024 * 1024)).toFixed(2)} MB` : 'N/A'}</Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        onPress={() => {
                          if (cvFile?.uri) {
                            Linking.openURL(cvFile.uri).catch(() => {
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
                if (!cvFile?.uri) {
                  return (
                    <View className="items-center bg-white p-8 rounded-3xl border border-slate-200 w-full max-w-sm">
                      <FileText size={48} color="#94A3B8" className="mb-4" />
                      <Text className="text-sm font-poppins-600 text-text-secondary">No document uploaded yet</Text>
                    </View>
                  );
                }

                const fileName = cvFile?.name || '';
                const mimeType = cvFile?.mimeType || '';
                const isImage = mimeType.startsWith('image/') || /\.(png|jpe?g|gif|webp)$/i.test(fileName);
                const isPdf = mimeType === 'application/pdf' || /\.pdf$/i.test(fileName);
                const isWord = mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                              mimeType === 'application/msword' || 
                              /\.(docx|doc)$/i.test(fileName);

                if (isImage) {
                  return (
                    <Image
                      source={{ uri: cvFile.uri }}
                      style={{ width: '100%', height: '100%', resizeMode: 'contain', borderRadius: 16 }}
                    />
                  );
                }

                if (isPdf) {
                  return (
                    <View style={{ width: '100%', height: '100%', position: 'relative' }}>
                      <iframe
                        src={cvFile.uri}
                        style={{ width: '100%', height: '100%', border: 'none', borderRadius: 16 }}
                      />
                    </View>
                  );
                }

                // Word documents and other unsupported inline preview formats
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
                        <Text className="text-[10px] font-poppins-600 text-text-secondary uppercase">File Name</Text>
                        <Text numberOfLines={1} className="text-[10px] font-poppins-600 text-text-primary flex-1 text-right ml-4">{cvFile?.name}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-[10px] font-poppins-600 text-text-secondary uppercase">File Size</Text>
                        <Text className="text-[10px] font-poppins-600 text-text-primary">
                          {cvFile?.size ? `${(cvFile.size / (1024 * 1024)).toFixed(2)} MB` : 'N/A'}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => {
                        if (cvFile?.uri) {
                          Linking.openURL(cvFile.uri).catch(() => {
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

export default JobDetailScreen;
