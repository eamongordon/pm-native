import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Platform, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function PhotoDetailsScreen() {
    const { id } = useLocalSearchParams();
    const [photo, setPhoto] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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
                                <Image
                                    source={{ uri: photo.image }}
                                    style={styles.image}
                                    resizeMode="cover"
                                />
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
});
