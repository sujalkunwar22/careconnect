import React from 'react';
import { View, Text } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import Button from './Button';
import { twMerge } from 'tailwind-merge';

const EmptyState = ({
    icon: Icon,
    title,
    message,
    actionLabel,
    onAction,
    className = ''
}) => {
    return (
        <View className={twMerge('items-center justify-center p-8', className)}>
            <View className="bg-background w-20 h-20 rounded-full items-center justify-center mb-4">
                {Icon && <Icon size={40} color="#94A3B8" />}
            </View>
            <Text className="text-text-primary font-poppins-600 text-lg text-center mb-2">
                {title}
            </Text>
            <Text className="text-text-secondary font-poppins-400 text-sm text-center mb-6">
                {message}
            </Text>
            {actionLabel && onAction && (
                <Button
                    title={actionLabel}
                    onPress={onAction}
                    variant="outline"
                    size="md"
                />
            )}
        </View>
    );
};

export default EmptyState;
