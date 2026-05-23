import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Keyboard, Platform } from 'react-native';
import Screen from '../../components/common/Screen';
import Button from '../../components/common/Button';
import { ArrowLeft } from 'lucide-react-native';
import useAuthStore from '../../stores/authStore';
import { Alert } from 'react-native';


const OtpVerificationScreen = ({ route, navigation }) => {
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const register = useAuthStore((s) => s.register);
  const phone = route?.params?.phone || '+977 98XXXXXXX';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (value, index) => {
    // Only allow numbers
    const cleanValue = value.replace(/[^0-9]/g, '');
    if (cleanValue.length > 1) {
      // Handle paste - though complex in RN with separate inputs
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = cleanValue;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (cleanValue && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // Move to previous input on backspace if current is empty
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResend = () => {
    if (!canResend) return;
    setTimer(60);
    setCanResend(false);
    // Simulate API call
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length < 6) return;

    setIsLoading(true);
    Keyboard.dismiss();

    try {
      // 1. Verify OTP first
      await verifyOtp({
        phone_number: phone,
        code: otpValue
      });

      // 2. Complete registration if registrationData is provided
      const registrationData = route.params?.registrationData;
      if (registrationData) {
        await register(registrationData);
      }
      
      setIsLoading(false);
      
      // 3. For legacy flow without registrationData, manually go to KycSubmit.
      // For registration, register() sets user and logs in, prompting navigator redirection.
      if (!registrationData) {
        navigation.navigate('KycSubmit');
      }
    } catch (err) {
      setIsLoading(false);
      const msg = err.response?.data?.error || err.response?.data?.detail || err.message || 'Invalid OTP';
      Alert.alert('Verification Failed', msg);
    }
  };


  return (
    <Screen className="bg-surface">
      <View className="mt-6 mb-8">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mb-6 w-10 h-10 items-center justify-center bg-background rounded-full"
        >
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>

        <Text
          className="text-3xl text-text-primary mb-2"
          style={{ fontFamily: 'Montserrat_700Bold' }}
        >
          Verify Phone
        </Text>
        <Text
          className="text-base text-text-secondary mb-1"
          style={{ fontFamily: 'Poppins_400Regular' }}
        >
          We've sent a 6-digit verification code to
        </Text>
        <Text
          className="text-base text-text-primary mb-10"
          style={{ fontFamily: 'Poppins_600SemiBold' }}
        >
          {phone}
        </Text>

        <View className="flex-row justify-between mb-10">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              className={`w-12 h-16 border-2 rounded-xl text-center text-2xl
                ${digit ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-white text-text-primary'}
              `}
              style={[{ fontFamily: 'Poppins_600SemiBold' }, Platform.OS === 'web' && { outlineStyle: 'none', borderWidth: 0, backgroundColor: 'transparent' }]}
              maxLength={1}
              keyboardType="number-pad"
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => {
                // Select all on focus for easier editing
              }}
            />
          ))}
        </View>

        <Button
          title="Verify & Continue"
          onPress={handleVerify}
          isLoading={isLoading}
          disabled={otp.join('').length < 6}
          className="mb-8 shadow-md"
          size="lg"
        />

        <View className="items-center">
          <Text className="text-text-secondary font-poppins-400 mb-2">
            Didn't receive the code?
          </Text>
          {canResend ? (
            <TouchableOpacity onPress={handleResend}>
              <Text className="text-primary font-poppins-700 text-base">Resend Code</Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row items-center">
              <Text className="text-text-secondary font-poppins-400">Resend in </Text>
              <Text className="text-primary font-poppins-700">{timer}s</Text>
            </View>
          )}
        </View>
      </View>
    </Screen>
  );
};

export default OtpVerificationScreen;
