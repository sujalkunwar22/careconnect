import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = ({
    onPress,
    title,
    variant = 'primary', // 'primary' | 'secondary' | 'text' | 'outline' | 'danger'
    size = 'md', // 'sm' | 'md' | 'lg'
    isLoading = false,
    disabled = false,
    icon: Icon,
    iconPosition = 'left',
    className = '',
    textClassName = '',
}) => {
    const baseStyles = 'flex-row items-center justify-center rounded-2xl';

    const variants = {
        primary: 'bg-primary border border-primary-dark/30',
        secondary: 'bg-secondary border border-secondary-dark/30',
        outline: 'border border-primary/40 bg-transparent',
        text: 'bg-transparent',
        danger: 'bg-error border border-error/30',
        success: 'bg-success border border-success/30',
        disabled: 'bg-disabled',
    };

    const textVariants = {
        primary: 'text-white font-poppins-600',
        secondary: 'text-white font-poppins-600',
        outline: 'text-primary font-poppins-600',
        text: 'text-primary font-poppins-600',
        danger: 'text-white font-poppins-600',
        success: 'text-white font-poppins-600',
        disabled: 'text-text-tertiary font-poppins-400',
    };

    const sizes = {
        sm: 'py-2.5 px-4',
        md: 'py-3.5 px-6',
        lg: 'py-4.5 px-8',
    };

    const textSizes = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
    };

    const resolvedVariant = disabled || isLoading ? 'disabled' : (variants[variant] ? variant : 'primary');

    const buttonStyles = twMerge(
        clsx(
            baseStyles,
            variants[resolvedVariant],
            sizes[size],
            className
        )
    );

    const titleStyles = twMerge(
        clsx(
            textVariants[resolvedVariant],
            textSizes[size],
            textClassName
        )
    );

    const getIconColor = () => {
        if (disabled || isLoading) return '#C7C7C1';
        if (variant === 'outline' || variant === 'text') return '#D85D2D';
        return '#FFFFFF';
    };

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            disabled={disabled || isLoading}
            className={buttonStyles}
            style={{
                shadowColor: variant === 'secondary' ? '#0F3D47' : '#B84A1A',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: variant === 'text' || variant === 'outline' ? 0 : 0.18,
                shadowRadius: 10,
                elevation: variant === 'text' || variant === 'outline' ? 0 : 5,
            }}
        >
            {isLoading ? (
                <ActivityIndicator color={getIconColor()} size={size === 'lg' ? 'large' : 'small'} />
            ) : (
                <View className="flex-row items-center">
                    {Icon && iconPosition === 'left' && (
                        <View className="mr-2">
                            {React.isValidElement(Icon) ? (
                                React.cloneElement(Icon, { 
                                    size: size === 'sm' ? 16 : 20, 
                                    color: getIconColor() 
                                })
                            ) : (
                                <Icon size={size === 'sm' ? 16 : 20} color={getIconColor()} strokeWidth={1.5} />
                            )}
                        </View>
                    )}
                    <Text 
                        className={titleStyles}
                        style={{ fontFamily: 'Poppins_600SemiBold', fontWeight: '600' }}
                    >
                        {title}
                    </Text>
                    {Icon && iconPosition === 'right' && (
                        <View className="ml-2">
                            {React.isValidElement(Icon) ? (
                                React.cloneElement(Icon, { 
                                    size: size === 'sm' ? 16 : 20, 
                                    color: getIconColor() 
                                })
                            ) : (
                                <Icon size={size === 'sm' ? 16 : 20} color={getIconColor()} strokeWidth={1.5} />
                            )}
                        </View>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
};

export default Button;
