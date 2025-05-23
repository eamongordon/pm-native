import { Image as ExpoImage } from 'expo-image';
import type { PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';

import { ThemedView } from '@/components/ThemedView';
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';

type Props = PropsWithChildren<{
  headerBackgroundColor: { dark: string; light: string };
  headerBackgroundImage?: string;
  header?: React.ReactNode;
  headerHeight?: number; // Add this prop
}>;

export default function ParallaxScrollView({
  children,
  headerBackgroundColor,
  headerBackgroundImage,
  header,
  headerHeight = 250, // Default value
}: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const bottom = useBottomTabOverflow();
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollOffset.value,
          [-headerHeight, 0, headerHeight],
          [-headerHeight / 2, 0, headerHeight * 0.75]
        ),
      },
      {
        scale: interpolate(scrollOffset.value, [-headerHeight, 0, headerHeight], [2, 1, 1]),
      },
    ],
  }));

  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ bottom }}
        contentContainerStyle={{ paddingBottom: bottom }}>
        <Animated.View
          style={[
            styles.header,
            { backgroundColor: headerBackgroundColor[colorScheme], height: headerHeight },
            headerAnimatedStyle,
          ]}
        >
          {header
            ? header
            : headerBackgroundImage && (
                <ExpoImage
                  source={headerBackgroundImage}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                  transition={400}
                />
              )}
        </Animated.View>
        <ThemedView style={styles.content}>{children}</ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    // height is now set dynamically
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: 'hidden',
  },
});
