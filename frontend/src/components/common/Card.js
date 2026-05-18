import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { twMerge } from 'tailwind-merge';

const Card = ({
    children,
    onPress,
    className = '',
    noPadding = false,
    variant = 'default', // 'default' | 'elevated' | 'outlined'
}) => {
    const Component = onPress ? TouchableOpacity : View;

    const baseStyles = 'rounded-3xl overflow-hidden';
    
    const variants = {
        default: 'bg-surface border border-border/50',
        elevated: 'bg-surface border border-border/40',
        outlined: 'bg-background border border-divider',
    };

    return (
        <Component
            activeOpacity={onPress ? 0.8 : 1}
            onPress={onPress}
            className={twMerge(
                baseStyles,
                variants[variant],
                !noPadding && 'p-5',
                className
            )}
            style={{
                elevation: variant === 'elevated' ? 7 : 3,
                shadowColor: '#0F3D47',
                shadowOffset: { width: 0, height: variant === 'elevated' ? 10 : 4 },
                shadowOpacity: variant === 'elevated' ? 0.13 : 0.08,
                shadowRadius: variant === 'elevated' ? 14 : 8,
            }}
        >
            {children}
        </Component>
    );
};

export default Card;
