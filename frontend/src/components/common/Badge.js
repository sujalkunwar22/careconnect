import React from 'react';
import { View, Text } from 'react-native';
import { twMerge } from 'tailwind-merge';

const Badge = ({
    label,
    variant = 'pending', // 'success' | 'warning' | 'error' | 'pending' | 'info'
    className = '',
    textClassName = ''
}) => {
    const variants = {
        success: 'bg-success/10 border-success/30',
        warning: 'bg-warning/10 border-warning/30',
        error: 'bg-error/10 border-error/30',
        pending: 'bg-accent/15 border-accent/30',
        info: 'bg-secondary/10 border-secondary/30',
        neutral: 'bg-surface-secondary border-border/60',
    };

    const textVariants = {
        success: 'text-success',
        warning: 'text-warning',
        error: 'text-error',
        pending: 'text-warning', // Sunshine Yellow but needs to be readable
        info: 'text-secondary',
        neutral: 'text-text-secondary',
    };

    return (
        <View
            className={twMerge(
                'px-2.5 py-1 rounded-full border',
                variants[variant],
                className
            )}
        >
            <Text
                className={twMerge(
                    'text-[10px] uppercase font-poppins-600',
                    textVariants[variant],
                    textClassName
                )}
            >
                {label}
            </Text>
        </View>
    );
};

export default Badge;
