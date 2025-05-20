import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Image } from 'expo-image';
import { Link, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, NativeScrollEvent, NativeSyntheticEvent, Platform, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function DetailsScreen() {
    const { slug } = useLocalSearchParams();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mineral, setMineral] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [galleryVisible, setGalleryVisible] = useState(false);
    const [galleryIndex, setGalleryIndex] = useState(0);

    const colorScheme = useColorScheme() ?? 'light';

    useEffect(() => {
        if (!slug) return;
        setLoading(true);

        let url = `https://www.prospectorminerals.com/api/minerals?filter=${encodeURIComponent(
            JSON.stringify({ slug })
        )}&fieldset=full&limit=1`;

        // Use proxy for web
        if (Platform.OS === 'web') {
            url = `https://corsproxy.io/?url=${encodeURIComponent(url)}`;
        }

        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (data && data.results && data.results.length > 0) {
                    setMineral(data.results[0]);
                } else {
                    setMineral(null);
                }
            })
            .catch(() => setMineral(null))
            .finally(() => setLoading(false));
    }, [slug]);

    // Show Not Found screen if mineral is not found after loading
    if (!loading && !mineral) {
        return null;
    }

    // Use mineral photos if available, fallback to static images
    const images =
        mineral && mineral.photos?.length > 0
            ? mineral.photos.map((p: any) => ({ uri: p.photo?.image, blurhash: p.photo?.imageBlurhash })).filter((obj: any) => !!obj.uri)
            : [
                'https://ousfgajmtaam7m3j.public.blob.vercel-storage.com/459a90da-a3bf-4620-a324-ffddb2bba39f-nElxfP7Hr4OpAdvxC2moNoHVmpOMeL.jpg',
                'https://ousfgajmtaam7m3j.public.blob.vercel-storage.com/965e7025-1ebd-469d-8793-cfae54c77d9e-FpEbGma6MpXAnt295UKzSUPnkoYEeZ.jpeg',
                'https://ousfgajmtaam7m3j.public.blob.vercel-storage.com/220f2624-dcf4-46f0-b6ca-fa68f14c94c4-8Q78nYgLyTmjZmthfhrE4GoNIh3B52.jpeg',
            ];

    // Handler for scroll event to update currentIndex
    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const page = Math.round(event.nativeEvent.contentOffset.x / width);
        if (page !== currentIndex) setCurrentIndex(page);
    };

    return (
        <ThemedView style={styles.container}>
            <StatusBar hidden={galleryVisible} />
            <SafeAreaProvider>
                <SafeAreaView style={styles.safeArea}>
                    {loading ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator />
                        </View>
                    ) : (
                        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                            <View style={styles.galleryContainer}>
                                {/* Back Button */}
                                <Link href="/minerals" asChild>
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
                                <ScrollView
                                    horizontal
                                    pagingEnabled
                                    showsHorizontalScrollIndicator={false}
                                    style={styles.gallery}
                                    onScroll={handleScroll}
                                    scrollEventThrottle={16}
                                >
                                    {images.map((image: { uri: string, blurhash: string }, idx: number) => (
                                        <TouchableOpacity
                                            key={idx}
                                            activeOpacity={0.8}
                                            onPress={() => {
                                                setGalleryIndex(idx);
                                                setGalleryVisible(true);
                                            }}
                                        >
                                            <View style={{ width }}>
                                                <Image
                                                    source={{ uri: image.uri }}
                                                    style={styles.image}
                                                    placeholder={{ uri: image.blurhash }}
                                                    contentFit="cover"
                                                    placeholderContentFit="cover"
                                                    transition={700}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                            <View style={styles.indicatorContainer}>
                                {images.map((_: string, idx: number) => (
                                    <View
                                        key={idx}
                                        style={[
                                            styles.indicator,
                                            idx === currentIndex && styles.activeIndicator,
                                        ]}
                                    />
                                ))}
                            </View>
                            <ThemedView style={styles.mainSection}>
                                <ThemedText type="title">
                                    {mineral.name || 'Mineral Details'}
                                </ThemedText>
                                <ThemedText style={styles.section}>
                                    {mineral.description || `Details of user ${slug}`}
                                </ThemedText>
                                {mineral.uses && (
                                    <View style={styles.section}>
                                        <ThemedText type="subtitle">Uses</ThemedText>
                                        <ThemedText>
                                            {mineral.uses || `Details of user ${slug}`}
                                        </ThemedText>
                                    </View>
                                )}
                                {mineral.localities_description && (
                                    <View style={styles.section}>
                                        <ThemedText type="subtitle">Notable Localities</ThemedText>
                                        <ThemedText>
                                            {mineral.localities_description || `Details of user ${slug}`}
                                        </ThemedText>
                                    </View>
                                )}
                                {/* Properties Section */}
                                {(mineral.chemical_formula ||
                                    mineral.hardness_min ||
                                    mineral.hardness_max ||
                                    mineral.crystal_system ||
                                    mineral.mineral_class ||
                                    mineral.luster) && (
                                        <View style={styles.section}>
                                            <ThemedText type="subtitle">Properties</ThemedText>
                                            <View style={styles.propertiesTable}>
                                                {mineral.chemical_formula && (
                                                    <View style={styles.propertyRow}>
                                                        <ThemedText style={styles.propertyLabel} type="defaultSemiBold">
                                                            Chemical Formula
                                                        </ThemedText>
                                                        <ThemedText style={styles.propertyValue}>
                                                            {mineral.chemical_formula}
                                                        </ThemedText>
                                                    </View>
                                                )}
                                                {(mineral.hardness_min || mineral.hardness_max) && (
                                                    <View style={styles.propertyRow}>
                                                        <ThemedText style={styles.propertyLabel} type="defaultSemiBold">
                                                            Hardness
                                                        </ThemedText>
                                                        <ThemedText style={styles.propertyValue}>
                                                            {mineral.hardness_min}
                                                            {mineral.hardness_max && mineral.hardness_min !== mineral.hardness_max
                                                                ? ` - ${mineral.hardness_max}`
                                                                : ''}
                                                        </ThemedText>
                                                    </View>
                                                )}
                                                {mineral.crystal_system && (
                                                    <View style={styles.propertyRow}>
                                                        <ThemedText style={styles.propertyLabel} type="defaultSemiBold">
                                                            Crystal System
                                                        </ThemedText>
                                                        <ThemedText style={styles.propertyValue}>
                                                            {mineral.crystal_system}
                                                        </ThemedText>
                                                    </View>
                                                )}
                                                {mineral.mineral_class && (
                                                    <View style={styles.propertyRow}>
                                                        <ThemedText style={styles.propertyLabel} type="defaultSemiBold">
                                                            Mineral Class
                                                        </ThemedText>
                                                        <ThemedText style={styles.propertyValue}>
                                                            {mineral.mineral_class}
                                                        </ThemedText>
                                                    </View>
                                                )}
                                                {mineral.luster && (
                                                    <View style={styles.propertyRow}>
                                                        <ThemedText style={styles.propertyLabel} type="defaultSemiBold">
                                                            Luster
                                                        </ThemedText>
                                                        <ThemedText style={styles.propertyValue}>
                                                            {mineral.luster}
                                                        </ThemedText>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    )}
                            </ThemedView>
                        </ScrollView>
                    )}
                    {/* Fullscreen Gallery Modal */}
                    <Modal
                        visible={galleryVisible}
                        transparent={true}
                        animationType="fade"
                        onRequestClose={() => setGalleryVisible(false)}
                    >
                        <View style={styles.modalBackground}>
                            <ScrollView
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                contentOffset={{ x: galleryIndex * width, y: 0 }}
                                style={{ flex: 1 }}
                                onMomentumScrollEnd={e => {
                                    const page = Math.round(e.nativeEvent.contentOffset.x / width);
                                    setGalleryIndex(page);
                                }}
                            >
                                {images.map((image: { uri: string, blurhash: string }, idx: number) => (
                                    <View key={idx} style={{ width, height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                        <Image
                                            source={{ uri: image.uri }}
                                            style={styles.fullImage}
                                            contentFit="contain"
                                            placeholder={{ uri: image.blurhash }}
                                            placeholderContentFit="contain"
                                            transition={700}
                                        />
                                    </View>
                                ))}
                            </ScrollView>
                            {/* Modal indicator */}
                            <View style={styles.modalIndicatorContainer}>
                                {images.map((_: string, idx: number) => (
                                    <View
                                        key={idx}
                                        style={[
                                            styles.modalIndicator,
                                            idx === galleryIndex && styles.activeModalIndicator,
                                        ]}
                                    />
                                ))}
                            </View>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setGalleryVisible(false)}
                            >
                                <ThemedText style={{ color: '#fff', fontSize: 24 }}>✕</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </Modal>
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
    galleryContainer: {
        width: width,
        height: 250,
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    gallery: {
        width: width,
        height: 250,
    },
    image: {
        width: width,
        height: 250,
        resizeMode: 'cover',
    },
    indicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ccc',
        margin: 4,
    },
    activeIndicator: {
        backgroundColor: '#333',
    },
    mainSection: {
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
    propertiesTable: {
        marginTop: 4,
        marginBottom: 4,
    },
    propertyRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    propertyLabel: {
        minWidth: 180,
        marginRight: 0,
    },
    propertyValue: {
        flex: 1,
        flexWrap: 'wrap',
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: width,
        height: '100%',
        resizeMode: 'contain',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 8,
    },
    modalIndicatorContainer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
    },
    modalIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#888',
        margin: 5,
        opacity: 0.6,
    },
    activeModalIndicator: {
        backgroundColor: '#fff',
        opacity: 1,
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
