import { ThemedIcon } from '@/components/ThemedIcon';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Image } from 'expo-image';
import { Link, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = 300;

export default function ArticleDetailsScreen() {
    const { slug } = useLocalSearchParams();
    const [article, setArticle] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const colorScheme = useColorScheme() ?? 'light';
    const insets = useSafeAreaInsets();

    // Header background on scroll
    const [headerSolid, setHeaderSolid] = useState(false);
    const scrollY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!slug) return;
        setLoading(true);

        let url = `https://www.prospectorminerals.com/api/articles?filter=${encodeURIComponent(
            JSON.stringify({ slug })
        )}&fieldset=full&limit=1`;

        if (Platform.OS === 'web') {
            url = `https://corsproxy.io/?url=${encodeURIComponent(url)}`;
        }

        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (data && data.results && data.results.length > 0) {
                    setArticle(data.results[0]);
                } else {
                    setArticle(null);
                }
            })
            .catch(() => setArticle(null))
            .finally(() => setLoading(false));
    }, [slug]);

    useEffect(() => {
        const listener = scrollY.addListener(({ value }) => {
            setHeaderSolid(value > IMAGE_HEIGHT - (insets.top + 48));
        });
        return () => scrollY.removeListener(listener);
    }, [insets.top, scrollY]);

    if (!loading && !article) {
        return (
            <ThemedView style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ThemedText>Article not found</ThemedText>
                </View>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <Animated.View
                style={[
                    styles.header,
                    {
                        paddingTop: insets.top,
                        backgroundColor: headerSolid
                            ? (colorScheme === 'light' ? Colors.light.background : Colors.dark.background)
                            : 'transparent',
                        borderBottomWidth: headerSolid ? StyleSheet.hairlineWidth : 0,
                        borderBottomColor: colorScheme === 'light' ? Colors.light.border : Colors.dark.border,
                    }
                ]}
            >
                {/* Left: Back Button */}
                <Link href="/articles" asChild>
                    <TouchableOpacity
                        style={styles.headerBackButton}
                        activeOpacity={0.7}
                    >
                        <View style={[
                            styles.backButtonCircle,
                            colorScheme === 'light' ? styles.backButtonCircleLight : styles.backButtonCircleDark
                        ]}>
                            <ThemedIcon Icon={ChevronLeft} lightColor={Colors.light.text} darkColor={Colors.dark.text} size={28} style={styles.backButtonIcon} />
                        </View>
                    </TouchableOpacity>
                </Link>
                {/* Center: Title */}
                <View style={styles.headerTitleContainer}>
                    {headerSolid && (
                        <ThemedText
                            type="defaultSemiBold"
                            numberOfLines={1}
                            style={[
                                styles.headerTitle,
                                { color: colorScheme === 'light' ? Colors.light.text : Colors.dark.text }
                            ]}
                        >
                            Article
                        </ThemedText>
                    )}
                </View>
                {/* Right: Spacer for symmetry */}
                <View style={styles.headerRightSpacer} />
            </Animated.View>
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator />
                </View>
            ) : (
                <Animated.ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    scrollEventThrottle={16}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false }
                    )}
                >
                    {/* Article Image inside the scroll view */}
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: article.image }}
                            placeholder={{ uri: article.imageBlurhash }}
                            style={styles.image}
                            contentFit="cover"
                            transition={700}
                            placeholderContentFit="cover"
                        />
                    </View>
                    <ThemedView style={styles.mainSection}>
                        <ThemedText type="title" style={{ fontSize: 26 }}>
                            {article.title}
                        </ThemedText>
                        <ThemedText type="default" style={{ color: Colors[colorScheme].inputPlaceholder, fontSize: 16 }}>
                            {article.publishedAt
                                ? new Date(article.publishedAt).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                })
                                : ''}
                        </ThemedText>
                        {article.description && (
                            <View style={styles.section}>
                                <ThemedText type="defaultSemiBold" lightColor={Colors.light.icon} darkColor={Colors.dark.icon} style={{ fontSize: 17 }}>
                                    {article.description}
                                </ThemedText>
                            </View>
                        )}
                        {article.content && (
                            <View style={styles.section}>
                                <Markdown
                                    style={{
                                        body: { color: Colors[colorScheme].text, fontSize: 16, fontFamily: 'WorkSans_400Regular', lineHeight: 24 },
                                        heading1: { color: Colors[colorScheme].text, fontFamily: 'WorkSans_600SemiBold', marginTop: 16, marginBottom: 4, lineHeight: 32 },
                                        heading2: { color: Colors[colorScheme].text, fontFamily: 'WorkSans_600SemiBold', marginTop: 16, lineHeight: 32 },
                                        heading3: { color: Colors[colorScheme].text, fontFamily: 'WorkSans_600SemiBold', marginTop: 8 },
                                        heading4: { color: Colors[colorScheme].text, fontFamily: 'WorkSans_600SemiBold', marginTop: 8 },
                                        heading5: { color: Colors[colorScheme].text, fontFamily: 'WorkSans_600SemiBold', marginTop: 8 },
                                    }}
                                >
                                    {article.content}
                                </Markdown>
                            </View>
                        )}
                    </ThemedView>
                </Animated.ScrollView>
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    imageContainer: {
        width: width,
        height: IMAGE_HEIGHT,
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    image: {
        width: width,
        height: IMAGE_HEIGHT,
        resizeMode: 'cover',
    },
    mainSection: {
        marginVertical: 8,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
    },
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
    },
    header: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        zIndex: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerBackButton: {
        marginLeft: 8,
        marginTop: 0,
        height: 48,
        width: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
    },
    headerTitle: {
        fontSize: 18,
        textAlign: 'center',
        includeFontPadding: false,
    },
    headerRightSpacer: {
        width: 56, // match back button + margin for symmetry
        height: 48,
    },
    backButtonCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonCircleLight: {
        backgroundColor: Colors.light.primary,
    },
    backButtonCircleDark: {
        backgroundColor: Colors.dark.primary,
    },
    backButtonIcon: {
        marginLeft: -2,
    },
});
