import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Image, Dimensions, FlatList } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Screen from '../components/common/Screen';
import JobsService from '../services/jobsService';
import useAuthStore from '../stores/authStore';

// Import carousel images
const carouselImages = [
  require('../public/image 1.png'),
  require('../public/image 2.png'),
  require('../public/image 3.png'),
  require('../public/image 4.png'),
  require('../public/image 5.png'),
  require('../public/image 6.png'),
];

const CAROUSEL_HEIGHT = 480;

const ImageCarousel = () => {
  const flatListRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(Dimensions.get('window').width);
  const timerRef = useRef(null);

  const startAutoScroll = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % carouselImages.length;
        flatListRef.current?.scrollToOffset({
          offset: next * containerWidth,
          animated: true,
        });
        return next;
      });
    }, 3500);
  };

  useEffect(() => {
    startAutoScroll();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [containerWidth]);

  const onScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / containerWidth);
    if (index !== activeIndex && index >= 0 && index < carouselImages.length) {
      setActiveIndex(index);
    }
  };

  const onScrollBeginDrag = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const onScrollEndDrag = () => {
    startAutoScroll();
  };

  const onLayout = (e) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setContainerWidth(w);
  };

  const goTo = (index) => {
    const next = ((index % carouselImages.length) + carouselImages.length) % carouselImages.length;
    flatListRef.current?.scrollToOffset({ offset: next * containerWidth, animated: true });
    setActiveIndex(next);
    startAutoScroll();
  };

  return (
    <View className="w-full" onLayout={onLayout}>
      <View className="rounded-3xl overflow-hidden" style={{ height: CAROUSEL_HEIGHT }}>
        <FlatList
          ref={flatListRef}
          data={carouselImages}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          onScrollBeginDrag={onScrollBeginDrag}
          onScrollEndDrag={onScrollEndDrag}
          scrollEventThrottle={16}
          keyExtractor={(_, i) => `carousel-${i}`}
          getItemLayout={(_, index) => ({
            length: containerWidth,
            offset: containerWidth * index,
            index,
          })}
          renderItem={({ item }) => (
            <View style={{ width: containerWidth, height: CAROUSEL_HEIGHT }}>
              <Image
                source={item}
                style={{ width: '100%', height: '100%', borderRadius: 24 }}
                resizeMode="cover"
              />
            </View>
          )}
        />

        {/* Left Arrow */}
        <TouchableOpacity
          onPress={() => goTo(activeIndex - 1)}
          style={{ position: 'absolute', left: 16, top: '50%', marginTop: -24 }}
          className="w-12 h-12 bg-white/80 rounded-full items-center justify-center shadow-lg border border-white"
        >
          <MaterialIcons name="chevron-left" size={28} color="#6366F1" />
        </TouchableOpacity>

        {/* Right Arrow */}
        <TouchableOpacity
          onPress={() => goTo(activeIndex + 1)}
          style={{ position: 'absolute', right: 16, top: '50%', marginTop: -24 }}
          className="w-12 h-12 bg-white/80 rounded-full items-center justify-center shadow-lg border border-white"
        >
          <MaterialIcons name="chevron-right" size={28} color="#6366F1" />
        </TouchableOpacity>
      </View>

      {/* Dot Indicators */}
      <View className="flex-row justify-center items-center mt-4 gap-2">
        {carouselImages.map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => goTo(i)}
          >
            <View
              className={`rounded-full ${i === activeIndex ? 'bg-[#6366F1]' : 'bg-[#CBD5E1]'}`}
              style={{
                width: i === activeIndex ? 24 : 8,
                height: 8,
              }}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const LandingPage = ({ navigation }) => {
  const { isAuthenticated, user } = useAuthStore();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetchJobs(controller.signal);
    return () => controller.abort();
  }, []);

  const fetchJobs = async (signal) => {
    try {
      setLoading(true);
      const data = await JobsService.getJobs({ limit: 3 }, { signal });
      setJobs(Array.isArray(data) ? data.slice(0, 3) : []);
    } catch (error) {
      if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
        console.error('[LandingPage] Failed to fetch jobs:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDashboard = () => {
    const role = user?.role;
    if (role === 'admin') navigation.navigate('AdminMain');
    else if (role === 'ngo') navigation.navigate('NgoMain');
    else navigation.navigate('ProfessionalMain');
  };

  return (
    <Screen className="bg-[#F8FAFC] flex-1" safeArea={true} fullWidth={true} noPadding={true} scrollable={true}>
      {/* Navigation Bar */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-[#E2E8F0] sticky top-0 z-50">
        <View className="flex-row items-center">
          {navigation.canGoBack() && (
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="#485f84" />
            </TouchableOpacity>
          )}
          <View className="w-8 h-8 rounded-full bg-[#E0E7FF] items-center justify-center overflow-hidden">
            <View style={styles.mountainShapeSmall} />
          </View>
          <Text className="ml-2 text-base font-bold text-[#485f84]" style={{ fontFamily: 'Poppins_700Bold' }}>
            Care Connect Nepal
          </Text>
        </View>
        <View className="flex-row items-center gap-4">
          {!isAuthenticated ? (
            <>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text className="text-[#6366F1] font-semibold" style={{ fontFamily: 'Poppins_600SemiBold' }}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="bg-[#6366F1] px-4 py-2 rounded-lg"
                onPress={() => navigation.navigate('Register')}
              >
                <Text className="text-white font-semibold" style={{ fontFamily: 'Poppins_600SemiBold' }}>Get Started</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={handleDashboard}>
              <Text className="text-[#6366F1] font-semibold" style={{ fontFamily: 'Poppins_600SemiBold' }}>Dashboard</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Hero Section */}
      <View className="px-6 py-20 bg-white items-center overflow-hidden relative">
        <View style={styles.heroMountainBg} />
        <View className="w-full max-w-4xl z-10">
          <Text className="text-center text-[#6366F1] text-4xl md:text-6xl font-bold mb-6" style={{ fontFamily: 'Poppins_700Bold', letterSpacing: -1 }}>
            Bridging Talent and Impact
          </Text>
          <Text className="text-center text-[#475569] text-lg md:text-xl mb-10 opacity-90 leading-relaxed" style={{ fontFamily: 'Inter_400Regular' }}>
            Bridging the gap between dedicated professionals and NGOs to drive sustainable development across the Himalayas. Empowering your career while building a stronger nation.
          </Text>
          <View className="flex-col md:flex-row gap-4 justify-center w-full">
            <TouchableOpacity 
              className="bg-[#6366F1] py-4 px-10 rounded-xl items-center justify-center flex-row shadow-lg"
              onPress={() => navigation.navigate('Register')}
            >
              <Text className="text-white font-bold text-lg mr-2" style={{ fontFamily: 'Poppins_600SemiBold' }}>Hire Talent</Text>
              <MaterialIcons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              className="bg-[#485f84] py-4 px-10 rounded-xl items-center justify-center flex-row shadow-lg"
              onPress={() => navigation.navigate('Jobs')}
            >
              <Text className="text-white font-bold text-lg mr-2" style={{ fontFamily: 'Poppins_600SemiBold' }}>Find Jobs</Text>
              <MaterialIcons name="work" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Image Carousel Section */}
      <View className="py-16 bg-[#F8FAFC]">
        <View className="px-6 mb-8">
          <Text className="text-[#6366F1] text-xs font-bold uppercase tracking-widest mb-2" style={{ fontFamily: 'Inter_600SemiBold' }}>Gallery</Text>
          <Text className="text-[#485f84] text-3xl font-bold" style={{ fontFamily: 'Poppins_700Bold' }}>Making a Difference</Text>
        </View>
        <View className="w-full overflow-hidden px-6" style={{ height: CAROUSEL_HEIGHT }}>
          <ImageCarousel />
        </View>
      </View>

      {/* Featured Jobs Section */}
      <View className="px-6 py-20 bg-white">
        <View className="flex-row items-center justify-between mb-10 max-w-5xl mx-auto w-full">
          <View>
            <Text className="text-[#6366F1] text-xs font-bold uppercase tracking-widest mb-2" style={{ fontFamily: 'Inter_600SemiBold' }}>Opportunity</Text>
            <Text className="text-[#485f84] text-3xl font-bold" style={{ fontFamily: 'Poppins_700Bold' }}>High-Impact Roles</Text>
          </View>
          <TouchableOpacity 
            className="flex-row items-center"
            onPress={() => navigation.navigate('Jobs')}
          >
            <Text className="text-[#6366F1] font-semibold mr-1" style={{ fontFamily: 'Poppins_600SemiBold' }}>Explore All</Text>
            <MaterialIcons name="arrow-outward" size={18} color="#6366F1" />
          </TouchableOpacity>
        </View>

        <View className="max-w-5xl mx-auto w-full">
          {loading ? (
            <ActivityIndicator size="large" color="#6366F1" className="py-10" />
          ) : jobs.length > 0 ? (
            <View className="flex-col gap-6">
              {jobs.map((job) => (
                <TouchableOpacity 
                  key={job.id} 
                  className="bg-[#F8FAFC] p-6 rounded-2xl border border-[#E2E8F0] shadow-sm flex-row items-center justify-between"
                  onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}
                >
                  <View className="flex-1 pr-4">
                    <Text className="text-[#485f84] text-xl font-bold mb-1" style={{ fontFamily: 'Poppins_600SemiBold' }}>{job.title}</Text>
                    <View className="flex-row items-center">
                      <Text className="text-[#6366F1] font-medium" style={{ fontFamily: 'Inter_600SemiBold' }}>{job.posted_by_name || 'Verified NGO'}</Text>
                      <Text className="text-[#475569] mx-2">•</Text>
                      <Text className="text-[#475569]" style={{ fontFamily: 'Inter_400Regular' }}>{job.location}</Text>
                    </View>
                  </View>
                  <View 
                    className="bg-[#EEF2FF] px-6 py-3 rounded-xl border border-[#6366F1]/20"
                  >
                    <Text className="text-[#6366F1] font-bold" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                      {isAuthenticated ? 'View' : 'Login to Apply'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="bg-[#F8FAFC] p-12 rounded-2xl border border-dashed border-[#E2E8F0] items-center">
              <Ionicons name="briefcase-outline" size={48} color="#E2E8F0" />
              <Text className="text-[#475569] mt-4 text-center" style={{ fontFamily: 'Inter_400Regular' }}>
                No active job listings found. Check back soon!
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Ecosystem Section */}
      <View className="px-6 py-24 bg-[#F8FAFC]">
        <View className="max-w-5xl mx-auto w-full">
          <Text className="text-center text-[#485f84] text-3xl font-bold mb-4" style={{ fontFamily: 'Poppins_700Bold' }}>A Structured Ecosystem</Text>
          <Text className="text-center text-[#475569] mb-16 opacity-80" style={{ fontFamily: 'Inter_400Regular' }}>Designed for institutional trust and professional excellence.</Text>
          
          <View className="flex-col md:flex-row gap-12">
            {/* Professionals */}
            <View className="flex-1">
              <Text className="text-[#6366F1] text-xl font-bold mb-8 flex-row items-center" style={{ fontFamily: 'Poppins_700Bold' }}>
                <MaterialIcons name="person" size={24} color="#6366F1" className="mr-2" /> For Professionals
              </Text>
              <View className="gap-8">
                <View className="flex-row">
                  <View className="w-10 h-10 rounded-full bg-[#E0E7FF] items-center justify-center mr-4 shrink-0">
                    <Text className="text-[#6366F1] font-bold">1</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-[#485f84] font-bold mb-1" style={{ fontFamily: 'Poppins_600SemiBold' }}>Verify KYC</Text>
                    <Text className="text-[#475569] leading-relaxed" style={{ fontFamily: 'Inter_400Regular' }}>Complete our national standard verification process to earn your trust badge.</Text>
                  </View>
                </View>
                <View className="flex-row">
                  <View className="w-10 h-10 rounded-full bg-[#E0E7FF] items-center justify-center mr-4 shrink-0">
                    <Text className="text-[#6366F1] font-bold">2</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-[#485f84] font-bold mb-1" style={{ fontFamily: 'Poppins_600SemiBold' }}>Build Portfolio</Text>
                    <Text className="text-[#475569] leading-relaxed" style={{ fontFamily: 'Inter_400Regular' }}>Showcase your NGO-specific skill set with our specialized digital resume builder.</Text>
                  </View>
                </View>
                <View className="flex-row">
                  <View className="w-10 h-10 rounded-full bg-[#E0E7FF] items-center justify-center mr-4 shrink-0">
                    <Text className="text-[#6366F1] font-bold">3</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-[#485f84] font-bold mb-1" style={{ fontFamily: 'Poppins_600SemiBold' }}>Get Hired</Text>
                    <Text className="text-[#475569] leading-relaxed" style={{ fontFamily: 'Inter_400Regular' }}>Apply to verified positions and start making a tangible impact on the ground.</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* NGOs */}
            <View className="flex-1">
              <Text className="text-[#14B8A6] text-xl font-bold mb-8 flex-row items-center" style={{ fontFamily: 'Poppins_700Bold' }}>
                <MaterialIcons name="business" size={24} color="#14B8A6" className="mr-2" /> For NGOs
              </Text>
              <View className="gap-8">
                <View className="flex-row">
                  <View className="w-10 h-10 rounded-full bg-[#CCFBF1] items-center justify-center mr-4 shrink-0">
                    <Text className="text-[#14B8A6] font-bold">1</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-[#485f84] font-bold mb-1" style={{ fontFamily: 'Poppins_600SemiBold' }}>Post Jobs</Text>
                    <Text className="text-[#475569] leading-relaxed" style={{ fontFamily: 'Inter_400Regular' }}>Reach Nepal's most qualified professional network with targeted listings.</Text>
                  </View>
                </View>
                <View className="flex-row">
                  <View className="w-10 h-10 rounded-full bg-[#CCFBF1] items-center justify-center mr-4 shrink-0">
                    <Text className="text-[#14B8A6] font-bold">2</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-[#485f84] font-bold mb-1" style={{ fontFamily: 'Poppins_600SemiBold' }}>Browse Verified Talent</Text>
                    <Text className="text-[#475569] leading-relaxed" style={{ fontFamily: 'Inter_400Regular' }}>Skip the noise. Access a pool of pre-vetted, KYC-verified experts.</Text>
                  </View>
                </View>
                <View className="flex-row">
                  <View className="w-10 h-10 rounded-full bg-[#CCFBF1] items-center justify-center mr-4 shrink-0">
                    <Text className="text-[#14B8A6] font-bold">3</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-[#485f84] font-bold mb-1" style={{ fontFamily: 'Poppins_600SemiBold' }}>Manage Impact</Text>
                    <Text className="text-[#475569] leading-relaxed" style={{ fontFamily: 'Inter_400Regular' }}>Use our dashboard to track recruitment metrics and project alignment.</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View className="px-6 py-20 bg-[#1E293B]">
        <View className="max-w-5xl mx-auto w-full">
          <View className="flex-col md:flex-row justify-between gap-12 mb-16">
            <View className="max-w-xs">
              <Text className="text-white text-2xl font-bold mb-6" style={{ fontFamily: 'Poppins_700Bold' }}>Care Connect Nepal</Text>
              <Text className="text-white/70 leading-relaxed mb-6" style={{ fontFamily: 'Inter_400Regular' }}>
                Empowering Nepal's professionals through secure, transparent, and high-impact career opportunities.
              </Text>
              <View className="flex-row gap-4">
                <TouchableOpacity className="w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/20">
                  <Ionicons name="logo-facebook" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity className="w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/20">
                  <Ionicons name="logo-linkedin" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity className="w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/20">
                  <Ionicons name="logo-twitter" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View className="flex-row gap-20">
              <View>
                <Text className="text-white font-bold mb-6" style={{ fontFamily: 'Poppins_600SemiBold' }}>Quick Links</Text>
                <View className="gap-4">
                  <Text className="text-white/60">NGO Partnership</Text>
                  <Text className="text-white/60">Support</Text>
                  <Text className="text-white/60">Contact Us</Text>
                </View>
              </View>
              <View>
                <Text className="text-white font-bold mb-6" style={{ fontFamily: 'Poppins_600SemiBold' }}>Legal</Text>
                <View className="gap-4">
                  <Text className="text-white/60">Privacy Policy</Text>
                  <Text className="text-white/60">Terms of Service</Text>
                </View>
              </View>
            </View>
          </View>
          
          <View className="pt-8 border-t border-white/10 flex-row justify-between items-center">
            <Text className="text-white/40 text-sm">© 2024 Care Connect Nepal. Empowering through professional growth and stability.</Text>
          </View>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  mountainShapeSmall: {
    borderBottomWidth: 10,
    borderBottomColor: '#6366F1',
    borderLeftWidth: 8,
    borderLeftColor: 'transparent',
    borderRightWidth: 8,
    borderRightColor: 'transparent',
    width: 0,
    height: 0,
  },
  heroMountainBg: {
    position: 'absolute',
    bottom: -50,
    right: -50,
    width: 400,
    height: 400,
    backgroundColor: '#F8FAFC',
    borderRadius: 200,
    opacity: 0.5,
    zIndex: 0,
  }
});

export default LandingPage;
