import { useColorScheme } from '@/hooks/useColorScheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';

type GlimmerProps = {
    style?: any;
};

export function Glimmer({ style }: GlimmerProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const baseColor = colorScheme === 'dark' ? '#222' : '#e0e0e0';
    const highlightColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.4)';
    const translateX = useState(new Animated.Value(-150))[0];

    useEffect(() => {
        Animated.loop(
            Animated.timing(translateX, {
                toValue: 150,
                duration: 1200,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    return (
        <Animated.View
            pointerEvents="none"
            style={[
                {
                    ...StyleSheet.absoluteFillObject,
                    transform: [{ translateX }],
                },
                style,
            ]}
        >
            <LinearGradient
                colors={[baseColor, highlightColor, baseColor]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={{ flex: 1 }}
            />
        </Animated.View>
    );
}
