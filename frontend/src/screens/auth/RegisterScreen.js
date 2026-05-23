import React, { useState } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions, StyleSheet, ScrollView, Image } from 'react-native';
import Screen from '../../components/common/Screen';
import Input from '../../components/common/Input';
import { MaterialIcons } from '@expo/vector-icons';
import Checkbox from '../../components/common/Checkbox';
import useAuthStore from '../../stores/authStore';
import api from '../../lib/api';


const RegisterScreen = ({ navigation }) => {
  const registerUser = useAuthStore((s) => s.register);
  const { width } = useWindowDimensions();

  const isDesktop = width >= 1024;
  const isTablet = width >= 768;
  const formMaxWidth = isDesktop ? 600 : '100%';
  const [step, setStep] = useState(1);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formData, setFormData] = useState({
    role: 'caregiver', // caregiver, ngo
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Caregiver extra
    address: '',
    municipality: '',
    ward: '',
    // NGO extra
    orgName: '',
    regNumber: '',
    website: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    setError('');
    setStep(2);
  };

  const handleRegister = async () => {
    const { fullName, email, phone, password, confirmPassword, role } = formData;
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      setError('Please fill in all account details');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!acceptedTerms) {
      setError('You must accept the Terms & Conditions');
      return;
    }

    if (role === 'caregiver') {
      if (!formData.address || !formData.municipality || !formData.ward) {
        setError('Please fill in all location details');
        return;
      }
    } else {
      if (!formData.orgName || !formData.regNumber) {
        setError('Please fill in organization details');
        return;
      }
    }

    setError('');
    setIsLoading(true);

    try {
      const payload = {
        email: email || null,
        phone_number: phone || null,
        password,
        role: role === 'caregiver' ? 'user' : 'ngo',
        full_name: fullName,
        address: formData.address,
        municipality: formData.municipality,
        ward: formData.ward,
        organization_name: formData.orgName,
        registration_number: formData.regNumber,
        website: formData.website,
      };

      // Request OTP code to user's phone number first (also pass email for SMTP verification)
      await api.post('/auth/otp/request/', { 
        phone_number: payload.phone_number,
        email: payload.email
      });
      
      setIsLoading(false);
      // Navigate to OTP verification screen passing the registration data
      navigation.navigate('OtpVerification', {
        phone: payload.phone_number,
        registrationData: payload,
      });
    } catch (err) {
      setIsLoading(false);
      const data = err.response?.data;
      let msg = 'Registration failed. Please try again.';
      
      if (data) {
        if (typeof data === 'string') {
          msg = data;
        } else if (data.email) {
          msg = Array.isArray(data.email) ? data.email[0] : data.email;
        } else if (data.phone_number) {
          msg = Array.isArray(data.phone_number) ? data.phone_number[0] : data.phone_number;
        } else if (data.password) {
          msg = `Password error: ${Array.isArray(data.password) ? data.password[0] : data.password}`;
        } else if (data.non_field_errors) {
          msg = data.non_field_errors[0];
        } else if (data.detail) {
          msg = data.detail;
        } else {
          // Fallback to the first available error message
          const firstKey = Object.keys(data)[0];
          if (firstKey) {
            msg = `${firstKey}: ${Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey]}`;
          }
        }
      }
      setError(msg);
    }
  };


  return (
    <Screen className="flex-1 bg-background" safeArea={true} fullWidth={true} noPadding={true}>
      {/* TopAppBar */}
      <View className="flex-row items-center px-4 py-4 bg-white/90 border-b border-outline-variant z-50">
        <TouchableOpacity onPress={() => step === 2 ? setStep(1) : navigation.goBack()} className="mr-3 p-2 rounded-full hover:bg-slate-100">
          <MaterialIcons name="arrow-back" size={24} color="#6366F1" />
        </TouchableOpacity>
        <Text className="text-primary text-lg font-black tracking-tighter uppercase" style={{ fontFamily: 'Poppins_900Black' }}>
          Care Connect Nepal
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
        {step === 1 ? (
          /* ---------------- ROLE SELECTION ---------------- */
          <View className="flex-1 items-center justify-center py-12 px-6">
            <View className="max-w-4xl w-full flex-col items-center">
              <View className="text-center mb-10 items-center">
                <Text className="text-4xl text-on-surface mb-3 text-center" style={{ fontFamily: 'Poppins_700Bold' }}>
                  Join the Community
                </Text>
                <Text className="text-lg text-on-surface-variant max-w-2xl text-center" style={{ fontFamily: 'Inter_400Regular' }}>
                  Select your path to start making a difference or finding professional growth in Nepal's healthcare and social sectors.
                </Text>
              </View>

              {/* Role Selection Grid */}
              <View className={`w-full max-w-4xl mb-12 gap-6 ${isTablet ? 'flex-row' : 'flex-col'}`}>
                {/* Professional */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => handleChange('role', 'caregiver')}
                  className={`flex-1 bg-white border ${formData.role === 'caregiver' ? 'border-primary ring-2 ring-primary/20' : 'border-outline-variant'} p-8 rounded-xl shadow-sm relative overflow-hidden`}
                >
                  <View className="absolute top-0 right-0 p-4 opacity-[0.03]">
                    <MaterialIcons name="work" size={120} color={formData.role === 'caregiver' ? '#6366F1' : '#0F172A'} />
                  </View>
                  <View className="flex-col items-start gap-4 relative z-10">
                    <View className={`w-16 h-16 rounded-full flex items-center justify-center ${formData.role === 'caregiver' ? 'bg-primary text-white' : 'bg-primary-fixed text-primary'}`}>
                      <MaterialIcons name="work" size={32} color={formData.role === 'caregiver' ? '#ffffff' : '#6366F1'} />
                    </View>
                    <View>
                      <Text className="text-2xl text-on-surface mb-1" style={{ fontFamily: 'Poppins_600SemiBold' }}>I am a Professional</Text>
                      <Text className="text-base text-on-surface-variant" style={{ fontFamily: 'Inter_400Regular' }}>
                        Looking for meaningful career opportunities in hospitals, clinics, or social welfare organizations across the country.
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* NGO */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => handleChange('role', 'ngo')}
                  className={`flex-1 bg-white border ${formData.role === 'ngo' ? 'border-secondary ring-2 ring-secondary/20' : 'border-outline-variant'} p-8 rounded-xl shadow-sm relative overflow-hidden`}
                >
                  <View className="absolute top-0 right-0 p-4 opacity-[0.03]">
                    <MaterialIcons name="apartment" size={120} color={formData.role === 'ngo' ? '#485f84' : '#0F172A'} />
                  </View>
                  <View className="flex-col items-start gap-4 relative z-10">
                    <View className={`w-16 h-16 rounded-full flex items-center justify-center ${formData.role === 'ngo' ? 'bg-secondary text-white' : 'bg-secondary-container text-secondary'}`}>
                      <MaterialIcons name="apartment" size={32} color={formData.role === 'ngo' ? '#ffffff' : '#485f84'} />
                    </View>
                    <View>
                      <Text className="text-2xl text-on-surface mb-1" style={{ fontFamily: 'Poppins_600SemiBold' }}>I am an NGO</Text>
                      <Text className="text-base text-on-surface-variant" style={{ fontFamily: 'Inter_400Regular' }}>
                        Hiring skilled talent to support our humanitarian missions and social development projects in Nepal.
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Action Section */}
              <View className="flex-col items-center gap-6">
                <TouchableOpacity 
                  className="bg-primary px-16 py-4 rounded-lg shadow-md flex-row items-center justify-center"
                  onPress={handleNextStep}
                >
                  <Text className="text-white text-sm uppercase tracking-widest font-semibold" style={{ fontFamily: 'Inter_600SemiBold' }}>
                    Continue
                  </Text>
                </TouchableOpacity>
                <View className="flex-row items-center gap-2 mt-2">
                  <Text className="text-on-surface-variant text-base" style={{ fontFamily: 'Inter_400Regular' }}>Already have an account?</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text className="text-primary font-semibold text-base hover:underline" style={{ fontFamily: 'Inter_600SemiBold' }}>Log in</Text>
                  </TouchableOpacity>
                </View>
              </View>

            </View>

            {/* Support Imagery / Visual Motif */}
            <View className="w-full max-w-4xl mt-16 opacity-70">
              <View className={`gap-6 ${isTablet ? 'flex-row' : 'flex-col'}`}>
                <View className="flex-1 bg-surface-container-low p-4 rounded-lg border border-outline-variant flex-row items-center gap-3">
                  <MaterialIcons name="verified" size={24} color="#14B8A6" />
                  <Text className="text-sm font-semibold text-on-surface" style={{ fontFamily: 'Inter_600SemiBold' }}>KYC Verified Network</Text>
                </View>
                <View className="flex-1 bg-surface-container-low p-4 rounded-lg border border-outline-variant flex-row items-center gap-3">
                  <MaterialIcons name="security" size={24} color="#14B8A6" />
                  <Text className="text-sm font-semibold text-on-surface" style={{ fontFamily: 'Inter_600SemiBold' }}>Data Secure Platform</Text>
                </View>
                <View className="flex-1 bg-surface-container-low p-4 rounded-lg border border-outline-variant flex-row items-center gap-3">
                  <MaterialIcons name="location-on" size={24} color="#14B8A6" />
                  <Text className="text-sm font-semibold text-on-surface" style={{ fontFamily: 'Inter_600SemiBold' }}>Nationwide Opportunities</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          /* ---------------- REGISTRATION FORM ---------------- */
          <View className="flex-1 items-center justify-center py-8 px-4">
            <View style={{ width: '100%', maxWidth: formMaxWidth }}>
              
              <View className="text-center mb-8 items-center">
                <View className="p-4 bg-primary-fixed rounded-full mb-4">
                  <MaterialIcons name="badge" size={36} color="#6366F1" />
                </View>
                <Text className="text-3xl text-on-surface mb-2" style={{ fontFamily: 'Poppins_600SemiBold' }}>Join the Network</Text>
                <Text className="text-base text-on-surface-variant text-center" style={{ fontFamily: 'Inter_400Regular' }}>
                  {formData.role === 'caregiver' ? "Step into Nepal's professional network and connect with elite opportunities." : "Register your organization to hire verified professionals across Nepal."}
                </Text>
              </View>

              <View className="bg-white rounded-xl border border-outline-variant p-6 shadow-sm relative overflow-hidden">
                <View className="absolute top-0 right-0 opacity-[0.03]">
                  <MaterialIcons name="filter-hdr" size={150} color="#6366F1" />
                </View>

                <View className="space-y-4 relative z-10 flex-col gap-4">
                  {/* Full Name */}
                  <View className="space-y-2">
                    <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-1" style={{ fontFamily: 'Inter_600SemiBold' }}>Full Name</Text>
                    <Input
                      placeholder="Aayush Shrestha"
                      value={formData.fullName}
                      onChangeText={(val) => handleChange('fullName', val)}
                      autoCapitalize="words"
                      icon={({ size, color }) => <MaterialIcons name="person" size={20} color="#94A3B8" />}
                    />
                  </View>

                  {/* Email & Phone */}
                  <View className={`gap-4 ${isTablet ? 'flex-row' : 'flex-col'}`}>
                    <View className="space-y-2 flex-1">
                      <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-1" style={{ fontFamily: 'Inter_600SemiBold' }}>Email Address</Text>
                      <Input
                        placeholder="aayush@example.com"
                        value={formData.email}
                        onChangeText={(val) => handleChange('email', val)}
                        keyboardType="email-address"
                        icon={({ size, color }) => <MaterialIcons name="mail" size={20} color="#94A3B8" />}
                      />
                    </View>
                    <View className="space-y-2 flex-1">
                      <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-1" style={{ fontFamily: 'Inter_600SemiBold' }}>Phone Number</Text>
                      <Input
                        placeholder="+977-XXXXXXXXXX"
                        value={formData.phone}
                        onChangeText={(val) => handleChange('phone', val)}
                        keyboardType="phone-pad"
                        icon={({ size, color }) => <MaterialIcons name="phone" size={20} color="#94A3B8" />}
                      />
                    </View>
                  </View>

                  {/* Role Specific Fields */}
                  {formData.role === 'caregiver' ? (
                    <>
                      <View className="space-y-2">
                        <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-1" style={{ fontFamily: 'Inter_600SemiBold' }}>Address</Text>
                        <Input
                          placeholder="Street address, locality"
                          value={formData.address}
                          onChangeText={(val) => handleChange('address', val)}
                          icon={({ size, color }) => <MaterialIcons name="place" size={20} color="#94A3B8" />}
                        />
                      </View>
                      <View className={`gap-4 ${isTablet ? 'flex-row' : 'flex-col'}`}>
                        <View className="space-y-2 flex-1">
                          <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-1" style={{ fontFamily: 'Inter_600SemiBold' }}>Municipality</Text>
                          <Input
                            placeholder="e.g. Kathmandu"
                            value={formData.municipality}
                            onChangeText={(val) => handleChange('municipality', val)}
                          />
                        </View>
                        <View className="space-y-2 flex-[0.5]">
                          <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-1" style={{ fontFamily: 'Inter_600SemiBold' }}>Ward</Text>
                          <Input
                            placeholder="e.g. 3"
                            value={formData.ward}
                            onChangeText={(val) => handleChange('ward', val)}
                            keyboardType="numeric"
                          />
                        </View>
                      </View>
                    </>
                  ) : (
                    <>
                      <View className="space-y-2">
                        <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-1" style={{ fontFamily: 'Inter_600SemiBold' }}>Organization Name</Text>
                        <Input
                          placeholder="Enter formal name"
                          value={formData.orgName}
                          onChangeText={(val) => handleChange('orgName', val)}
                          icon={({ size, color }) => <MaterialIcons name="business" size={20} color="#94A3B8" />}
                        />
                      </View>
                      <View className={`gap-4 ${isTablet ? 'flex-row' : 'flex-col'}`}>
                        <View className="space-y-2 flex-1">
                          <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-1" style={{ fontFamily: 'Inter_600SemiBold' }}>Registration Number</Text>
                          <Input
                            placeholder="NGO Reg No."
                            value={formData.regNumber}
                            onChangeText={(val) => handleChange('regNumber', val)}
                            icon={({ size, color }) => <MaterialIcons name="description" size={20} color="#94A3B8" />}
                          />
                        </View>
                        <View className="space-y-2 flex-1">
                          <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-1" style={{ fontFamily: 'Inter_600SemiBold' }}>Website</Text>
                          <Input
                            placeholder="https://..."
                            value={formData.website}
                            onChangeText={(val) => handleChange('website', val)}
                            icon={({ size, color }) => <MaterialIcons name="language" size={20} color="#94A3B8" />}
                          />
                        </View>
                      </View>
                    </>
                  )}

                  {/* Passwords */}
                  <View className={`gap-4 ${isTablet ? 'flex-row' : 'flex-col'}`}>
                    <View className="space-y-2 flex-1">
                      <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-1" style={{ fontFamily: 'Inter_600SemiBold' }}>Password</Text>
                      <Input
                        placeholder="••••••••"
                        value={formData.password}
                        onChangeText={(val) => handleChange('password', val)}
                        secureTextEntry
                        icon={({ size, color }) => <MaterialIcons name="lock" size={20} color="#94A3B8" />}
                      />
                    </View>
                    <View className="space-y-2 flex-1">
                      <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-1" style={{ fontFamily: 'Inter_600SemiBold' }}>Confirm Password</Text>
                      <Input
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChangeText={(val) => handleChange('confirmPassword', val)}
                        secureTextEntry
                        icon={({ size, color }) => <MaterialIcons name="lock-reset" size={20} color="#94A3B8" />}
                      />
                    </View>
                  </View>

                  {/* Terms */}
                  <View className="flex-row items-center mt-2 mb-2">
                    <Checkbox
                      checked={acceptedTerms}
                      onPress={() => setAcceptedTerms(!acceptedTerms)}
                    />
                    <Text className="text-on-surface-variant text-sm ml-3 flex-1" style={{ fontFamily: 'Inter_400Regular' }}>
                      I agree to the <Text className="text-primary font-bold">Terms & Conditions</Text> and <Text className="text-primary font-bold">Privacy Policy</Text> of Care Connect Nepal.
                    </Text>
                  </View>

                  {/* Error display */}
                  {error ? (
                    <View className="bg-error-container p-3 rounded-lg border border-error/20 flex-row items-center mb-2">
                      <MaterialIcons name="error-outline" size={18} color="#EF4444" />
                      <Text className="text-on-error-container text-sm ml-2 flex-1" style={{ fontFamily: 'Inter_400Regular' }}>{error}</Text>
                    </View>
                  ) : null}

                  {/* KYC Notice */}
                  {formData.role === 'caregiver' && (
                    <View className="flex-row gap-3 p-3 rounded-lg bg-surface-container-high border border-outline-variant items-start mb-2 mt-2">
                      <MaterialIcons name="verified-user" size={20} color="#485f84" />
                      <Text className="text-xs text-on-secondary-container leading-tight flex-1" style={{ fontFamily: 'Inter_400Regular' }}>
                        Identity verification will be required after registration to receive the <Text className="text-tertiary font-bold">Verified Professional</Text> badge.
                      </Text>
                    </View>
                  )}

                  {/* CTA */}
                  <TouchableOpacity 
                    className="w-full bg-[#6366F1] py-4 rounded-lg shadow-md flex-row items-center justify-center mt-2"
                    onPress={handleRegister}
                    disabled={isLoading}
                  >
                    <Text className="text-white font-semibold text-lg mr-2" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                      {isLoading ? 'Processing...' : 'Create Account'}
                    </Text>
                    {!isLoading && <MaterialIcons name="arrow-forward" size={20} color="white" />}
                  </TouchableOpacity>
                  
                </View>
              </View>

              {/* Trust Badges */}
              <View className="mt-12 flex-row justify-center gap-12 opacity-50 grayscale">
                <View className="flex-col items-center">
                  <MaterialIcons name="security" size={28} color="#0F172A" />
                  <Text className="text-[10px] uppercase tracking-widest font-bold mt-2" style={{ fontFamily: 'Inter_600SemiBold' }}>Secure Data</Text>
                </View>
                <View className="flex-col items-center">
                  <MaterialIcons name="handshake" size={28} color="#0F172A" />
                  <Text className="text-[10px] uppercase tracking-widest font-bold mt-2" style={{ fontFamily: 'Inter_600SemiBold' }}>Trusted Partners</Text>
                </View>
                <View className="flex-col items-center">
                  <MaterialIcons name="verified" size={28} color="#0F172A" />
                  <Text className="text-[10px] uppercase tracking-widest font-bold mt-2" style={{ fontFamily: 'Inter_600SemiBold' }}>KYC Compliant</Text>
                </View>
              </View>

            </View>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
};

export default RegisterScreen;
