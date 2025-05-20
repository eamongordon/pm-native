import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Image as ExpoImage } from 'expo-image';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import HomeSearchModal from '@/components/HomeSearchModal';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// TopMineralsCarousel with real data
function TopMineralsCarousel() {
    const [minerals, setMinerals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <View style={{ marginVertical: 16 }}>
            <ThemedText type="subtitle">Top Minerals</ThemedText>
            {loading ? (
                <ActivityIndicator style={{ marginVertical: 16 }} />
            ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingVertical: 8 }}>
                    {minerals.map(mineral => (
                        <Link
                            key={mineral.id}
                            href={`/minerals/${mineral.slug}`}
                            asChild
                        >
                            <View style={{ alignItems: 'center', marginRight: 10, width: 120 }}>
                                <ExpoImage
                                    source={{ uri: mineral.photos?.[0]?.photo?.image || 'https://via.placeholder.com/80' }}
                                    style={{ width: 120, height: 150, borderRadius: 12, marginBottom: 6, backgroundColor: '#eee' }}
                                    placeholder={mineral.photos?.[0]?.photo?.imageBlurhash ? { uri: mineral.photos[0].photo.imageBlurhash } : undefined}
                                    contentFit="cover"
                                    transition={400}
                                    placeholderContentFit="cover"
                                />
                                <ThemedText numberOfLines={2} style={{ textAlign: 'center', fontSize: 16 }} type="default">{mineral.name}</ThemedText>
                            </View>
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

    console.log('Articles:', articles);

    return (
        <View style={{ marginVertical: 16 }}>
            <ThemedText type="subtitle" style={{ marginLeft: 8 }}>Top Articles</ThemedText>
            {loading ? (
                <ActivityIndicator style={{ marginVertical: 16 }} />
            ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingVertical: 8 }}>
                    {articles.map(article => (
                        <Link
                            key={article.id}
                            href={`/articles/${article.slug}`}
                            asChild
                        >
                            <View style={{ width: 150, marginRight: 16 }}>
                                <ExpoImage
                                    source={{ uri: article.image || 'https://via.placeholder.com/120x80' }}
                                    style={{ width: 140, height: 80, borderRadius: 8, marginBottom: 6, backgroundColor: '#eee' }}
                                    placeholder={article.imageBlurhash ? { uri: article.imageBlurhash } : undefined}
                                    contentFit="cover"
                                    transition={400}
                                    placeholderContentFit="cover"
                                />
                                <ThemedText type="defaultSemiBold">{article.title}</ThemedText>
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
                        </Link>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

export default function HomeScreen() {
    const colorScheme = useColorScheme() ?? 'light';

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
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
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    titleContainer: {
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
    searchBarContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        backgroundColor: 'transparent',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 40,
        marginBottom: 8,
    },
    searchBarLight: {
        backgroundColor: Colors.light.inputBackground,
    },
    searchBarDark: {
        backgroundColor: Colors.dark.inputBackground,
    },
    searchBarInputLight: {
        color: Colors.light.inputText,
    },
    searchBarInputDark: {
        color: Colors.dark.inputText,
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
