import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Image } from 'expo-image';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, Platform, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function PhotoDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter(); // Add router for navigation
    const [photo, setPhoto] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const colorScheme = useColorScheme() ?? 'light';

    useEffect(() => {
        if (!id) return;
        setLoading(true);

        let url = `https://www.prospectorminerals.com/api/photos?filter=${encodeURIComponent(
            JSON.stringify({ id })
        )}&fieldset=full&limit=1`;

        // Use proxy for web
        if (Platform.OS === 'web') {
            url = `https://corsproxy.io/?url=${encodeURIComponent(url)}`;
        }

        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (data && data.results && data.results.length > 0) {
                    setPhoto(data.results[0]);
                } else {
                    setPhoto(null);
                }
            })
            .catch(() => setPhoto(null))
            .finally(() => setLoading(false));
    }, [id]);

    // Show Not Found screen if photo is not found after loading
    if (!loading && !photo) {
        return null;
    }

    console.log('Photo:', photo);

    return (
        <ThemedView style={styles.container}>
            {/* Hide status bar when modal is open */}
            <StatusBar hidden={modalVisible} />
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
                                <Link href="/photos" asChild>
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
                                {/* Image with modal trigger */}
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={() => setModalVisible(true)}
                                    style={{ zIndex: 1 }}
                                >
                                    <Image
                                        source={{ uri: photo.image }}
                                        style={styles.image}
                                        placeholder={photo.imageBlurhash ? { uri: photo.imageBlurhash } : undefined}
                                        contentFit="cover"
                                        placeholderContentFit="cover"
                                        transition={700}
                                    />
                                </TouchableOpacity>
                            </View>
                            <ThemedView style={styles.mainSection}>
                                <ThemedText type="title">
                                    {photo.name || 'Photo'}
                                </ThemedText>
                                {(photo.locality?.name || photo.locality_fallback) && (
                                    <ThemedText type="defaultSemiBold" style={{ fontSize: 18 }}>
                                        {photo.locality?.name ?? photo.locality_fallback}
                                    </ThemedText>
                                )}
                                {(photo.specimen_height || photo.specimen_length || photo.specimen_width) && (
                                    <View style={styles.section}>
                                        <ThemedText>
                                            {`${photo.specimen_length} x ${photo.specimen_width} x ${photo.specimen_height} cm`}
                                        </ThemedText>
                                    </View>
                                )}
                                {photo.description && (
                                    <View style={styles.section}>
                                        <ThemedText>
                                            {photo.description}
                                        </ThemedText>
                                    </View>
                                )}
                                {/* Mineral Chips */}
                                {photo.minerals && Array.isArray(photo.minerals) && photo.minerals.length > 0 && (
                                    <View style={styles.chipsWrapContainer}>
                                        {photo.minerals.map(({ mineral }: any) => (
                                            <Link
                                                key={mineral.slug}
                                                href={`/minerals/${mineral.slug}`}
                                                asChild
                                            >
                                                <TouchableOpacity>
                                                    <View style={[styles.chip, colorScheme === 'light' ? styles.chipLight : styles.chipDark]}>
                                                        {mineral.photos && mineral.photos[0]?.photo?.image && (
                                                            <Image
                                                                source={{ uri: mineral.photos[0].photo.image }}
                                                                placeholder={mineral.photos[0].photo.imageBlurhash ? { uri: mineral.photos[0].photo.imageBlurhash } : undefined}
                                                                contentFit="cover"
                                                                placeholderContentFit="cover"
                                                                transition={700}
                                                                style={styles.chipImage}
                                                            />
                                                        )}
                                                        <ThemedText style={styles.chipText}>
                                                            {mineral.name}
                                                        </ThemedText>
                                                    </View>
                                                </TouchableOpacity>
                                            </Link>
                                        ))}
                                    </View>
                                )}
                            </ThemedView>
                        </ScrollView>
                    )}
                    {/* Fullscreen Modal for Image */}
                    <Modal
                        visible={modalVisible}
                        transparent={true}
                        animationType="fade"
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <View style={styles.modalBackground}>
                            <Image
                                source={{ uri: photo?.image }}
                                style={styles.fullImage}
                                contentFit="contain"
                                placeholder={photo?.imageBlurhash ? { uri: photo.imageBlurhash } : undefined}
                                placeholderContentFit="contain"
                                transition={700}
                            />
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <ThemedText style={{ color: '#fff', fontSize: 28 }}>✕</ThemedText>
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
    imageContainer: {
        width: width,
        height: 300,
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: width,
        height: 300,
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
    chipsWrapContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
        marginBottom: 4,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    chipLight: {
        backgroundColor: Colors.light.primary,
    },
    chipDark: {
        backgroundColor: Colors.dark.primary,
    },
    chipImage: {
        width: 28,
        height: 28,
        borderRadius: 14,
        marginRight: 8,
    },
    chipText: {
        fontSize: 16,
        fontWeight: '500',
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
});
