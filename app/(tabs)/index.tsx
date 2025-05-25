import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { FlatList, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Glimmer } from '@/components/Glimmer';
import HomeSearchModal from '@/components/HomeSearchModal';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// MineralSkeletonCard for homepage minerals carousel
function MineralSkeletonCard() {
    const colorScheme = useColorScheme() ?? 'light';
    const baseColor = colorScheme === 'dark' ? '#222' : '#e0e0e0';
    return (
        <View style={{ alignItems: 'center', marginRight: 10, width: 140 }}>
            <View style={{ width: 140, height: 200, borderRadius: 12, backgroundColor: baseColor, overflow: 'hidden', marginBottom: 6 }}>
                <Glimmer />
            </View>
            <View style={{ width: 100, height: 18, borderRadius: 4, backgroundColor: baseColor, overflow: 'hidden' }}>
                <Glimmer />
            </View>
        </View>
    );
}

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
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ paddingVertical: 8 }}
                >
                    {Array.from({ length: 5 }).map((_, i) => (
                        <MineralSkeletonCard key={`mineral-skeleton-${i}`} />
                    ))}
                </ScrollView>
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

// ArticleSkeletonCard for homepage (reuse from articles page)
function ArticleSkeletonCard({ imageWidth }: { imageWidth: number }) {
    const colorScheme = useColorScheme() ?? 'light';
    const baseColor = colorScheme === 'dark' ? '#222' : '#e0e0e0';
    return (
        <View style={[styles.articleCard, { marginBottom: 20 }]}>
            <View style={{ width: imageWidth, height: 180, borderRadius: 8, backgroundColor: baseColor, overflow: 'hidden' }}>
                <Glimmer />
            </View>
            <View style={{ marginTop: 12, paddingHorizontal: 8, gap: 4 }}>
                <View style={{ width: '80%', height: 18, borderRadius: 4, backgroundColor: baseColor, marginBottom: 8, overflow: 'hidden' }}>
                    <Glimmer />
                </View>
                <View style={{ width: '40%', height: 14, borderRadius: 4, backgroundColor: baseColor, marginBottom: 8, overflow: 'hidden' }}>
                    <Glimmer />
                </View>
                <View style={{ width: '100%', height: 15, borderRadius: 4, backgroundColor: baseColor, marginBottom: 4, overflow: 'hidden' }}>
                    <Glimmer />
                </View>
                <View style={{ width: '90%', height: 15, borderRadius: 4, backgroundColor: baseColor, marginBottom: 4, overflow: 'hidden' }}>
                    <Glimmer />
                </View>
                <View style={{ width: '70%', height: 15, borderRadius: 4, backgroundColor: baseColor, overflow: 'hidden' }}>
                    <Glimmer />
                </View>
            </View>
        </View>
    );
}

// TopArticlesList with FlatList and same card layout as articles page
function TopArticlesList() {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const colorScheme = useColorScheme() ?? 'light';
    // Use same width logic as articles page
    const screenWidth = require('react-native').Dimensions.get('window').width;
    const imageWidth = screenWidth - 32;

    useEffect(() => {
        let url = 'https://www.prospectorminerals.com/api/articles?fieldset=display&limit=5';
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
                <FlatList
                    data={Array.from({ length: 3 })}
                    keyExtractor={(_, i) => `skeleton-article-${i}`}
                    renderItem={() => <ArticleSkeletonCard imageWidth={imageWidth} />}
                    contentContainerStyle={{ paddingBottom: 16, paddingTop: 8 }}
                />
            ) : articles.length === 0 ? (
                <ThemedText>No articles found</ThemedText>
            ) : (
                <FlatList
                    data={articles}
                    keyExtractor={(item) => item.slug}
                    contentContainerStyle={{ paddingBottom: 16, paddingTop: 8 }}
                    renderItem={({ item }) => (
                        <Link
                            href={`/articles/${item.slug}`}
                            asChild
                        >
                            <TouchableOpacity style={styles.articleCard}>
                                <ExpoImage
                                    style={{
                                        width: imageWidth,
                                        height: 180,
                                        borderRadius: 12,
                                        backgroundColor: colorScheme === 'light' ? Colors.light.inputBackground : Colors.dark.inputBackground,
                                    }}
                                    source={{ uri: item.image }}
                                    placeholder={item.imageBlurhash ? { uri: item.imageBlurhash } : undefined}
                                    contentFit="cover"
                                    transition={700}
                                    placeholderContentFit="cover"
                                />
                                <View style={{ marginTop: 12, paddingHorizontal: 8, gap: 4 }}>
                                    <ThemedText type="defaultSemiBold" style={{ fontSize: 18 }}>
                                        {item.title}
                                    </ThemedText>
                                    <ThemedText type="default" style={{ color: Colors[colorScheme].inputPlaceholder, fontSize: 14 }}>
                                        {item.createdAt
                                            ? new Date(item.createdAt).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })
                                            : ''}
                                    </ThemedText>
                                    <ThemedText numberOfLines={3} style={{ fontSize: 15 }}>
                                        {item.description}
                                    </ThemedText>
                                </View>
                            </TouchableOpacity>
                        </Link>
                    )}
                />
            )}
        </View>
    );
}

export default function HomeScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const bottom = useBottomTabOverflow();

    // Dynamic greeting based on time of day
    function getGreeting() {
        const hour = new Date().getHours();
        if (hour < 5) return "Hey there, night owl";
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    }

    // Fun facts array
    const funFacts = [
        "Did you know? Painite was once the rarest mineral on Earth.",
        "Fun fact: Keep Dioptase out of heat or light—it loses its color.",
        "Did you know? The mineral with the longest name is potassic-magnesio-fluoro-arfvedsonite.",
        "Fun fact: Zircon is the oldest mineral on Earth, dating back over 4 billion years.",
        "Did you know? Chrysocolla isn't actually a mineral.",
        "Fun fact: Topaz cleaves perfectly in one direction.",
        "Did you know? Pyrite can decay into sulfuric acid.",
        "Fun fact: You can tell Microcline and Orthoclase apart by twinning.",
        "Did you know? Morganite is named after banker J.P. Morgan.",
        "Fun fact: Langban, Sweden is the type locality of over 70 species."
    ];
    // Pick a random fun fact on each render
    const funFact = funFacts[Math.floor(Math.random() * funFacts.length)];

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
                        <ThemedText type="title">{getGreeting()}!</ThemedText>
                    </ThemedView>
                    <View style={{ paddingHorizontal: 16, marginTop: -8, marginBottom: 8 }}>
                        <ThemedText style={{ fontSize: 15, color: Colors[colorScheme].inputPlaceholder }}>
                            {funFact}
                        </ThemedText>
                    </View>
                    <ThemedView>
                        <HomeSearchModal />
                    </ThemedView>
                    <TopMineralsCarousel />
                    <TopArticlesList />
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
    articleCard: {
        marginBottom: 20,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: 'transparent',
    },
});
