import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Check } from 'lucide-react-native';
import { twMerge } from 'tailwind-merge';

const Checkbox = ({
    label,
    checked,
    onPress,
    className = '',
    containerClassName = ''
}) => {
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            className={twMerge('flex-row items-center', containerClassName)}
        >
            <View
                className={twMerge(
                    'w-5 h-5 rounded border items-center justify-center mr-2',
                    checked ? 'bg-primary border-primary' : 'bg-white border-border',
                    className
                )}
            >
                {checked && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
            </View>
            {label && (
                <Text className="text-text-secondary font-poppins-400 text-sm">
                    {label}
                </Text>
            )}
        </TouchableOpacity>
    );
};

export default Checkbox;
