import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  textClassName = '',
  leftIcon,
  rightIcon,
  ...props
}) => {
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';
  const isSecondary = variant === 'secondary';
  
  // Base classes for the button container
  let containerClasses = 'flex-row items-center justify-center rounded-xl active:opacity-80 transition-opacity ';
  
  // Variant specific classes
  if (variant === 'primary') {
    containerClasses += 'bg-primary ';
  } else if (isSecondary) {
    containerClasses += 'bg-secondary ';
  } else if (isOutline) {
    containerClasses += 'bg-transparent border-2 border-primary ';
  } else if (isGhost) {
    containerClasses += 'bg-transparent ';
  }
  
  // Size specific classes
  if (size === 'sm') {
    containerClasses += 'px-3 py-2 ';
  } else if (size === 'md') {
    containerClasses += 'px-5 py-3.5 ';
  } else if (size === 'lg') {
    containerClasses += 'px-8 py-4 ';
  }
  
  // Disabled state
  if (disabled || isLoading) {
    containerClasses += 'opacity-50 ';
  }
  
  // Base classes for the text
  let baseTextClasses = 'font-semibold text-center ';
  
  // Size specific text classes
  if (size === 'sm') {
    baseTextClasses += 'text-sm ';
  } else if (size === 'md') {
    baseTextClasses += 'text-base ';
  } else if (size === 'lg') {
    baseTextClasses += 'text-lg ';
  }
  
  // Variant specific text classes
  if (variant === 'primary' || isSecondary) {
    baseTextClasses += 'text-white ';
  } else if (isOutline || isGhost) {
    baseTextClasses += 'text-primary ';
  }
  
  return (
    <TouchableOpacity
      className={`${containerClasses} ${className}`}
      onPress={onPress}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={isOutline || isGhost ? '#0ea5e9' : '#ffffff'}
          className="mr-2"
        />
      ) : (
        leftIcon && <React.Fragment>{leftIcon}</React.Fragment>
      )}
      
      {!isLoading && (
        <Text className={`${baseTextClasses} ${textClassName}`}>
          {title}
        </Text>
      )}
      
      {!isLoading && rightIcon && <React.Fragment>{rightIcon}</React.Fragment>}
    </TouchableOpacity>
  );
};

export default Button;
