import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Image } from 'expo-image';
import { Link, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Platform, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ArticleDetailsScreen() {
    const { slug } = useLocalSearchParams();
    const [article, setArticle] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const colorScheme = useColorScheme() ?? 'light';

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

    if (!loading && !article) {
        return (
            <ThemedView style={styles.container}>
                <SafeAreaProvider>
                    <SafeAreaView style={styles.safeArea}>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <ThemedText>Article not found</ThemedText>
                        </View>
                    </SafeAreaView>
                </SafeAreaProvider>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <StatusBar />
            <SafeAreaProvider>
                <SafeAreaView style={styles.safeArea}>
                    {loading ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator />
                        </View>
                    ) : (
                        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                            <View style={styles.imageContainer}>
                                {/* Back Button */}
                                <Link href="/articles" asChild>
                                    <TouchableOpacity
                                        style={styles.backButton}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[
                                            styles.backButtonCircle,
                                            colorScheme === 'light' ? styles.backButtonCircleLight : styles.backButtonCircleDark
                                        ]}>
                                            <ChevronLeft color="#fff" size={28} style={styles.backButtonIcon} />
                                        </View>
                                    </TouchableOpacity>
                                </Link>
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
                                        <ThemedText style={{ fontSize: 17 }}>
                                            {article.description}
                                        </ThemedText>
                                    </View>
                                )}
                                {article.content && (
                                    <View style={styles.section}>
                                        <Markdown
                                            style={{
                                                body: { color: Colors[colorScheme].text, fontSize: 17, fontFamily: 'WorkSans_400Regular' },
                                                heading1: { color: Colors[colorScheme].text, fontSize: 26, fontFamily: 'WorkSans_600Semibold', marginTop: 16, marginBottom: 4 },
                                                heading2: { color: Colors[colorScheme].text, fontSize: 22, fontFamily: 'WorkSans_600Semibold', marginTop: 16, marginBottom: 4 },
                                                heading3: { color: Colors[colorScheme].text, fontSize: 20, fontFamily: 'WorkSans_600Semibold', marginTop: 8, marginBottom: 4 },
                                                heading4: { color: Colors[colorScheme].text, fontSize: 18, fontFamily: 'WorkSans_600Semibold', marginTop: 8, marginBottom: 4 },
                                                heading5: { color: Colors[colorScheme].text, fontSize: 16, fontFamily: 'WorkSans_600Semibold', marginTop: 8, marginBottom: 4 },
                                            }}
                                        >
                                            {article.content}
                                        </Markdown>
                                    </View>
                                )}
                            </ThemedView>
                        </ScrollView>
                    )}
                </SafeAreaView>
            </SafeAreaProvider>
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
        height: 260,
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    image: {
        width: width,
        height: 260,
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
    backButton: {
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 10,
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
