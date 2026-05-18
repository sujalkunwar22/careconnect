import React, { useEffect } from 'react';
import { View, Animated, Platform } from 'react-native';
import { twMerge } from 'tailwind-merge';

const Skeleton = ({
    width,
    height,
    variant = 'rect', // 'rect' | 'circle'
    className = ''
}) => {
    const opacity = new Animated.Value(0.3);

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.7,
                    duration: 800,
                    useNativeDriver: Platform.OS !== 'web',
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: Platform.OS !== 'web',
                }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View
            style={{
                width,
                height,
                opacity,
            }}
            className={twMerge(
                'bg-border',
                variant === 'circle' ? 'rounded-full' : 'rounded-lg',
                className
            )}
        />
    );
};

export default Skeleton;
