import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { BookText, Gem, House, Image, Sparkle } from 'lucide-react-native';

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarBackground: TabBarBackground,
                tabBarStyle: Platform.select({
                    ios: {
                        // Use a transparent background on iOS to show the blur effect
                        position: 'absolute',
                    },
                    default: {},
                }),
                tabBarLabelPosition: 'below-icon', // <-- Add this line
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <House size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="explore"
                options={{
                    title: 'Explore',
                    tabBarIcon: ({ color }) => <Sparkle size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="minerals/index"
                options={{
                    title: 'Minerals',
                    tabBarIcon: ({ color }) => <Gem size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="minerals/[slug]"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="photos/index"
                options={{
                    title: 'Photos',
                    tabBarIcon: ({ color }) => <Image size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="photos/[id]"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="articles/index"
                options={{
                    title: 'Articles',
                    tabBarIcon: ({ color }) => <BookText size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="articles/[slug]"
                options={{
                    href: null,
                }}
            />
        </Tabs>
    );
}
