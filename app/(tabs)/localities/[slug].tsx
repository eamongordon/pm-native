import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Image } from 'expo-image';
import { AppleMaps, GoogleMaps } from 'expo-maps';
import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function LocalitySlugScreen() {
    const { slug } = useLocalSearchParams<{ slug: string }>();
    const colorScheme = useColorScheme() ?? 'light';
    const [locality, setLocality] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const bottom = useBottomTabOverflow();

    useEffect(() => {
        let cancelled = false;
        async function fetchLocality() {
            setLoading(true);
            try {
                const url = `https://www.prospectorminerals.com/api/localities?filter=${encodeURIComponent(JSON.stringify({ slug }))}&limit=1&fieldset=full`;
                const res = await fetch(url);
                const data = await res.json();
                if (!cancelled) setLocality(data.results?.[0] ?? null);
            } catch {
                if (!cancelled) setLocality(null);
            }
            if (!cancelled) setLoading(false);
        }
        if (slug) fetchLocality();
        return () => { cancelled = true; };
    }, [slug]);

    if (loading) {
        return (
            <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator />
            </ThemedView>
        );
    }
    if (!locality) {
        return (
            <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ThemedText>Locality not found</ThemedText>
            </ThemedView>
        );
    }

    const hasCoords = locality.latitude && locality.longitude;
    const minerals: any[] = locality.minerals || [];

    return (
        <ThemedView style={{ flex: 1 }}>
            {/* Map at the top, extends into the status bar */}
            <ScrollView>
                <View style={{ width: '100%', height: 300, position: 'relative' }}>
                    {hasCoords ? (
                        Platform.OS === 'ios' ? (
                            <AppleMaps.View
                                style={StyleSheet.absoluteFill}
                                markers={[
                                    {
                                        coordinates: {
                                            latitude: Number(locality.latitude),
                                            longitude: Number(locality.longitude),
                                        },
                                        id: locality.id,
                                        title: locality.name,
                                    }
                                ]}
                                cameraPosition={{
                                    coordinates: {
                                        latitude: Number(locality.latitude),
                                        longitude: Number(locality.longitude),
                                    },
                                    zoom: 6,
                                }}
                                uiSettings={{
                                    myLocationButtonEnabled: false,
                                }}
                            />
                        ) : (
                            <GoogleMaps.View
                                style={[StyleSheet.absoluteFill, { top: 0 }]}
                                markers={[
                                    {
                                        id: locality.id,
                                        coordinates: {
                                            latitude: Number(locality.latitude),
                                            longitude: Number(locality.longitude),
                                        },
                                        title: locality.name,
                                    }
                                ]}
                            />
                        )
                    ) : (
                        <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}>
                            <ThemedText>No coordinates</ThemedText>
                        </View>
                    )}
                </View>
                <View
                    style={[styles.contentContainer, { paddingBottom: bottom + 24 }]}
                >
                    {/* Title */}
                    <ThemedText type="title" style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 8 }}>
                        {locality.name}
                    </ThemedText>
                    {/* Description */}
                    {locality.description ? (
                        <ThemedText style={{ fontSize: 16, marginBottom: 18, color: Colors[colorScheme].text, opacity: 0.85 }}>
                            {locality.description}
                        </ThemedText>
                    ) : null}
                    {/* Properties Table */}
                    <View style={[styles.table, { borderColor: Colors[colorScheme].border }]}>
                        <View style={styles.tableRow}>
                            <ThemedText style={styles.tableLabel}>Latitude</ThemedText>
                            <ThemedText style={styles.tableValue}>{locality.latitude ?? '-'}</ThemedText>
                        </View>
                        <View style={styles.tableRow}>
                            <ThemedText style={styles.tableLabel}>Longitude</ThemedText>
                            <ThemedText style={styles.tableValue}>{locality.longitude ?? '-'}</ThemedText>
                        </View>
                        <View style={styles.tableRow}>
                            <ThemedText style={styles.tableLabel}>Type</ThemedText>
                            <ThemedText style={styles.tableValue}>{locality.type ?? '-'}</ThemedText>
                        </View>
                    </View>
                    {/* Minerals Chips */}
                    <View style={{ marginTop: 24 }}>
                        <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>Minerals</ThemedText>
                        <View style={styles.chipsWrapContainer}>
                            {(!minerals || minerals.length === 0) ? (
                                <ThemedText style={{ opacity: 0.6 }}>None listed</ThemedText>
                            ) : (
                                minerals.map((min: any) => (
                                    <Link
                                        key={min.slug || min.id || min.name}
                                        href={`/minerals/${min.slug}`}
                                        asChild
                                    >
                                        <TouchableOpacity>
                                            <View style={[
                                                styles.chip,
                                                colorScheme === 'light' ? styles.chipLight : styles.chipDark
                                            ]}>
                                                {min.photos && min.photos[0]?.photo?.image && (
                                                    <Image
                                                        source={{ uri: min.photos[0].photo.image }}
                                                        placeholder={min.photos[0].photo.imageBlurhash ? { uri: min.photos[0].photo.imageBlurhash } : undefined}
                                                        contentFit="cover"
                                                        placeholderContentFit="cover"
                                                        transition={700}
                                                        style={styles.chipImage}
                                                    />
                                                )}
                                                <ThemedText style={styles.chipText}>
                                                    {min.name}
                                                </ThemedText>
                                            </View>
                                        </TouchableOpacity>
                                    </Link>
                                ))
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        paddingTop: 24,
        paddingHorizontal: 24,
    },
    table: {
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
    },
    tableRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#e0e0e0',
        backgroundColor: 'transparent',
    },
    tableLabel: {
        fontWeight: 'bold',
        opacity: 0.7,
        fontSize: 15,
    },
    tableValue: {
        fontSize: 15,
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
});
