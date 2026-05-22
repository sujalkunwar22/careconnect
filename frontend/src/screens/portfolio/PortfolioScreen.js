import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  User, Mail, MapPin, Briefcase, GraduationCap, Award, Download, Globe,
  ShieldCheck, Edit2, Plus, CheckCircle2, Star, ArrowLeft,
  AlertTriangle, Clock, XCircle
} from 'lucide-react-native';
import PortfolioService from '../../services/portfolioService';
import useAuthStore from '../../stores/authStore';

const COLORS = {
  primary: '#6366F1',
  primaryContainer: '#818CF8',
  secondary: '#485f84',
  tertiary: '#286182',
  surface: '#F8FAFC',
  surfaceContainer: '#EEF2FF',
  onSurface: '#0F172A',
  onSurfaceVariant: '#475569',
  outline: '#94A3B8',
  outlineVariant: '#E2E8F0',
  success: '#2D6A4F',
  white: '#ffffff',
  border: '#E9ECEF',
  navy: '#0F172A',
  red: '#6366F1',
};

const PortfolioScreen = ({ navigation }) => {
  const { user } = useAuthStore();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchPortfolio();
    }, [])
  );

  const fetchPortfolio = async () => {
    try {
      const data = await PortfolioService.getPortfolio();
      
      // Merge with current user data to ensure bio/skills are always up to date
      // even if the portfolio endpoint hasn't updated yet
      setPortfolio({
        ...data,
        bio: data.bio || user?.bio || 'Professional summary not provided yet.',
        skills: (Array.isArray(data.skills) && data.skills.length > 0) 
          ? data.skills 
          : (Array.isArray(user?.skills) ? user.skills : []),
        experience: data.experience || data.experiences || [],
        certifications: data.certifications || [],
        education: data.education || [],
      });
    } catch (error) {
      console.error("[PortfolioScreen] Error fetching portfolio:", error);
      // Fallback to user data
      setPortfolio({
        bio: user?.bio || 'Professional summary not provided yet.',
        skills: Array.isArray(user?.skills) ? user.skills : [],
        languages: [],
        experience: [],
        certifications: [],
        education: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const renderKycDot = () => {
    const status = String(user?.kyc_status || '').toLowerCase();
    const isVerified = user?.is_kyc_verified || ['verified', 'approved'].includes(status);
    
    if (isVerified) {
      return (
        <View style={[styles.verifiedDot, { backgroundColor: '#10B981' }]}>
          <ShieldCheck size={12} color="#fff" />
        </View>
      );
    }
    if (['pending', 'submitted', 'in_review'].includes(status)) {
      return (
        <View style={[styles.verifiedDot, { backgroundColor: '#F59E0B' }]}>
          <Clock size={10} color="#fff" />
        </View>
      );
    }
    if (['rejected', 'failed', 'info_requested'].includes(status)) {
      return (
        <View style={[styles.verifiedDot, { backgroundColor: '#EF4444' }]}>
          <AlertTriangle size={10} color="#fff" />
        </View>
      );
    }
    return null;
  };

  const renderKycBadge = () => {
    const status = String(user?.kyc_status || '').toLowerCase();
    const isVerified = user?.is_kyc_verified || ['verified', 'approved'].includes(status);
    
    if (isVerified) {
      return (
        <View style={[styles.verifiedBadge, { backgroundColor: '#10B981' }]}>
          <CheckCircle2 size={11} color="#fff" />
          <Text style={styles.verifiedBadgeText}>VERIFIED</Text>
        </View>
      );
    }
    if (['pending', 'submitted', 'in_review'].includes(status)) {
      return (
        <View style={[styles.verifiedBadge, { backgroundColor: '#F59E0B' }]}>
          <Clock size={11} color="#fff" />
          <Text style={styles.verifiedBadgeText}>IN REVIEW</Text>
        </View>
      );
    }
    if (['rejected', 'failed', 'info_requested'].includes(status)) {
      return (
        <TouchableOpacity 
          onPress={() => navigation.navigate('KycSubmit')}
          style={[styles.verifiedBadge, { backgroundColor: '#EF4444' }]}
        >
          <AlertTriangle size={11} color="#fff" />
          <Text style={styles.verifiedBadgeText}>{status === 'info_requested' ? 'FIX NEEDED' : 'REJECTED'}</Text>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity 
        onPress={() => navigation.navigate('KycSubmit')}
        style={[styles.verifiedBadge, { backgroundColor: '#94A3B8' }]}
      >
        <AlertTriangle size={11} color="#fff" />
        <Text style={styles.verifiedBadgeText}>UNVERIFIED</Text>
      </TouchableOpacity>
    );
  };

  const renderExperience = () => {
    const experiences = portfolio?.experience || [];
    if (experiences.length === 0) return null;

    return experiences.map((exp, idx) => {
      const bulletsList = exp.bullets || (exp.description ? exp.description.split('\n').map(b => b.trim()).filter(Boolean) : []);
      const periodText = exp.period || (exp.start_year && exp.end_year ? `${exp.start_year} - ${exp.end_year}` : exp.start_year || exp.end_year || '');
      
      return (
        <View key={exp.id || idx} style={[styles.timelineItem, idx > 0 && { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#f1f5f9' }]}>
          <View style={{ flexDirection: 'row' }}>
            <View style={styles.timelineIcon}>
              <Briefcase size={18} color={COLORS.navy} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.expTitle}>{exp.job_title || exp.title}</Text>
              <Text style={styles.expCompany}>{exp.organization || exp.company}</Text>
              {!!periodText && <Text style={styles.expPeriod}>{periodText}</Text>}
              {bulletsList.map((bullet, bIdx) => (
                <View key={bIdx} style={styles.bulletRow}>
                  <CheckCircle2 size={14} color={COLORS.success} />
                  <Text style={styles.bulletText}>{bullet}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      );
    });
  };

  const renderCertifications = () => {
    const certs = portfolio?.certifications || [];
    if (certs.length === 0) return null;

    return certs.map((cert, idx) => (
      <View key={cert.id || idx} style={styles.certItem}>
        <View style={styles.certIcon}>
          <Award size={22} color={COLORS.red} />
        </View>
        <View>
          <Text style={styles.certName}>{cert.name}</Text>
          <Text style={styles.certIssuer}>{cert.issuer}</Text>
          <Text style={styles.certDate}>{cert.date}</Text>
        </View>
      </View>
    ));
  };

  const renderCertificationsSection = () => {
    const certs = portfolio?.certifications || [];
    if (certs.length === 0) return null;
    return (
      <View style={styles.sectionCard}>
        <View style={styles.sectionTitleRow}>
          <View style={[styles.sectionIconWrap, { backgroundColor: '#fde8ea' }]}>
            <Award size={16} color={COLORS.primaryContainer} />
          </View>
          <Text style={styles.sectionTitle}>Certifications</Text>
        </View>
        {renderCertifications()}
      </View>
    );
  };

  const renderEducation = () => {
    const educationList = portfolio?.education || [];
    if (educationList.length === 0) return null;

    return educationList.map((edu, idx) => {
      const yearText = edu.year || (edu.start_year && edu.end_year ? `${edu.start_year} - ${edu.end_year}` : edu.start_year || edu.end_year || '');
      return (
        <View key={edu.id || idx} style={styles.certItem}>
          <View style={[styles.certIcon, { backgroundColor: '#FEF3C7' }]}>
            <GraduationCap size={22} color="#B45309" />
          </View>
          <View>
            <Text style={styles.certName}>{edu.degree}</Text>
            <Text style={styles.certIssuer}>{edu.institution}</Text>
            <Text style={styles.certDate}>{yearText}</Text>
          </View>
        </View>
      );
    });
  };

  const renderSkills = () => {
    const skills = portfolio?.skills || [];
    if (skills.length === 0) return null;
    return skills.map((skill, idx) => (
      <View key={idx} style={styles.skillChip}>
        <Text style={styles.skillText}>{skill}</Text>
      </View>
    ));
  };

  const renderLanguages = () => {
    const languages = portfolio?.languages || [];
    if (languages.length === 0) return null;
    return (
      <View style={{ marginTop: 20 }}>
        <Text style={styles.subSectionTitle}>Language Proficiency</Text>
        {languages.map((lang, idx) => (
          <View key={idx} style={styles.langRow}>
            <Text style={styles.langName}>{lang.name}</Text>
            <View style={styles.langBarBg}>
              <View style={[styles.langBarFill, { width: `${lang.level}%` }]} />
            </View>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.red} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <ArrowLeft size={24} color={COLORS.navy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Professional Portfolio</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Cover + Avatar */}
        <View style={styles.coverSection}>
          <View style={styles.coverBg} />
          <View style={styles.avatarRow}>
            <View style={styles.avatarContainer}>
              {user?.profile_image ? (
                <Image source={{ uri: user.profile_image }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitial}>{(user?.full_name || user?.username || 'U').charAt(0)}</Text>
                </View>
              )}
              {renderKycDot()}
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('EditPortfolio')}
            >
              <Edit2 size={18} color={COLORS.navy} />
            </TouchableOpacity>
          </View>

          <View style={styles.profileMeta}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{user?.full_name || user?.username || 'Care Professional'}</Text>
              {renderKycBadge()}
            </View>
            <Text style={styles.profession}>{user?.professional_title || 'Healthcare Professional'}</Text>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <MapPin size={13} color={COLORS.outline} />
                <Text style={styles.metaText}>{user?.address || 'Nepal'}</Text>
              </View>
              <View style={styles.metaItem}>
                <Mail size={13} color={COLORS.outline} />
                <Text style={styles.metaText}>{user?.email || user?.phone_number}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Core Expertise */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionIconWrap}>
              <Star size={16} color={COLORS.navy} />
            </View>
            <Text style={styles.sectionTitle}>Core Expertise</Text>
          </View>
          <View style={styles.skillsGrid}>
            {renderSkills()}
          </View>

          {/* Language Proficiency */}
          {renderLanguages()}
        </View>

        {/* Professional Summary */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.sectionIconWrap, { backgroundColor: '#e2f0ea' }]}>
              <User size={16} color={COLORS.success} />
            </View>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
          </View>
          <Text style={styles.bioText}>
            {portfolio?.bio || 'No professional summary provided yet.'}
          </Text>
        </View>

        {/* Experience */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.sectionIconWrap, { backgroundColor: '#e0f0f8' }]}>
              <Briefcase size={16} color={COLORS.tertiary} />
            </View>
            <Text style={styles.sectionTitle}>Experience</Text>
            <TouchableOpacity 
              style={styles.addBtn}
              onPress={() => navigation.navigate('AddExperience')}
            >
              <Plus size={16} color={COLORS.red} />
            </TouchableOpacity>
          </View>

          {renderExperience()}
        </View>

        {/* Certifications */}
        {renderCertificationsSection()}

        {/* Education */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.sectionIconWrap, { backgroundColor: '#FEF3C7' }]}>
              <GraduationCap size={16} color="#B45309" />
            </View>
            <Text style={styles.sectionTitle}>Education</Text>
            <TouchableOpacity 
              style={styles.addBtn}
              onPress={() => navigation.navigate('AddEducation')}
            >
              <Plus size={16} color={COLORS.red} />
            </TouchableOpacity>
          </View>
          {renderEducation()}
        </View>

        {/* Download Button */}
        <TouchableOpacity style={styles.downloadBtn}>
          <Download size={18} color={COLORS.navy} />
          <Text style={styles.downloadBtnText}>Download Resume PDF</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 Care Connect Nepal. Empowering Social Impact.</Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.surface },
  scrollContent: { paddingBottom: 24 },

  // Cover
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
  },
  coverSection: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3,
  },
  coverBg: {
    height: 100,
    backgroundColor: COLORS.navy,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    marginTop: -48,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: COLORS.white,
    backgroundColor: '#f1f5f9',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 6,
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarFallback: {
    width: '100%', height: '100%', backgroundColor: COLORS.navy,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: { fontSize: 40, fontFamily: 'Poppins_700Bold', color: '#fff' },
  verifiedDot: {
    position: 'absolute', bottom: 6, right: 6,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: COLORS.success, borderWidth: 2, borderColor: COLORS.white,
    alignItems: 'center', justifyContent: 'center',
  },
  editBtn: {
    padding: 12, backgroundColor: '#f1f5f9', borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 4,
  },
  profileMeta: {
    paddingHorizontal: 24, marginTop: 14,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  userName: { fontSize: 26, fontFamily: 'Poppins_600SemiBold', color: COLORS.onSurface, lineHeight: 34 },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: COLORS.success,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  verifiedBadgeText: { color: '#fff', fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 0.8 },
  profession: { fontSize: 16, fontFamily: 'Inter_500Medium', color: COLORS.red, marginTop: 2 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, fontFamily: 'Inter_400Regular', color: COLORS.outline },

  // Section Cards
  sectionCard: {
    marginHorizontal: 20, marginTop: 20, backgroundColor: COLORS.white,
    borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionIconWrap: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: '#e8edf4',
    alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: { fontSize: 18, fontFamily: 'Poppins_600SemiBold', color: COLORS.onSurface, flex: 1 },
  addBtn: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: '#fde8ea',
    alignItems: 'center', justifyContent: 'center',
  },

  // Skills
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillChip: {
    backgroundColor: COLORS.surfaceContainer, paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 8, borderWidth: 1, borderColor: COLORS.outlineVariant,
  },
  skillText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: COLORS.onSurface },

  // Languages
  subSectionTitle: {
    fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: COLORS.onSurfaceVariant, marginBottom: 12,
  },
  langRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10,
  },
  langName: { fontSize: 13, fontFamily: 'Inter_500Medium', color: COLORS.onSurface, width: 70 },
  langBarBg: {
    flex: 1, height: 8, borderRadius: 4, backgroundColor: '#f1f5f9',
  },
  langBarFill: {
    height: 8, borderRadius: 4, backgroundColor: COLORS.navy,
  },

  // Bio
  bioText: {
    fontSize: 14, fontFamily: 'Inter_400Regular', color: COLORS.onSurfaceVariant, lineHeight: 22,
  },

  // Experience
  timelineItem: {},
  timelineIcon: {
    width: 40, height: 40, borderRadius: 10, backgroundColor: '#e8edf4',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  expTitle: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: COLORS.onSurface },
  expCompany: { fontSize: 14, fontFamily: 'Inter_500Medium', color: COLORS.secondary, marginTop: 1 },
  expPeriod: { fontSize: 12, fontFamily: 'Inter_400Regular', color: COLORS.outline, marginTop: 2, marginBottom: 10 },
  bulletRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 6,
  },
  bulletText: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', color: COLORS.onSurfaceVariant, lineHeight: 19 },

  // Certifications / Education
  certItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 4,
  },
  certIcon: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: '#fde8ea',
    alignItems: 'center', justifyContent: 'center',
  },
  certName: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: COLORS.onSurface },
  certIssuer: { fontSize: 13, fontFamily: 'Inter_400Regular', color: COLORS.secondary, marginTop: 1 },
  certDate: { fontSize: 12, fontFamily: 'Inter_400Regular', color: COLORS.outline, marginTop: 1 },

  // Download
  downloadBtn: {
    marginHorizontal: 20, marginTop: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.navy,
    backgroundColor: COLORS.white,
  },
  downloadBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: COLORS.navy },

  // Footer
  footer: {
    marginHorizontal: 20, marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.outlineVariant,
    alignItems: 'center',
  },
  footerText: { fontSize: 11, fontFamily: 'Inter_400Regular', color: COLORS.outline },
});

export default PortfolioScreen;
