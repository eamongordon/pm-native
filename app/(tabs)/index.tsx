import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import HomeSearchModal from '@/components/HomeSearchModal';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// TopMineralsCarousel with real data
function TopMineralsCarousel() {
    const [minerals, setMinerals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<ScrollView>(null);

    useEffect(() => {
        let url = 'https://www.prospectorminerals.com/api/minerals?limit=10';
        if (Platform.OS === 'web') {
            url = `https://corsproxy.io/?url=${encodeURIComponent(url)}`;
        }
        fetch(url)
            .then(res => res.json())
            .then(data => setMinerals(data.results || []))
            .catch(() => setMinerals([]))
            .finally(() => setLoading(false));
    }, []);

    // Scroll to the second item after data loads
    useEffect(() => {
        if (!loading && minerals.length > 1 && scrollRef.current) {
            setTimeout(() => {
                scrollRef.current?.scrollTo({ x: 120, animated: false });
            }, 0);
        }
    }, [loading, minerals.length]);

    return (
        <View style={{ marginVertical: 8 }}>
            <ThemedText type="subtitle" style={{ marginLeft: 16 }}>Minerals</ThemedText>
            {loading ? (
                <ActivityIndicator style={{ marginVertical: 16 }} />
            ) : (
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ paddingVertical: 8 }}
                >
                    {minerals.map(mineral => (
                        <Link
                            key={mineral.id}
                            href={`/minerals/${mineral.slug}`}
                            asChild
                        >
                            <TouchableOpacity
                                style={{ alignItems: 'center', marginRight: 10, width: 140 }}
                            >
                                <View style={{ width: 140, height: 200, borderRadius: 12, overflow: 'hidden', marginBottom: 6, backgroundColor: '#eee' }}>
                                    <ExpoImage
                                        source={{ uri: mineral.photos?.[0]?.photo?.image || 'https://via.placeholder.com/80' }}
                                        style={{ width: 140, height: 200 }}
                                        placeholder={mineral.photos?.[0]?.photo?.imageBlurhash ? { uri: mineral.photos[0].photo.imageBlurhash } : undefined}
                                        contentFit="cover"
                                        transition={400}
                                        placeholderContentFit="cover"
                                    />
                                    {/* Gradient fade overlay and title */}
                                    <View style={{
                                        position: 'absolute',
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        height: 64, // match the gradient height
                                        justifyContent: 'flex-end',
                                    }}>
                                        <LinearGradient
                                            colors={[
                                                'rgba(0,0,0,0)', 
                                                'rgba(0,0,0,0.45)', 
                                                'rgba(0,0,0,0.7)'
                                            ]}
                                            locations={[0, 0.5, 1]}
                                            style={{
                                                ...StyleSheet.absoluteFillObject,
                                                height: 64, // extend the gradient higher
                                            }}
                                            start={{ x: 0.5, y: 0 }}
                                            end={{ x: 0.5, y: 1 }}
                                        />
                                        <ThemedText
                                            style={{
                                                textAlign: 'center',
                                                fontSize: 16,
                                                color: '#fff',
                                                paddingHorizontal: 6,
                                                paddingBottom: 10,
                                            }}
                                        >
                                            {mineral.name}
                                        </ThemedText>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </Link>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

// TopArticlesCarousel with real data
function TopArticlesCarousel() {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let url = 'https://www.prospectorminerals.com/api/articles?fieldset=display&limit=10';
        if (Platform.OS === 'web') {
            url = `https://corsproxy.io/?url=${encodeURIComponent(url)}`;
        }
        fetch(url)
            .then(res => res.json())
            .then(data => setArticles(data.results || []))
            .catch(() => setArticles([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <View style={{ marginHorizontal: 16 }}>
            <ThemedText type="subtitle">Articles</ThemedText>
            {loading ? (
                <ActivityIndicator style={{ marginVertical: 16 }} />
            ) : (
                <View style={{ gap: 16, paddingVertical: 8 }}>
                    {articles.map(article => (
                        <Link
                            key={article.id}
                            href={`/articles/${article.slug}`}
                            asChild
                        >
                            <TouchableOpacity
                                style={{ flexDirection: 'row', alignItems: 'center', marginRight: 0, backgroundColor: 'transparent', borderRadius: 8 }}
                            >
                                <ExpoImage
                                    source={{ uri: article.image || 'https://via.placeholder.com/120x80' }}
                                    style={{ width: 100, height: 70, borderRadius: 8, marginRight: 14, backgroundColor: '#eee' }}
                                    placeholder={article.imageBlurhash ? { uri: article.imageBlurhash } : undefined}
                                    contentFit="cover"
                                    transition={400}
                                    placeholderContentFit="cover"
                                />
                                <View style={{ flex: 1 }}>
                                    <ThemedText type="defaultSemiBold" numberOfLines={2}>{article.title}</ThemedText>
                                    <ThemedText type="default" style={{ fontSize: 14, lineHeight: 21, color: '#888' }}>
                                        {article.createdAt
                                            ? new Date(article.createdAt).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })
                                            : ''}
                                    </ThemedText>
                                </View>
                            </TouchableOpacity>
                        </Link>
                    ))}
                </View>
            )}
        </View>
    );
}

export default function HomeScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const bottom = useBottomTabOverflow();

    return (
        <ThemedView style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: bottom + 32 }
                    ]}
                    showsVerticalScrollIndicator={false}
                >
                    <ThemedView style={styles.titleContainer}>
                        <ThemedText type="title">Welcome!</ThemedText>
                        <HelloWave />
                    </ThemedView>
                    <ThemedView>
                        <HomeSearchModal />
                    </ThemedView>
                    <TopMineralsCarousel />
                    <TopArticlesCarousel />
                </ScrollView>
            </SafeAreaView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        // No extra padding here; SafeAreaView handles top inset
    },
    scrollContent: {
        paddingTop: 16,
        gap: 16,
        // Remove paddingTop: 32 to avoid double spacing with SafeAreaView
    },
    titleContainer: {
        paddingHorizontal: 16,
        paddingTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    reactLogo: {
        height: 178,
        width: 290,
        bottom: 0,
        left: 0,
        position: 'absolute',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        width: '100%',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 0,
        alignItems: 'stretch',
        minHeight: 300,
        maxHeight: '80%',
        backgroundColor: 'white',
        overflow: 'hidden',
    },
    modalContentLight: {
        backgroundColor: Colors.light.background,
    },
    modalContentDark: {
        backgroundColor: Colors.dark.background,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 18,
        paddingBottom: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#e0e0e0',
        zIndex: 2,
    },
    modalSearchInput: {
        flex: 1,
        fontSize: 18,
        height: 40,
        fontFamily: 'WorkSans_400Regular',
    },
    modalCloseButton: {
        marginLeft: 12,
        minWidth: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    resultRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#e0e0e0',
    },
    resultImage: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#eee',
    },
    resultType: {
        color: '#888',
        fontSize: 13,
        marginTop: 2,
    },
});
