import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Eye, EyeOff, LogIn, Shield } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import useAuthStore from '../../stores/authStore';

export default function LoginScreen({ navigation }) {
  const login = useAuthStore((s) => s.login);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!identifier.trim()) e.identifier = 'Email or phone is required';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(identifier.trim(), password);
      Toast.show({ type: 'success', text1: 'Welcome back!', text2: 'Login successful' });
    } catch (error) {
      const data = error.response?.data;
      const msg = data?.non_field_errors?.[0]
        || data?.identifier?.[0]
        || data?.email?.[0]
        || data?.username?.[0]
        || data?.password?.[0]
        || data?.detail
        || 'Invalid credentials. Please try again.';
      Toast.show({ type: 'error', text1: 'Login Failed', text2: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          {/* Premium Header */}
          <View style={{ backgroundColor: '#6366F1', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 80, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}
            >
              <ArrowLeft size={22} color="#ffffff" />
            </TouchableOpacity>

            <View style={{ alignItems: 'center', marginTop: 24 }}>
              <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', marginBottom: 16 }}>
                <Shield size={32} color="#ffffff" />
              </View>
              <Text style={{ fontSize: 28, color: '#ffffff', fontFamily: 'Poppins_700Bold', textAlign: 'center' }}>
                Welcome Back
              </Text>
              <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter_400Regular', marginTop: 8, textAlign: 'center' }}>
                Sign in to continue your journey
              </Text>
            </View>
          </View>

          {/* Floating Form Card */}
          <View style={{ paddingHorizontal: 20, marginTop: -40 }}>
            <View style={{ backgroundColor: '#ffffff', borderRadius: 32, padding: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 8, borderWidth: 1, borderColor: '#f1f5f9' }}>
              {/* Email / Phone */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 11, color: '#64748B', fontFamily: 'Inter_600SemiBold', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Email or Phone</Text>
                <TextInput
                  value={identifier}
                  onChangeText={(t) => { setIdentifier(t); setErrors((e) => ({ ...e, identifier: '' })); }}
                  placeholder="admin@careconnect.np"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={{
                    backgroundColor: '#f8fafc', borderRadius: 16, height: 56, paddingHorizontal: 20,
                    fontSize: 15, fontFamily: 'Inter_400Regular', color: '#1E293B',
                    borderWidth: 1.5, borderColor: errors.identifier ? '#EF4444' : '#e2e8f0',
                    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
                  }}
                />
                {errors.identifier ? (
                  <Text style={{ color: '#EF4444', fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 6 }}>
                    {errors.identifier}
                  </Text>
                ) : null}
              </View>

              {/* Password */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 11, color: '#64748B', fontFamily: 'Inter_600SemiBold', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Password</Text>
                <View style={{ position: 'relative' }}>
                  <TextInput
                    value={password}
                    onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: '' })); }}
                    placeholder="Enter password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showPassword}
                    style={{
                      backgroundColor: '#f8fafc', borderRadius: 16, height: 56, paddingHorizontal: 20,
                      paddingRight: 56, fontSize: 15, fontFamily: 'Inter_400Regular', color: '#1E293B',
                      borderWidth: 1.5, borderColor: errors.password ? '#EF4444' : '#e2e8f0',
                      ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 16, top: 17 }}
                  >
                    {showPassword ? <EyeOff size={22} color="#94A3B8" /> : <Eye size={22} color="#94A3B8" />}
                  </TouchableOpacity>
                </View>
                {errors.password ? (
                  <Text style={{ color: '#EF4444', fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 6 }}>
                    {errors.password}
                  </Text>
                ) : null}
              </View>

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                style={{
                  backgroundColor: '#6366F1', borderRadius: 16, height: 56,
                  alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
                  opacity: loading ? 0.7 : 1,
                  shadowColor: '#6366F1', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 6,
                }}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'Poppins_600SemiBold', marginRight: 8 }}>Sign In</Text>
                    <LogIn size={20} color="#ffffff" />
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 28, marginBottom: 40 }}>
              <Text style={{ color: '#64748B', fontFamily: 'Inter_400Regular', fontSize: 14 }}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={{ color: '#6366F1', fontFamily: 'Inter_600SemiBold', fontSize: 14 }}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
