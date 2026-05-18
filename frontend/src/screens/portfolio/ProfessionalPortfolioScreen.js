import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { ArrowLeft, MoreVertical, CheckCircle2 } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../theme/theme';
import useAuthStore from '../../stores/authStore';

const ProfessionalPortfolioScreen = ({ route, navigation }) => {
  const user = useAuthStore((s) => s.user);
  const displayUser = route.params?.user || user;

  const portfolio = {
    name: displayUser?.full_name || displayUser?.username || 'Care Professional',
    role: displayUser?.professional_title || 'Social Worker',
    verified: displayUser?.is_kyc_verified || false,
    image: displayUser?.full_name?.charAt(0) || '👨‍💼',
    bio: displayUser?.bio || 'Dedicated social worker committed to making a social impact in Nepal through their skills.',
    skills: displayUser?.skills || ['Community Outreach', 'Program Management', 'Healthcare'],
    experience: displayUser?.experience || [
      { role: displayUser?.professional_title || 'Professional', org: 'Care Connect Nepal', duration: '2024 - Present', },
    ],
    ratings: { average: 5.0, total: 1 },
  };

  const SkillBadge = ({ skill }) => (
    <View style={{
      backgroundColor: COLORS.secondary_fixed,
      paddingHorizontal: SPACING.m,
      paddingVertical: SPACING.s,
      borderRadius: BORDER_RADIUS.full,
      marginRight: SPACING.s,
      marginBottom: SPACING.s,
    }}>
      <Text style={{
        color: COLORS.secondary,
        fontWeight: '600',
        fontSize: 12,
      }}>
        {skill}
      </Text>
    </View>
  );

  const renderAvatar = () => {
    if (displayUser?.profile_image) {
      return (
        <Image 
          source={{ uri: displayUser.profile_image }} 
          style={{ width: '100%', height: '100%', borderRadius: BORDER_RADIUS.l }} 
        />
      );
    }
    return (
      <Text style={{ fontSize: 36, fontWeight: '700', color: COLORS.on_primary_fixed }}>
        {portfolio.image}
      </Text>
    );
  };

  const renderKycBadge = () => {
    if (!portfolio.verified) return null;
    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.tertiary_fixed,
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        borderRadius: BORDER_RADIUS.m,
        marginBottom: SPACING.m,
      }}>
        <CheckCircle2 size={16} color={COLORS.tertiary} style={{ marginRight: SPACING.s }} />
        <Text style={{
          color: COLORS.tertiary,
          fontWeight: '600',
          fontSize: 12,
        }}>
          Verified Professional
        </Text>
      </View>
    );
  };

  const renderSkills = () => {
    return portfolio.skills.map((skill, index) => (
      <SkillBadge key={index} skill={skill} />
    ));
  };

  const renderExperience = () => {
    return portfolio.experience.map((exp, index) => (
      <View
        key={index}
        style={{
          backgroundColor: COLORS.surface_container_lowest,
          borderRadius: BORDER_RADIUS.m,
          padding: SPACING.m,
          marginBottom: SPACING.m,
          borderWidth: 1,
          borderColor: COLORS.outline_variant,
        }}
      >
        <Text style={{
          fontWeight: '600',
          color: COLORS.on_surface,
          marginBottom: SPACING.xs,
        }}>
          {exp.role}
        </Text>
        <Text style={{
          fontSize: 13,
          color: COLORS.on_surface_variant,
          marginBottom: SPACING.xs,
        }}>
          {exp.org}
        </Text>
        <Text style={{
          fontSize: 12,
          color: COLORS.on_surface_variant,
        }}>
          {exp.duration}
        </Text>
      </View>
    ));
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface }}>
      {/* Header */}
      <View style={{
        backgroundColor: COLORS.surface,
        paddingHorizontal: SPACING.m,
        paddingTop: SPACING.m,
        paddingBottom: SPACING.m,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.outline_variant,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={COLORS.on_surface} />
        </TouchableOpacity>
        <Text style={{
          fontSize: 18,
          fontWeight: '700',
          color: COLORS.on_surface,
        }}>
          Portfolio
        </Text>
        <TouchableOpacity>
          <MoreVertical size={24} color={COLORS.on_surface} />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Hero Section */}
        <View style={{
          backgroundColor: COLORS.surface_container_lowest,
          paddingBottom: SPACING.l,
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: COLORS.outline_variant,
        }}>
          <View style={{
            width: 80,
            height: 80,
            borderRadius: BORDER_RADIUS.l,
            backgroundColor: COLORS.primary_fixed,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: SPACING.l,
            marginBottom: SPACING.m,
            borderWidth: 3,
            borderColor: COLORS.surface,
          }}>
            {renderAvatar()}
          </View>
          <Text style={{
            fontSize: 22,
            fontWeight: '700',
            color: COLORS.on_surface,
            marginBottom: SPACING.s,
          }}>
            {portfolio.name}
          </Text>
          <Text style={{
            fontSize: 14,
            color: COLORS.on_surface_variant,
            marginBottom: SPACING.m,
          }}>
            {portfolio.role}
          </Text>
          {renderKycBadge()}
        </View>

        {/* Content */}
        <View style={{ padding: SPACING.m }}>
          {/* Bio */}
          <View style={{ marginBottom: SPACING.l }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '700',
              color: COLORS.on_surface,
              marginBottom: SPACING.m,
            }}>
              About
            </Text>
            <Text style={{
              fontSize: 14,
              color: COLORS.on_surface_variant,
              lineHeight: 20,
            }}>
              {portfolio.bio}
            </Text>
          </View>

          {/* Skills */}
          <View style={{ marginBottom: SPACING.l }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '700',
              color: COLORS.on_surface,
              marginBottom: SPACING.m,
            }}>
              Skills
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {renderSkills()}
            </View>
          </View>

          {/* Experience */}
          <View style={{ marginBottom: SPACING.l }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '700',
              color: COLORS.on_surface,
              marginBottom: SPACING.m,
            }}>
              Experience
            </Text>
            {renderExperience()}
          </View>

          {/* CTA Buttons */}
          <View style={{ gap: SPACING.m, marginBottom: SPACING.l }}>
            <TouchableOpacity
              style={{
                backgroundColor: COLORS.primary,
                paddingVertical: SPACING.m,
                borderRadius: BORDER_RADIUS.l,
                alignItems: 'center',
              }}
            >
              <Text style={{
                color: COLORS.on_primary,
                fontWeight: '700',
                fontSize: 14,
              }}>
                Hire Now
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: COLORS.surface_container,
                paddingVertical: SPACING.m,
                borderRadius: BORDER_RADIUS.l,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: COLORS.secondary,
              }}
            >
              <Text style={{
                color: COLORS.secondary,
                fontWeight: '700',
                fontSize: 14,
              }}>
                Message
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfessionalPortfolioScreen;
