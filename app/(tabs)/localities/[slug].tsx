import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Image } from 'expo-image';
import { AppleMaps, GoogleMaps } from 'expo-maps';
import { Link, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MAP_HEIGHT = 300;
const HEADER_HEIGHT = 48;

export default function LocalitySlugScreen() {
    const { slug } = useLocalSearchParams<{ slug: string }>();
    const colorScheme = useColorScheme() ?? 'light';
    const [locality, setLocality] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const bottom = useBottomTabOverflow();
    const insets = useSafeAreaInsets();

    // Header background on scroll
    const [headerSolid, setHeaderSolid] = useState(false);
    const scrollY = useRef(new Animated.Value(0)).current;

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

    useEffect(() => {
        const listener = scrollY.addListener(({ value }) => {
            setHeaderSolid(value > MAP_HEIGHT - (insets.top + HEADER_HEIGHT));
        });
        return () => scrollY.removeListener(listener);
    }, [insets.top, scrollY]);

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
            {/* Header overlays map */}
            <Animated.View
                style={[
                    styles.header,
                    {
                        paddingTop: insets.top,
                        height: HEADER_HEIGHT + insets.top,
                        backgroundColor: headerSolid
                            ? (colorScheme === 'light' ? Colors.light.background : Colors.dark.background)
                            : 'transparent',
                        borderBottomWidth: headerSolid ? StyleSheet.hairlineWidth : 0,
                        borderBottomColor: colorScheme === 'light' ? Colors.light.border : Colors.dark.border,
                    }
                ]}
            >
                {/* Back Button */}
                <Link href="/localities" asChild>
                    <TouchableOpacity
                        style={styles.headerBackButton}
                        activeOpacity={0.7}
                    >
                        <View style={[
                            styles.backButtonCircle,
                            colorScheme === 'light' ? styles.backButtonCircleLight : styles.backButtonCircleDark
                        ]}>
                            <ChevronLeft color={colorScheme === 'light' ? Colors.light.text : Colors.dark.text} size={28} style={styles.backButtonIcon} />
                        </View>
                    </TouchableOpacity>
                </Link>
                {/* Title */}
                <View style={styles.headerTitleContainer}>
                    {headerSolid && (
                        <ThemedText
                            type="defaultSemiBold"
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            style={[
                                styles.headerTitle,
                                { color: colorScheme === 'light' ? Colors.light.text : Colors.dark.text }
                            ]}
                        >
                            {(locality.name?.split(',')[0] || locality.name)}
                        </ThemedText>
                    )}
                </View>
                {/* Spacer for symmetry */}
                <View style={styles.headerRightSpacer} />
            </Animated.View>
            {/* Map at the top, extends into the status bar */}
            <Animated.ScrollView
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
            >
                <View style={{ width: '100%', height: MAP_HEIGHT, position: 'relative' }}>
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
            </Animated.ScrollView>
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
    header: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        zIndex: 20,
        flexDirection: 'row',
        alignItems: 'center',
        // height and paddingTop set dynamically
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
        maxWidth: 220,
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
