import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

const Input = ({
  label,
  error,
  leftIcon,
  rightIcon,
  secureTextEntry,
  containerClassName = '',
  labelClassName = '',
  inputClassName = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Focus styles
  const borderColor = error ? 'border-red-500' : isFocused ? 'border-primary' : 'border-border';
  const bgColor = isFocused ? 'bg-surface' : 'bg-background';

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && (
        <Text className={`text-sm font-medium text-text mb-1.5 ${labelClassName}`}>
          {label}
        </Text>
      )}
      
      <View
        className={`flex-row items-center border-[1.5px] rounded-xl px-4 h-12 transition-colors ${borderColor} ${bgColor}`}
      >
        {leftIcon && <View className="mr-3">{leftIcon}</View>}
        
        <TextInput
          className={`flex-1 text-base text-text h-full ${inputClassName}`}
          placeholderTextColor="#9ca3af" // tailwind gray-400
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...props}
        />
        
        {rightIcon && !secureTextEntry && <View className="ml-3">{rightIcon}</View>}
        
        {secureTextEntry && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            className="ml-3 p-1"
          >
            <Text className="text-primary text-xs font-medium">
              {isPasswordVisible ? 'HIDE' : 'SHOW'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text className="text-xs text-red-500 mt-1.5 ml-1">
          {error}
        </Text>
      )}
    </View>
  );
};

export default Input;
