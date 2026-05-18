import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react-native';
import Screen from '../../components/common/Screen';

import useAuthStore from '../../stores/authStore';

const SuccessScreen = ({ navigation, route }) => {
  const user = useAuthStore((s) => s.user);
  const role = user?.role || 'professional';

  const { 
    title = 'Great Job!', 
    message = 'Your portfolio has been updated successfully. This will help you get better job matches.',
    buttonLabel = 'Back to Portfolio',
    nextScreen = 'Portfolio',
    params = {}
  } = route.params || {};

  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <Screen className="bg-white">
      {/* Back Button */}
      <View className="absolute top-4 left-4 z-10">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="p-2 bg-slate-50 rounded-full"
        >
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <View className="flex-1 items-center justify-center px-8">
        <Animated.View 
          style={{ 
            opacity: fadeAnim, 
            transform: [{ scale: scaleAnim }],
            alignItems: 'center' 
          }}
        >
          <View className="w-24 h-24 bg-success/10 rounded-full items-center justify-center mb-8">
            <CheckCircle2 size={48} color="#10B981" />
          </View>
          
          <Text 
            className="text-3xl text-text-primary text-center mb-4" 
            style={{ fontFamily: 'Montserrat_700Bold' }}
          >
            {title}
          </Text>
          
          <Text 
            className="text-base text-text-secondary text-center leading-6 mb-12"
            style={{ fontFamily: 'Poppins_400Regular' }}
          >
            {message}
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              const mainNavigator = role === 'ngo' ? 'NgoMain' : 'ProfessionalMain';
              navigation.reset({
                index: 0,
                routes: [{ 
                  name: mainNavigator,
                  params: { screen: nextScreen, params: params }
                }],
              });
            }}
            className="bg-primary w-full py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/30"
          >
            <Text className="text-white font-poppins-600 text-lg mr-2">{buttonLabel}</Text>
            <ArrowRight size={20} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Screen>
  );
};

export default SuccessScreen;
