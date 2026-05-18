import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Stop, Rect, Path, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

const slides = [
  {
    title: 'Connect with NGOs',
    desc: 'Find meaningful career opportunities with verified non-profit organizations across Nepal.',
    colors: ['#6366F1', '#C1121F'],
  },
  {
    title: 'Build Your Portfolio',
    desc: 'Showcase your experience, certifications, and skills to stand out from the crowd.',
    colors: ['#0F172A', '#0D1B2A'],
  },
  {
    title: 'Get Verified',
    desc: 'Complete KYC verification to unlock premium job listings and build trust with employers.',
    colors: ['#2D6A4F', '#1B4332'],
  },
];

function SlideIllustration({ colors, index }) {
  return (
    <Svg width={width * 0.7} height={200} viewBox="0 0 280 200">
      <Defs>
        <LinearGradient id={`og${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={colors[0]} />
          <Stop offset="100%" stopColor={colors[1]} />
        </LinearGradient>
      </Defs>
      <Rect x={40} y={20} width={200} height={160} rx={20} fill={`url(#og${index})`} />
      <Circle cx={140} cy={80} r={30} fill="#ffffff" opacity={0.15} />
      <Circle cx={140} cy={80} r={18} fill="#ffffff" opacity={0.2} />
      <Path d={`M40 140 Q100 100 160 130 Q220 160 240 120`} fill="none" stroke="#ffffff" strokeWidth={2} opacity={0.3} />
      <Path d={`M40 160 Q120 130 200 155 Q230 165 240 150`} fill="none" stroke="#ffffff" strokeWidth={1.5} opacity={0.2} />
      {index === 0 && <>
        <Rect x={110} y={60} width={60} height={40} rx={4} fill="#ffffff" opacity={0.2} />
        <Rect x={115} y={65} width={40} height={3} rx={1} fill="#ffffff" opacity={0.4} />
        <Rect x={115} y={72} width={30} height={3} rx={1} fill="#ffffff" opacity={0.3} />
      </>}
      {index === 1 && <>
        <Rect x={115} y={55} width={50} height={50} rx={25} fill="#ffffff" opacity={0.12} />
        <Path d="M130 75 L140 65 L150 75" fill="none" stroke="#ffffff" strokeWidth={2} opacity={0.4} />
      </>}
      {index === 2 && <>
        <Path d="M125 70 L135 80 L155 60" fill="none" stroke="#ffffff" strokeWidth={3} opacity={0.4} strokeLinecap="round" />
      </>}
    </Svg>
  );
}

export default function OnboardingScreen({ navigation }) {
  const [activeSlide, setActiveSlide] = useState(0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
        {/* Logo */}
        <Text style={{
          fontSize: 28, color: '#6366F1', fontFamily: 'Poppins_700Bold',
          marginBottom: 40, letterSpacing: -0.5,
        }}>
          Care Connect Nepal
        </Text>

        {/* Slide */}
        <SlideIllustration colors={slides[activeSlide].colors} index={activeSlide} />

        <Text style={{
          fontSize: 24, color: '#0F172A', fontFamily: 'Poppins_600SemiBold',
          textAlign: 'center', marginTop: 32,
        }}>
          {slides[activeSlide].title}
        </Text>

        <Text style={{
          fontSize: 15, color: '#64748B', fontFamily: 'Inter_400Regular',
          textAlign: 'center', marginTop: 12, lineHeight: 22, paddingHorizontal: 16,
        }}>
          {slides[activeSlide].desc}
        </Text>

        {/* Dots */}
        <View style={{ flexDirection: 'row', marginTop: 32, gap: 8 }}>
          {slides.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => setActiveSlide(i)}>
              <View style={{
                width: i === activeSlide ? 24 : 8, height: 8, borderRadius: 4,
                backgroundColor: i === activeSlide ? '#6366F1' : '#CBD5E1',
              }} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Buttons */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 24, gap: 12 }}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={{
            backgroundColor: '#6366F1', borderRadius: 12, height: 52,
            alignItems: 'center', justifyContent: 'center',
          }}
          activeOpacity={0.8}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'Poppins_600SemiBold' }}>
            Get Started
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={{
            borderColor: '#6366F1', borderWidth: 1.5, borderRadius: 12, height: 52,
            alignItems: 'center', justifyContent: 'center',
          }}
          activeOpacity={0.8}
        >
          <Text style={{ color: '#6366F1', fontSize: 16, fontFamily: 'Poppins_600SemiBold' }}>
            I already have an account
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
