import React from 'react';
import { View, Image, Text } from 'react-native';
import { User } from 'lucide-react-native';
import { twMerge } from 'tailwind-merge';
import { getMediaUrl } from '../../lib/api';

const Avatar = ({
    source,
    size = 40,
    name,
    className = ''
}) => {
    const getInitials = (n) => {
        if (!n) return '';
        return n.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <View
            className={twMerge('bg-border rounded-full items-center justify-center overflow-hidden', className)}
            style={{ width: size, height: size }}
        >
            {source ? (
                <Image
                    source={typeof source === 'string' ? { uri: getMediaUrl(source) } : source}
                    style={{ width: '100%', height: '100%' }}
                />
            ) : name ? (
                <Text
                    className="text-text-primary font-poppins-600"
                    style={{ fontSize: size * 0.4 }}
                >
                    {getInitials(name)}
                </Text>
            ) : (
                <User size={size * 0.6} color="#94A3B8" />
            )}
        </View>
    );
};

export default Avatar;
