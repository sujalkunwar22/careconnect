import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Linking, Modal, Platform, TextInput } from 'react-native';
import Screen from '../../components/common/Screen';
import Button from '../../components/common/Button';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  MapPin, 
  Briefcase, 
  Clock, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Download,
  ShieldCheck,
  FileText,
  Sparkles,
  GraduationCap,
  Award,
  Eye,
  X
} from 'lucide-react-native';
import JobsService from '../../services/jobsService';

const ApplicationReviewScreen = ({ route, navigation }) => {
  const { applicationId, applicationData } = route.params || {};
  const [application, setApplication] = useState(applicationData || null);
  const [loading, setLoading] = useState(!applicationData);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCvPreview, setShowCvPreview] = useState(false);

  // Interview modal states
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewPlatform, setInterviewPlatform] = useState('Google Meet');
  const [interviewLink, setInterviewLink] = useState('');
  const [interviewMessage, setInterviewMessage] = useState('');

  // Input focus states for sleek UI outline highlights
  const [isDateFocused, setIsDateFocused] = useState(false);
  const [isTimeFocused, setIsTimeFocused] = useState(false);
  const [isPlatformFocused, setIsPlatformFocused] = useState(false);
  const [isLinkFocused, setIsLinkFocused] = useState(false);
  const [isMessageFocused, setIsMessageFocused] = useState(false);

  useEffect(() => {
    const targetId = applicationId || applicationData?.id;
    if (targetId) {
      fetchApplicationDetails(targetId);
    }
  }, [applicationId, applicationData]);

  const fetchApplicationDetails = async (id) => {
    setLoading(true);
    try {
      const data = await JobsService.getNgoApplicationDetail(id);
      setApplication(data);
    } catch (error) {
      console.warn('Failed to load application details:', error);
      Alert.alert('Error', 'Failed to load application details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status, details = {}) => {
    setActionLoading(true);
    try {
      if (status === 'Rejected') {
        await JobsService.rejectApplication(application.id, { 
          reason: details.reason || 'Application rejected',
          rejection_category: details.rejection_category || 'other'
        });
      } else {
        await JobsService.approveApplication(application.id, { status, ...details });
      }
      Alert.alert('Success', `Application moved to ${status}`);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator size="large" color="#6366F1" />
      </Screen>
    );
  }

  if (!application) return null;

  return (
    <Screen scrollable className="bg-background">
      {/* Header */}
      <View className="px-6 pt-4 flex-row items-center justify-between mb-6">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center bg-white rounded-full shadow-sm"
        >
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-lg font-poppins-700 text-text-primary">Review Application</Text>
        <View className="w-10" />
      </View>

        {/* Profile Card */}
        <TouchableOpacity 
          activeOpacity={0.85}
          onPress={() => {
            if (application.applicant) {
              navigation.navigate('ApplicantProfile', {
                applicantId: application.applicant,
                applicantData: application,
              });
            } else {
              if (Platform.OS === 'web') alert('Candidate ID not found on this application.');
              else Alert.alert('Profile Unavailable', 'Candidate ID not found on this application.');
            }
          }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-border/50 mb-6 items-center"
        >
          <View className="relative mb-4">
            <View className="w-24 h-24 rounded-full bg-slate-200 border-4 border-slate-50 overflow-hidden shadow-sm">
              <Image 
                source={{ uri: application.applicant_profile_image || 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?q=80&w=1000&auto=format&fit=crop' }} 
                className="w-full h-full"
              />
            </View>
            {application.verified && (
              <View className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1 border-2 border-white">
                <ShieldCheck size={14} color="white" />
              </View>
            )}
          </View>
          
          <Text className="text-xl font-poppins-700 text-text-primary text-center">{application.applicant_name}</Text>
          <Text className="text-text-secondary font-poppins-500 text-xs text-center mt-1">Applied for: {application.job_title}</Text>
          
          {/* Applied Method Badge */}
          <View className="flex-row items-center mt-3 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
            {application.application_type === 'cv' ? (
              <FileText size={12} color="#0F172A" />
            ) : (
              <Sparkles size={12} color="#0F172A" />
            )}
            <Text className="text-primary font-poppins-600 text-[10px] ml-1.5 uppercase tracking-wider">
              {application.application_type === 'cv' ? 'Applied via External CV' : 'Applied via Profile Portfolio'}
            </Text>
          </View>

          <View className="flex-row items-center mt-4 bg-slate-50 px-4 py-2 rounded-full border border-border/50">
            <MapPin size={12} color="#6366F1" />
            <Text className="text-text-primary font-poppins-600 text-[10px] ml-1">{application.location || 'Kathmandu, Nepal'}</Text>
          </View>

          <Text className="text-primary font-poppins-600 text-[10px] mt-4 uppercase tracking-wider">
            View Full Candidate Profile & History →
          </Text>
        </TouchableOpacity>


        {/* Info Bento */}
        <View className="flex-row gap-4 mb-6">
          <View className="flex-1 bg-white rounded-3xl p-4 border border-border/50 shadow-sm items-center">
            <Text className="text-text-secondary font-poppins-600 text-[10px] uppercase mb-1">Experience</Text>
            <Text className="text-lg font-poppins-700 text-primary">
              {application.application_type === 'portfolio' && application.applicant_portfolio?.experiences?.length
                ? `${application.applicant_portfolio.experiences.length} Entries`
                : `${application.experience_years || '5'}+ yrs`}
            </Text>
          </View>
          <View className="flex-1 bg-white rounded-3xl p-4 border border-border/50 shadow-sm items-center">
            <Text className="text-text-secondary font-poppins-600 text-[10px] uppercase mb-1">Status</Text>
            <Text className="text-lg font-poppins-700 text-secondary">{application.status}</Text>
          </View>
        </View>

        {/* Cover Letter Section */}
        {application.cover_letter ? (
          <View className="bg-white rounded-3xl p-6 shadow-sm border border-border/50 mb-6">
            <Text className="text-sm font-poppins-700 text-text-primary mb-3">Cover Letter</Text>
            <Text className="text-text-secondary font-poppins-400 text-xs leading-5">
              {application.cover_letter}
            </Text>
          </View>
        ) : null}

        {/* Dynamic Details Content based on Application Type */}
        {application.application_type === 'cv' ? (
          /* ─── CV FILE CARD ─── */
          <View className="bg-white rounded-3xl p-6 shadow-sm border border-border/50 mb-6">
            <Text className="text-sm font-poppins-700 text-text-primary mb-4">Attached Curriculum Vitae (CV)</Text>
            {application.cv_file ? (
              <View className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex-row items-center justify-between">
                <View className="flex-row items-center flex-1 mr-4">
                  <View className="w-12 h-12 bg-primary/10 rounded-xl items-center justify-center">
                    <FileText size={24} color="#0F172A" />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text numberOfLines={1} className="text-xs font-poppins-600 text-text-primary">
                      {(() => {
                        const rawCv = application.cv_file;
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
                  className="bg-primary px-4 py-2.5 rounded-xl flex-row items-center"
                >
                  <Eye size={12} color="white" className="mr-1.5" />
                  <Text className="text-[10px] font-poppins-600 text-white">View CV</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text className="text-text-secondary font-poppins-400 text-xs italic">
                No CV file is attached to this application.
              </Text>
            )}
          </View>
        ) : (
          /* ─── PORTFOLIO DETAILS ─── */
          <View className="space-y-6">
            {/* Bio Card */}
            {application.applicant_portfolio?.bio && (
              <View className="bg-white rounded-3xl p-6 shadow-sm border border-border/50">
                <Text className="text-sm font-poppins-700 text-text-primary mb-3">About Candidate</Text>
                <Text className="text-text-secondary font-poppins-400 text-xs leading-5">
                  {application.applicant_portfolio.bio}
                </Text>
              </View>
            )}

            {/* Skills Card */}
            {application.applicant_portfolio?.skills && application.applicant_portfolio.skills.length > 0 && (
              <View className="bg-white rounded-3xl p-6 shadow-sm border border-border/50">
                <Text className="text-sm font-poppins-700 text-text-primary mb-4">Skills & Expertise</Text>
                <View className="flex-row flex-wrap gap-2">
                  {application.applicant_portfolio.skills.map((skill, idx) => (
                    <View key={idx} className="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/40">
                      <Text className="text-xs font-poppins-500 text-slate-700">
                        {skill.name || skill}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Experiences Card */}
            {application.applicant_portfolio?.experiences && application.applicant_portfolio.experiences.length > 0 && (
              <View className="bg-white rounded-3xl p-6 shadow-sm border border-border/50">
                <Text className="text-sm font-poppins-700 text-text-primary mb-4">Work Experience</Text>
                <View className="space-y-5">
                  {application.applicant_portfolio.experiences.map((exp, idx) => (
                    <View key={idx} className="flex-row items-start">
                      <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center mr-3 mt-0.5">
                        <Briefcase size={14} color="#64748B" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs font-poppins-700 text-text-primary">{exp.job_title}</Text>
                        <Text className="text-[10px] font-poppins-600 text-text-secondary mt-0.5">
                          {exp.company} • {exp.start_date ? new Date(exp.start_date).toLocaleDateString() : ''} - {exp.end_date ? new Date(exp.end_date).toLocaleDateString() : 'Present'}
                        </Text>
                        {exp.description ? (
                          <Text className="text-[10px] text-text-secondary font-poppins-400 leading-4 mt-2">
                            {exp.description}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Education Card */}
            {application.applicant_portfolio?.educations && application.applicant_portfolio.educations.length > 0 && (
              <View className="bg-white rounded-3xl p-6 shadow-sm border border-border/50">
                <Text className="text-sm font-poppins-700 text-text-primary mb-4">Education</Text>
                <View className="space-y-4">
                  {application.applicant_portfolio.educations.map((edu, idx) => (
                    <View key={idx} className="flex-row items-start">
                      <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center mr-3 mt-0.5">
                        <GraduationCap size={14} color="#64748B" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs font-poppins-700 text-text-primary">{edu.degree}</Text>
                        <Text className="text-[10px] font-poppins-600 text-text-secondary mt-0.5">
                          {edu.institution} • {edu.start_date ? new Date(edu.start_date).toLocaleDateString() : ''} - {edu.end_date ? new Date(edu.end_date).toLocaleDateString() : 'N/A'}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Certifications Card */}
            {application.applicant_portfolio?.certifications && application.applicant_portfolio.certifications.length > 0 && (
              <View className="bg-white rounded-3xl p-6 shadow-sm border border-border/50">
                <Text className="text-sm font-poppins-700 text-text-primary mb-4">Certifications & Licenses</Text>
                <View className="space-y-4">
                  {application.applicant_portfolio.certifications.map((cert, idx) => (
                    <View key={idx} className="flex-row items-start">
                      <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center mr-3 mt-0.5">
                        <Award size={14} color="#64748B" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs font-poppins-700 text-text-primary">{cert.name}</Text>
                        <Text className="text-[10px] font-poppins-600 text-text-secondary mt-0.5">
                          Issued by {cert.issuing_organization} • {cert.issue_date ? new Date(cert.issue_date).toLocaleDateString() : ''}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Actions */}
        <View className="bg-white rounded-3xl p-6 shadow-sm border border-border/50 mb-10">
          <Text className="text-sm font-poppins-700 text-text-primary mb-6">Take Action</Text>
          
          <View className="flex-row gap-4 mb-4">
            <Button
              title="Shortlist"
              onPress={() => handleUpdateStatus('Shortlisted')}
              isLoading={actionLoading}
              className="flex-1 shadow-sm"
              variant="outline"
              icon={<CheckCircle size={18} color="#D85D2D" strokeWidth={2.5} />}
            />
            <Button
              title="Interview"
              onPress={() => setShowInterviewModal(true)}
              isLoading={actionLoading}
              className="flex-1 shadow-sm"
              icon={<Calendar size={18} color="white" />}
            />
          </View>
          
          <View className="flex-row gap-4">
            <TouchableOpacity 
              className="flex-1 bg-green-50 rounded-2xl py-4 items-center justify-center border border-green-100"
              onPress={() => handleUpdateStatus('Hired')}
            >
              <CheckCircle size={20} color="#2D6A4F" />
              <Text className="text-green-700 font-poppins-600 text-xs mt-1">Hire</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-1 bg-red-50 rounded-2xl py-4 items-center justify-center border border-red-100"
              onPress={() => handleUpdateStatus('Rejected')}
            >
              <XCircle size={20} color="#6366F1" />
              <Text className="text-red-700 font-poppins-600 text-xs mt-1">Reject</Text>
            </TouchableOpacity>
          </View>
          
          {application.application_type === 'cv' && application.cv_file ? (
            <TouchableOpacity 
              className="mt-6 py-4 flex-row items-center justify-center border-t border-border/50"
              onPress={() => {
                Linking.openURL(application.cv_file).catch(() => {
                  Alert.alert('Error', 'Unable to open download URL.');
                });
              }}
            >
              <Download size={16} color="#0F172A" />
              <Text className="text-secondary font-poppins-600 text-xs ml-2">Download CV Attachment</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* ─── INTERVIEW SCHEDULE MODAL ─── */}
        <Modal
          visible={showInterviewModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowInterviewModal(false)}
        >
          <View className="flex-1 bg-slate-950/80 justify-center items-center p-6">
            <View className="bg-white w-full max-w-lg rounded-[32px] overflow-hidden border border-border shadow-2xl">
              {/* Header */}
              <View className="flex-row justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
                <View className="flex-row items-center">
                  <Calendar size={20} color="#6366F1" />
                  <Text className="text-sm font-poppins-600 text-text-primary ml-2">
                    Schedule Interview
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowInterviewModal(false)}
                  className="w-8 h-8 bg-slate-200/60 rounded-full items-center justify-center"
                >
                  <X size={16} color="#475569" />
                </TouchableOpacity>
              </View>

              {/* Form Fields */}
              <ScrollView className="p-6 max-h-[450px]">
                {/* Date */}
                <View className="mb-4">
                  <Text className="text-slate-600 font-bold text-xs mb-2">Date (e.g. YYYY-MM-DD or MM/DD/YYYY)</Text>
                  <View className={`border rounded-2xl bg-slate-50 px-4 py-3 flex-row items-center ${isDateFocused ? 'border-primary' : 'border-slate-200'}`}>
                    <TextInput
                      style={[{ borderWidth: 0, backgroundColor: 'transparent', flex: 1, fontSize: 13, color: '#1E293B' }, Platform.OS === 'web' && { outlineStyle: 'none' }]}
                      placeholder="Enter interview date"
                      placeholderTextColor="#94A3B8"
                      value={interviewDate}
                      onChangeText={setInterviewDate}
                      onFocus={() => setIsDateFocused(true)}
                      onBlur={() => setIsDateFocused(false)}
                    />
                  </View>
                </View>

                {/* Time */}
                <View className="mb-4">
                  <Text className="text-slate-600 font-bold text-xs mb-2">Time (e.g. 2:00 PM)</Text>
                  <View className={`border rounded-2xl bg-slate-50 px-4 py-3 flex-row items-center ${isTimeFocused ? 'border-primary' : 'border-slate-200'}`}>
                    <TextInput
                      style={[{ borderWidth: 0, backgroundColor: 'transparent', flex: 1, fontSize: 13, color: '#1E293B' }, Platform.OS === 'web' && { outlineStyle: 'none' }]}
                      placeholder="Enter interview time"
                      placeholderTextColor="#94A3B8"
                      value={interviewTime}
                      onChangeText={setInterviewTime}
                      onFocus={() => setIsTimeFocused(true)}
                      onBlur={() => setIsTimeFocused(false)}
                    />
                  </View>
                </View>

                {/* Platform */}
                <View className="mb-4">
                  <Text className="text-slate-600 font-bold text-xs mb-2">Platform / Location (e.g. Google Meet, Zoom, Office)</Text>
                  <View className={`border rounded-2xl bg-slate-50 px-4 py-3 flex-row items-center ${isPlatformFocused ? 'border-primary' : 'border-slate-200'}`}>
                    <TextInput
                      style={[{ borderWidth: 0, backgroundColor: 'transparent', flex: 1, fontSize: 13, color: '#1E293B' }, Platform.OS === 'web' && { outlineStyle: 'none' }]}
                      placeholder="e.g. Google Meet"
                      placeholderTextColor="#94A3B8"
                      value={interviewPlatform}
                      onChangeText={setInterviewPlatform}
                      onFocus={() => setIsPlatformFocused(true)}
                      onBlur={() => setIsPlatformFocused(false)}
                    />
                  </View>
                </View>

                {/* Link / Address */}
                <View className="mb-4">
                  <Text className="text-slate-600 font-bold text-xs mb-2">Meeting Link / Address</Text>
                  <View className={`border rounded-2xl bg-slate-50 px-4 py-3 flex-row items-center ${isLinkFocused ? 'border-primary' : 'border-slate-200'}`}>
                    <TextInput
                      style={[{ borderWidth: 0, backgroundColor: 'transparent', flex: 1, fontSize: 13, color: '#1E293B' }, Platform.OS === 'web' && { outlineStyle: 'none' }]}
                      placeholder="Enter location or meeting URL"
                      placeholderTextColor="#94A3B8"
                      value={interviewLink}
                      onChangeText={setInterviewLink}
                      onFocus={() => setIsLinkFocused(true)}
                      onBlur={() => setIsLinkFocused(false)}
                    />
                  </View>
                </View>

                {/* Message */}
                <View className="mb-4">
                  <Text className="text-slate-600 font-bold text-xs mb-2">Message to Candidate</Text>
                  <View className={`border rounded-2xl bg-slate-50 px-4 py-3 flex-row items-center ${isMessageFocused ? 'border-primary' : 'border-slate-200'}`}>
                    <TextInput
                      style={[{ borderWidth: 0, backgroundColor: 'transparent', flex: 1, fontSize: 13, color: '#1E293B' }, Platform.OS === 'web' && { outlineStyle: 'none' }]}
                      placeholder="Any notes or instructions for the candidate..."
                      placeholderTextColor="#94A3B8"
                      value={interviewMessage}
                      onChangeText={setInterviewMessage}
                      multiline
                      numberOfLines={3}
                      onFocus={() => setIsMessageFocused(true)}
                      onBlur={() => setIsMessageFocused(false)}
                    />
                  </View>
                </View>
              </ScrollView>

              {/* Actions */}
              <View className="p-6 border-t border-slate-100 bg-slate-50 flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setShowInterviewModal(false)}
                  className="flex-1 bg-white border border-slate-200 py-3.5 rounded-2xl items-center justify-center"
                >
                  <Text className="text-slate-700 font-poppins-600 text-xs">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    if (!interviewDate || !interviewTime) {
                      Alert.alert('Error', 'Please fill in date and time.');
                      return;
                    }
                    setShowInterviewModal(false);
                    handleUpdateStatus('Interview', {
                      date: interviewDate,
                      time: interviewTime,
                      platform: interviewPlatform,
                      location_or_link: interviewLink,
                      message: interviewMessage,
                    });
                  }}
                  className="flex-1 bg-primary py-3.5 rounded-2xl items-center justify-center shadow-lg shadow-primary/20"
                >
                  <Text className="text-white font-poppins-600 text-xs">Schedule</Text>
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
        <View className="flex-1 bg-slate-950/80 justify-center items-center p-6">
          <View className="bg-white w-full max-w-2xl h-[80%] rounded-[32px] overflow-hidden border border-border shadow-2xl">
            {/* Preview Header */}
            <View className="flex-row justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <View className="flex-row items-center flex-1 mr-4">
                <FileText size={20} color="#0F172A" />
                <Text numberOfLines={1} className="text-sm font-poppins-600 text-text-primary ml-2">
                  CV Preview: {application?.applicant_name}
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
                          <Text className="text-[10px] font-poppins-600 text-text-secondary uppercase">Candidate</Text>
                          <Text numberOfLines={1} className="text-[10px] font-poppins-600 text-text-primary flex-1 text-right ml-4">{application?.applicant_name}</Text>
                        </View>
                        <View className="flex-row justify-between">
                          <Text className="text-[10px] font-poppins-600 text-text-secondary uppercase">File Type</Text>
                          <Text className="text-[10px] font-poppins-600 text-text-primary">Document File</Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        onPress={() => {
                          if (application?.cv_file) {
                            Linking.openURL(application.cv_file).catch(() => {
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
                if (!application?.cv_file) {
                  return (
                    <View className="items-center bg-white p-8 rounded-3xl border border-slate-200 w-full max-w-sm">
                      <FileText size={48} color="#94A3B8" className="mb-4" />
                      <Text className="text-sm font-poppins-600 text-text-secondary">No document submitted</Text>
                    </View>
                  );
                }

                const fileUrl = application.cv_file;
                const fileName = fileUrl.split('/').pop() || 'Document';
                const isImage = /\.(png|jpe?g|gif|webp)$/i.test(fileName);
                const isPdf = /\.pdf$/i.test(fileName);
                const isWord = /\.(docx|doc)$/i.test(fileName);

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
                        <Text className="text-[10px] font-poppins-600 text-text-secondary uppercase">Candidate</Text>
                        <Text numberOfLines={1} className="text-[10px] font-poppins-600 text-text-primary flex-1 text-right ml-4">{application?.applicant_name}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-[10px] font-poppins-600 text-text-secondary uppercase">File Name</Text>
                        <Text numberOfLines={1} className="text-[10px] font-poppins-600 text-text-primary flex-1 text-right ml-4">{fileName}</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => {
                        if (application?.cv_file) {
                          Linking.openURL(application.cv_file).catch(() => {
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

export default ApplicationReviewScreen;
