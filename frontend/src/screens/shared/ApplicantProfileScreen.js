import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, Linking, Platform, ActivityIndicator, Modal } from 'react-native';
import Screen from '../../components/common/Screen';
import { 
  ArrowLeft, 
  MapPin, 
  Mail, 
  Phone, 
  Linkedin, 
  Github, 
  Globe,
  FileText,
  Briefcase,
  CheckCircle2,
  XCircle,
  Download,
  Clock,
  Eye,
  X,
  GraduationCap,
  Award,
  Sparkles
} from 'lucide-react-native';
import adminService from '../../services/adminService';
import JobsService from '../../services/jobsService';
import { getMediaUrl } from '../../lib/api';
import Avatar from '../../components/common/Avatar';

const ApplicantProfileScreen = ({ route, navigation }) => {
  const { applicantId, applicantData } = route.params || {};
  const [applicant, setApplicant] = useState(applicantData || null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [showCvPreview, setShowCvPreview] = useState(false);
  const [previewCvUrl, setPreviewCvUrl] = useState('');
  const [previewApplicantName, setPreviewApplicantName] = useState('');

  useEffect(() => {
    fetchData();
  }, [applicantId, applicantData]);

  const fetchData = async () => {
    setLoading(true);
    const targetId = applicantId || applicantData?.applicant || applicantData?.id;
    if (!targetId) {
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch complete applicant profile details
      const userProfile = await adminService.getUserById(targetId);
      setApplicant(userProfile);

      // 2. Fetch submissions history from NGO applications
      setLoadingSubmissions(true);
      const subs = await JobsService.getNgoApplications({ applicant: targetId });
      setSubmissions(subs || []);
    } catch (error) {
      console.warn('Failed to load profile data:', error);
      // Fallback: If adminService fails (e.g. not authorized), use the passed applicantData
      if (applicantData) {
        setApplicant(applicantData);
      }
    } finally {
      setLoading(false);
      setLoadingSubmissions(false);
    }
  };

  const getApplicantValue = (...keys) => {
    for (const key of keys) {
      const value = applicant?.[key] ?? applicantData?.[key];
      if (Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && value !== '') {
        return value;
      }
    }
    return null;
  };

  const displayName = getApplicantValue('full_name', 'applicant_name', 'name', 'email') || 'Applicant';
  const displayRole = applicant?.role === 'ngo'
    ? 'NGO Organization'
    : applicant?.role
      ? `${applicant.role.charAt(0).toUpperCase() + applicant.role.slice(1)}`
      : 'Skilled Professional';
  const displayTitle = getApplicantValue('professional_title', 'applicant_title') || 'Skilled Professional';
  const displayLocation = getApplicantValue('location', 'address', 'municipality', 'ward') || 'Location unavailable';
  const displayEmail = getApplicantValue('email', 'applicant_email');
  const displayPhone = getApplicantValue('phone_number', 'phone');
  const displayBio = getApplicantValue('bio', 'applicant_bio') || "This professional hasn't added a bio yet. They are committed to making a social impact in Nepal through their skills.";
  const skills = getApplicantValue('skills', 'applicant_skills') || [];
  const website = getApplicantValue('website') || applicant?.ngo_profile?.website || null;
  const profileImage = applicant?.profile_image || applicantData?.applicant_profile_image || applicantData?.profile_image || null;

  // Resolve portfolio pieces from both user and application schemas
  const experiences = applicant?.experiences || applicantData?.applicant_portfolio?.experiences || [];
  const education = applicant?.education || applicantData?.applicant_portfolio?.education || [];
  const certifications = applicant?.certifications || applicantData?.applicant_portfolio?.certifications || [];

  const handleAction = async (action) => {
    const targetAppId = applicantData?.id;
    if (!targetAppId) {
      const msg = "Application context not found. Cannot perform status update.";
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Error', msg);
      return;
    }

    setActionLoading(true);
    try {
      if (action === 'rejected') {
        await JobsService.rejectApplication(targetAppId, { reason: 'Screened from profile' });
      } else if (['shortlisted', 'interview', 'hired'].includes(action)) {
        await JobsService.approveApplication(targetAppId, { status: action });
      }
      
      const successMsg = `Applicant status updated to ${action} successfully!`;
      if (Platform.OS === 'web') alert(successMsg);
      else Alert.alert('Success', successMsg);
      
      navigation.goBack();
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message || `Failed to ${action} applicant`;
      if (Platform.OS === 'web') alert(errorMsg);
      else Alert.alert('Error', errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const openLink = (url) => {
    if (!url) return;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Cannot open link'));
  };

  if (loading) {
    return (
      <Screen className="items-center justify-center bg-[#FAFAFA]">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="text-text-secondary font-medium mt-4">Loading candidate profile...</Text>
      </Screen>
    );
  }

  if (!applicant) return null;

  return (
    <Screen scrollable className="bg-[#FAFAFA]">
      {/* Premium Overlapping Header */}
      <View className="bg-primary pt-16 pb-20 rounded-b-[40px] shadow-lg shadow-primary/20 relative">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="absolute top-12 left-6 w-10 h-10 items-center justify-center bg-white/20 rounded-full border border-white/30 z-10"
        >
          <ArrowLeft size={20} color="#ffffff" />
        </TouchableOpacity>
        
        <View className="items-center mt-4">
          <View className="w-32 h-32 bg-white/20 rounded-full items-center justify-center mb-4 border-4 border-white shadow-xl relative">
            {profileImage ? (
              <Avatar size={120} name={displayName || 'Applicant'} source={profileImage} />
            ) : (
              <Text className="text-5xl font-bold text-white">
                {(displayName || 'Applicant').charAt(0).toUpperCase()}
              </Text>
            )}

            {/* KYC Badge */}
            {(applicant?.applicant_kyc_verified || applicant?.is_kyc_verified || ['verified', 'approved'].includes(applicant?.kyc_status)) && (
              <View className="absolute top-0 right-2 w-8 h-8 bg-[#10b981] items-center justify-center rounded-full border-4 border-white shadow-sm">
                <CheckCircle2 size={14} color="white" />
              </View>
            )}
          </View>
          
          <Text className="text-3xl font-bold text-white mb-1 shadow-sm">{displayName}</Text>
          <View className="bg-white/20 px-4 py-1.5 rounded-full mt-1 border border-white/30">
            <Text className="text-xs font-semibold text-white uppercase tracking-widest">{displayRole}</Text>
          </View>
          <View className="flex-row items-center mt-3 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
            <MapPin size={12} color="#ffffff" className="opacity-90" />
            <Text className="text-xs font-medium text-white ml-1.5">{displayLocation}</Text>
          </View>
        </View>
      </View>

      <View className="px-5 -mt-8 mb-8">
        {/* Contact Bento Grid */}
        <View className="flex-row justify-between mb-6">
          <TouchableOpacity 
            disabled={!displayEmail}
            onPress={() => openLink(`mailto:${displayEmail}`)}
            className="flex-1 bg-white rounded-3xl p-5 mr-2 shadow-sm border border-slate-100 items-center justify-center min-h-[110px]"
          >
            <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center mb-2">
              <Mail size={24} color="#6366F1" />
            </View>
            <Text className="text-[10px] text-text-muted mt-1 uppercase font-bold tracking-widest text-center">Email</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            disabled={!displayPhone}
            onPress={() => openLink(`tel:${displayPhone}`)}
            className="flex-1 bg-white rounded-3xl p-5 mx-2 shadow-sm border border-slate-100 items-center justify-center min-h-[110px]"
          >
            <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center mb-2">
              <Phone size={24} color="#3b82f6" />
            </View>
            <Text className="text-[10px] text-text-muted mt-1 uppercase font-bold tracking-widest text-center">Call</Text>
          </TouchableOpacity>

          {website ? (
          <TouchableOpacity 
            onPress={() => openLink(website)}
            className="flex-1 bg-white rounded-3xl p-5 ml-2 shadow-sm border border-slate-100 items-center justify-center min-h-[110px]"
          >
            <View className="w-12 h-12 bg-emerald-50 rounded-full items-center justify-center mb-2">
              <Globe size={24} color="#10b981" />
            </View>
            <Text className="text-[10px] text-text-muted mt-1 uppercase font-bold tracking-widest text-center">Website</Text>
          </TouchableOpacity>
          ) : (
          <View className="flex-1 bg-slate-50/50 rounded-3xl p-5 ml-2 border border-slate-100 items-center justify-center min-h-[110px]">
            <View className="w-12 h-12 bg-slate-100 rounded-full items-center justify-center mb-2">
              <Globe size={24} color="#94a3b8" />
            </View>
            <Text className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest text-center">No Web</Text>
          </View>
          )}
        </View>

        {/* Professional Summary */}
        <View className="bg-white rounded-[32px] p-6 mb-6 shadow-sm border border-slate-100">
          <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-2">Professional Summary</Text>
          <View className="mb-3">
            <Text className="text-xl font-bold text-text">{displayTitle}</Text>
          </View>
          <View className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <Text className="text-sm font-medium text-slate-600 leading-6">{displayBio}</Text>
          </View>
        </View>

        {/* Skills */}
        {Array.isArray(skills) && skills.length > 0 && (
          <View className="bg-white rounded-[32px] p-6 mb-6 shadow-sm border border-slate-100">
            <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-2">Core Skills</Text>
            <View className="flex-row flex-wrap gap-2">
              {skills.map((skill, index) => (
                <View key={`${skill}-${index}`} className="px-4 py-2 bg-primary/5 border border-primary/10 rounded-full">
                  <Text className="text-[11px] font-bold text-primary tracking-wide">{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Experiences */}
        {Array.isArray(experiences) && experiences.length > 0 && (
          <View className="bg-white rounded-[32px] p-6 mb-6 shadow-sm border border-slate-100">
            <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-2">Work Experience</Text>
            <View className="space-y-4">
              {experiences.map((exp, index) => (
                <View key={exp.id || index} className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1 mr-4">
                      <Text className="text-base font-semibold text-text">{exp.job_title}</Text>
                      <Text className="text-sm font-medium text-primary mt-1">{exp.company_name}</Text>
                    </View>
                    <View className="bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
                      <Text className="text-[10px] font-bold text-slate-500">
                        {exp.start_date} - {exp.currently_working ? 'Present' : exp.end_date}
                      </Text>
                    </View>
                  </View>
                  {exp.description && (
                    <Text className="text-sm font-medium text-slate-600 leading-5 mt-2">{exp.description}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Education */}
        {Array.isArray(education) && education.length > 0 && (
          <View className="bg-white rounded-[32px] p-6 mb-6 shadow-sm border border-slate-100">
            <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-2">Education</Text>
            <View className="space-y-4">
              {education.map((edu, index) => (
                <View key={edu.id || index} className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1 mr-4">
                      <Text className="text-base font-semibold text-text">{edu.degree}</Text>
                      <Text className="text-sm font-medium text-primary mt-1">{edu.school_name}</Text>
                    </View>
                    <View className="bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
                      <Text className="text-[10px] font-bold text-slate-500">
                        {edu.start_year} - {edu.end_year || 'Present'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Certifications */}
        {Array.isArray(certifications) && certifications.length > 0 && (
          <View className="bg-white rounded-[32px] p-6 mb-6 shadow-sm border border-slate-100">
            <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-2">Certifications</Text>
            <View className="space-y-4">
              {certifications.map((cert, index) => (
                <View key={cert.id || index} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex-row items-center justify-between">
                  <View className="flex-1 mr-4">
                    <Text className="text-base font-semibold text-text">{cert.name}</Text>
                    <Text className="text-sm font-medium text-primary mt-1">{cert.issuing_organization}</Text>
                  </View>
                  {cert.issue_date && (
                    <View className="bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
                      <Text className="text-[10px] font-bold text-slate-500">{cert.issue_date}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Submissions Timeline / CV Section */}
        <View className="bg-white rounded-[32px] p-6 mb-6 shadow-sm border border-slate-100">
          <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-2">Application Details</Text>
          
          {/* If applied via CV */}
          {(applicantData?.application_type === 'cv' || applicantData?.cv_file) && (
            <View className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-4 flex-row items-center justify-between">
              <View className="flex-row items-center flex-1 mr-4">
                <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center">
                  <FileText size={24} color="#6366F1" />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-sm font-semibold text-text">External CV File</Text>
                  <Text className="text-xs font-medium text-slate-500 mt-0.5">Submitted with application</Text>
                </View>
              </View>
              
              <View className="flex-row gap-3">
                <TouchableOpacity 
                  onPress={() => {
                    setPreviewCvUrl(applicantData.cv_file);
                    setPreviewApplicantName(displayName);
                    setShowCvPreview(true);
                  }}
                  className="bg-white w-10 h-10 rounded-full items-center justify-center border border-slate-100 shadow-sm"
                >
                  <Eye size={18} color="#64748b" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => {
                    Linking.openURL(applicantData.cv_file).catch(() => {
                      Alert.alert('Error', 'Unable to open file link.');
                    });
                  }}
                  className="bg-white w-10 h-10 rounded-full items-center justify-center border border-slate-100 shadow-sm"
                >
                  <Download size={18} color="#6366F1" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Cover Letter */}
          {applicantData?.cover_letter && (
            <View className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-4">
              <Text className="text-xs font-semibold text-slate-700 mb-2">Cover Letter</Text>
              <Text className="text-sm font-medium text-slate-600 leading-6">{applicantData.cover_letter}</Text>
            </View>
          )}

          {/* Timeline of other applications */}
          {submissions.length > 0 ? (
            <View className="mt-4">
              <Text className="text-[10px] text-slate-400 uppercase font-bold mb-3 tracking-wider">Application History</Text>
              <View className="space-y-3">
                {submissions.map((sub) => (
                  <View key={sub.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex-row justify-between items-center">
                    <View className="flex-1 mr-4">
                      <Text className="text-sm font-semibold text-text">{sub.job_title}</Text>
                      <Text className="text-xs font-medium text-slate-500 mt-1">Applied via {sub.application_type.toUpperCase()}</Text>
                    </View>
                    
                    <View className={`px-3 py-1.5 rounded-full ${
                      sub.status === 'hired' ? 'bg-emerald-50 border border-emerald-100' :
                      sub.status === 'rejected' ? 'bg-rose-50 border border-rose-100' :
                      sub.status === 'interview' ? 'bg-indigo-50 border border-indigo-100' :
                      'bg-amber-50 border border-amber-100'
                    }`}>
                      <Text className={`text-[10px] font-bold uppercase tracking-wider ${
                        sub.status === 'hired' ? 'text-emerald-600' :
                        sub.status === 'rejected' ? 'text-rose-600' :
                        sub.status === 'interview' ? 'text-indigo-600' :
                        'text-amber-600'
                      }`}>{sub.status}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : loadingSubmissions ? (
            <ActivityIndicator size="small" color="#6366F1" />
          ) : null}
        </View>

        {/* Action Buttons for NGO/Admin */}
        {applicantData?.id && (
          <View className="bg-white rounded-[32px] p-6 mb-12 shadow-sm border border-slate-100">
            <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-2">Application Actions</Text>
            <View className="flex-row flex-wrap gap-3">
              <TouchableOpacity 
                onPress={() => handleAction('rejected')}
                disabled={actionLoading}
                className="flex-1 min-w-[140px] h-14 bg-white border border-slate-200 rounded-2xl items-center justify-center flex-row"
              >
                {actionLoading ? (
                  <ActivityIndicator color="#94a3b8" />
                ) : (
                  <>
                    <XCircle size={20} color="#94a3b8" />
                    <Text className="text-slate-600 font-semibold ml-2">Reject</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => handleAction('shortlisted')}
                disabled={actionLoading}
                className="flex-1 min-w-[140px] h-14 bg-blue-600 rounded-2xl items-center justify-center flex-row"
              >
                {actionLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <CheckCircle2 size={20} color="white" />
                    <Text className="text-white font-semibold ml-2">Shortlist</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => handleAction('interview')}
                disabled={actionLoading}
                className="flex-1 min-w-[140px] h-14 bg-indigo-600 rounded-2xl items-center justify-center flex-row"
              >
                {actionLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Clock size={20} color="white" />
                    <Text className="text-white font-semibold ml-2">Interview</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => handleAction('hired')}
                disabled={actionLoading}
                className="flex-1 min-w-[140px] h-14 bg-emerald-600 rounded-2xl items-center justify-center flex-row shadow-sm shadow-emerald-600/20"
              >
                {actionLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <CheckCircle2 size={20} color="white" />
                    <Text className="text-white font-bold ml-2">Hire</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* ─── CV FILE PREVIEW MODAL ─── */}
      <Modal
        visible={showCvPreview}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowCvPreview(false)}
      >
        <View className="flex-1 bg-slate-950/80 justify-center items-center p-6">
          <View className="bg-white w-full max-w-2xl h-[80%] rounded-[32px] overflow-hidden border border-border shadow-2xl">
            {/* Preview Header */}
            <View className="flex-row justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <View className="flex-row items-center flex-1 mr-4">
                <FileText size={20} color="#6366F1" />
                <Text numberOfLines={1} className="text-sm font-semibold text-text ml-2">
                  CV Preview: {previewApplicantName}
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
                      <FileText size={48} color="#6366F1" className="mb-4" />
                      <Text className="text-base font-bold text-text text-center">
                        Interactive Native Preview
                      </Text>
                      <Text className="text-xs text-slate-500 font-medium mt-2 text-center leading-5">
                        Your platform will open this file in the default system document reader/viewer.
                      </Text>
                      
                      {/* File Metadata Table */}
                      <View className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 my-5 space-y-2">
                        <View className="flex-row justify-between">
                          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Candidate</Text>
                          <Text numberOfLines={1} className="text-[10px] font-bold text-text flex-1 text-right ml-4">{previewApplicantName}</Text>
                        </View>
                        <View className="flex-row justify-between">
                          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">File Type</Text>
                          <Text className="text-[10px] font-bold text-text">Document File</Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        onPress={() => {
                          if (previewCvUrl) {
                            Linking.openURL(previewCvUrl).catch(() => {
                              Alert.alert('Error', 'Unable to open file in system application.');
                            });
                          }
                        }}
                        className="bg-primary px-6 py-4 rounded-2xl flex-row items-center w-full justify-center"
                      >
                        <Eye size={16} color="white" className="mr-2" />
                        <Text className="text-xs font-bold tracking-wide text-white">Open with System Reader</Text>
                      </TouchableOpacity>
                    </View>
                  );
                }

                // If on Web
                if (!previewCvUrl) {
                  return (
                    <View className="items-center bg-white p-8 rounded-3xl border border-slate-200 w-full max-w-sm">
                      <FileText size={48} color="#94A3B8" className="mb-4" />
                      <Text className="text-sm font-semibold text-slate-500">No document submitted</Text>
                    </View>
                  );
                }

                const rawCv = previewCvUrl;
                let fileName = 'attached_resume.pdf';
                if (rawCv && typeof rawCv === 'string' && !rawCv.includes('[object Object]') && !rawCv.includes('%5Bobject%20Object%5D')) {
                  fileName = rawCv.split('/').pop() || 'attached_resume.pdf';
                }
                const isImage = /\.(png|jpe?g|gif|webp)$/i.test(fileName);
                const isPdf = /\.pdf$/i.test(fileName);

                if (isImage) {
                  return (
                    <Image
                      source={{ uri: previewCvUrl }}
                      style={{ width: '100%', height: '100%', resizeMode: 'contain', borderRadius: 16 }}
                    />
                  );
                }

                if (isPdf) {
                  return (
                    <View style={{ width: '100%', height: '100%' }}>
                      <iframe
                        src={previewCvUrl}
                        style={{ width: '100%', height: '100%', border: 'none', borderRadius: 16 }}
                      />
                    </View>
                  );
                }

                // Word documents and other unsupported inline preview formats
                return (
                  <View className="items-center max-w-sm bg-white p-8 rounded-3xl border border-slate-200 shadow-sm w-full">
                    <View className="w-16 h-16 bg-blue-50 rounded-2xl items-center justify-center mb-4">
                      <FileText size={36} color="#3b82f6" />
                    </View>
                    
                    <Text className="text-base font-bold text-text text-center">
                      Word Document Preview
                    </Text>
                    <Text className="text-xs text-slate-500 font-medium mt-2 text-center leading-5">
                      Microsoft Word documents (.docx/.doc) cannot be previewed natively inline. Click the button below to download and view this document on your device.
                    </Text>
                    
                    {/* File Metadata Table */}
                    <View className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 my-5 space-y-2">
                      <View className="flex-row justify-between">
                        <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Candidate</Text>
                        <Text numberOfLines={1} className="text-[10px] font-bold text-text flex-1 text-right ml-4">{previewApplicantName}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">File Name</Text>
                        <Text numberOfLines={1} className="text-[10px] font-bold text-text flex-1 text-right ml-4">{fileName}</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => {
                        if (previewCvUrl) {
                          Linking.openURL(previewCvUrl).catch(() => {
                            Alert.alert('Error', 'Unable to download file.');
                          });
                        }
                      }}
                      className="bg-primary py-4 rounded-2xl flex-row items-center w-full justify-center shadow-lg shadow-primary/20"
                    >
                      <Download size={16} color="white" className="mr-2" />
                      <Text className="text-xs font-bold tracking-wide text-white">Download Document</Text>
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

export default ApplicantProfileScreen;
