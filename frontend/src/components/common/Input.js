import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Input = ({
    label,
    value,
    onChangeText,
    placeholder,
    error,
    secureTextEntry,
    icon: Icon,
    keyboardType = 'default',
    autoCapitalize = 'none',
    className = '',
    containerClassName = '',
    multiline = false,
    numberOfLines = 1,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = secureTextEntry;

    return (
        <View className={twMerge('mb-6', containerClassName)}>
            {label && (
                <Text 
                    className="text-text-primary font-poppins-600 text-sm mb-2"
                    style={{ fontFamily: 'Poppins_600SemiBold' }}
                >
                    {label}
                </Text>
            )}
            <View
                className={twMerge(
                    'flex-row items-center border rounded-2xl px-4 bg-white',
                    isFocused ? 'border-primary' : 'border-[#E2E8F0]',
                    error ? 'border-[#EF4444] bg-red-50' : '',
                    multiline ? 'items-start py-3' : 'h-14',
                    className
                )}
                style={{
                    shadowColor: isFocused ? '#6366F1' : '#94A3B8',
                    shadowOpacity: isFocused ? 0.15 : 0.05,
                    shadowOffset: { width: 0, height: 3 },
                    shadowRadius: 8,
                    elevation: isFocused ? 4 : 1,
                }}
            >
                {Icon && (
                    <View className="mr-3">
                        <Icon 
                            size={20} 
                            color={isFocused ? '#6366F1' : '#94A3B8'} 
                            strokeWidth={1.5}
                        />
                    </View>
                )}
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={isPassword && !showPassword}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="flex-1 text-sm"
                    style={[
                        { 
                            fontFamily: 'Poppins_400Regular',
                            color: '#0F172A',
                            borderWidth: 0,
                            borderColor: 'transparent',
                            backgroundColor: 'transparent',
                            paddingVertical: 0,
                            height: multiline ? undefined : '100%',
                        },
                        Platform.OS === 'web' && {
                            outlineStyle: 'none',
                            outlineWidth: 0,
                        }
                    ]}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    textAlignVertical={multiline ? 'top' : 'center'}
                />
                {isPassword && (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="ml-2" activeOpacity={0.7}>
                        {showPassword ? (
                            <EyeOff size={20} color="#94A3B8" strokeWidth={1.5} />
                        ) : (
                            <Eye size={20} color="#94A3B8" strokeWidth={1.5} />
                        )}
                    </TouchableOpacity>
                )}
            </View>
            {error && (
                <Text 
                    className="text-[#EF4444] text-xs mt-2"
                    style={{ fontFamily: 'Poppins_400Regular' }}
                >
                    {error}
                </Text>
            )}
        </View>
    );
};

export default Input;
