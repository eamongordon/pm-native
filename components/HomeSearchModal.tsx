import { Glimmer } from '@/components/Glimmer';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import type {
    ArticleDisplayFieldset,
    LocalityDisplayFieldset,
    MineralDisplayFieldset,
    PhotoDisplayFieldset
} from '@/types';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { ChevronLeft, Search } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Modal, Platform, SafeAreaView, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { ThemedIcon } from './ThemedIcon';

// Define a union type for all possible search result items
type SearchResultItem =
    | ({ type: 'mineral' } & MineralDisplayFieldset)
    | ({ type: 'locality' } & LocalityDisplayFieldset)
    | ({ type: 'photo' } & PhotoDisplayFieldset)
    | ({ type: 'article' } & ArticleDisplayFieldset);

function LoadingSkeleton() {
    return (
        <View style={{ marginTop: 8 }}>
            {[...Array(5)].map((_, idx) => (
                <View key={idx} style={styles.skeletonRow}>
                    <View style={styles.skeletonImageContainer}>
                        <Glimmer style={styles.skeletonImageGlimmer} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <View style={styles.skeletonTextShort}>
                            <Glimmer />
                        </View>
                        <View style={styles.skeletonTextLong}>
                            <Glimmer />
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );
}

export default function HomeSearchModal() {
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const colorScheme = useColorScheme() ?? 'light';

    // Helper to normalize API results to SearchResultItem
    function normalizeResult(type: string, item: any): SearchResultItem | null {
        switch (type) {
            case 'mineral':
                return {
                    ...item,
                    type: 'mineral',
                    slug: item.slug,
                    name: item.name,
                    image: item.photos?.[0]?.photo?.image ?? undefined,
                    blurhash: item.photos?.[0]?.photo?.imageBlurhash ?? undefined,
                };
            case 'photo':
                return {
                    ...item,
                    type: 'photo',
                    id: item.id,
                    name: item.name ?? '',
                    image: item.image ?? undefined,
                    blurhash: item.imageBlurhash ?? undefined,
                };
            case 'article':
                return {
                    ...item,
                    type: 'article',
                    slug: item.slug,
                    name: item.title,
                    image: item.image ?? undefined,
                    blurhash: item.imageBlurhash ?? undefined,
                };
            case 'locality':
                return {
                    ...item,
                    type: 'locality',
                    slug: item.slug,
                    name: item.name,
                    image: item.photos?.[0]?.image ?? undefined,
                    blurhash: item.photos?.[0]?.imageBlurhash ?? undefined,
                };
            default:
                return null;
        }
    }

    const handleSearch = async (query: string) => {
        if (!query) {
            setSearchResults([]);
            return;
        }
        setSearchLoading(true);
        try {
            const endpoints = [
                { url: `https://www.prospectorminerals.com/api/minerals?limit=5&filter=${encodeURIComponent(JSON.stringify({ name: query }))}`, type: 'mineral' },
                { url: `https://www.prospectorminerals.com/api/photos?limit=5&filter=${encodeURIComponent(JSON.stringify({ name: query }))}`, type: 'photo' },
                { url: `https://www.prospectorminerals.com/api/articles?limit=5&filter=${encodeURIComponent(JSON.stringify({ title: query }))}`, type: 'article' },
                { url: `https://www.prospectorminerals.com/api/localities?limit=5&filter=${encodeURIComponent(JSON.stringify({ name: query }))}`, type: 'locality' },
            ];
            const fetchUrl = (url: string) =>
                fetch(
                    Platform.OS === 'web'
                        ? `https://corsproxy.io/?url=${encodeURIComponent(url)}`
                        : url
                ).then(res => res.json()).catch(() => ({ results: [] }));

            const results = await Promise.all(
                endpoints.map(async (ep) => {
                    const data = await fetchUrl(ep.url);
                    return (data.results || [])
                        .map((item: any) => normalizeResult(ep.type, item))
                        .filter(Boolean) as SearchResultItem[];
                })
            );
            setSearchResults(results.flat());
            console.log('Search results:', results.flat());
        } catch {
            setSearchResults([]);
        }
        setSearchLoading(false);
    };

    const colorSchemeStyles = colorScheme === 'light' ? styles.modalContentLight : styles.modalContentDark;

    return (
        <>
            <View style={styles.searchBarContainer}>
                <TouchableOpacity
                    style={[styles.searchBar, colorScheme === 'light' ? styles.searchBarLight : styles.searchBarDark]}
                    onPress={() => setSearchModalVisible(true)}
                    activeOpacity={0.8}
                >
                    <Search size={20} style={{ marginRight: 8, opacity: 0.7 }} color={colorScheme === 'light' ? Colors.light.text : Colors.dark.text} />
                    <ThemedText style={{ color: Colors[colorScheme].inputPlaceholder }}>
                        Search...
                    </ThemedText>
                </TouchableOpacity>
            </View>
            <Modal
                visible={searchModalVisible}
                animationType="slide"
                onRequestClose={() => setSearchModalVisible(false)}
                transparent
            >
                <TouchableWithoutFeedback onPress={() => setSearchModalVisible(false)}>
                    <View style={styles.fullscreenModalOverlay}>
                        <TouchableWithoutFeedback>
                            <SafeAreaView style={styles.fullscreenModalContent}>
                                <View style={[colorSchemeStyles, { flex: 1 }]}>
                                    <View style={styles.modalHeader}>
                                        <TouchableOpacity onPress={() => setSearchModalVisible(false)} style={styles.modalBackButton}>
                                            <ChevronLeft size={26} color={Colors[colorScheme].text} />
                                        </TouchableOpacity>
                                        <TextInput
                                            style={[
                                                styles.modalSearchInput,
                                                colorScheme === 'light' ? styles.searchBarInputLight : styles.searchBarInputDark
                                            ]}
                                            placeholder="Search..."
                                            placeholderTextColor={Colors[colorScheme].inputPlaceholder}
                                            value={searchQuery}
                                            onChangeText={text => {
                                                setSearchQuery(text);
                                                handleSearch(text);
                                            }}
                                            autoFocus
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            clearButtonMode="while-editing"
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        {searchLoading ? (
                                            <LoadingSkeleton />
                                        ) : (
                                            <FlatList
                                                data={searchResults}
                                                keyExtractor={item => `${item.type}-${item.id}`}
                                                renderItem={({ item }) => {
                                                    // Type guard for name and image
                                                    let displayName: string = '';
                                                    let displayImage: string | undefined;
                                                    let displayBlurhash: string | undefined;

                                                    if (item.type === 'article') {
                                                        displayName = item.title;
                                                        displayImage = item.image ?? undefined;
                                                        displayBlurhash = item.imageBlurhash ?? undefined;
                                                    } else if (item.type === 'mineral') {
                                                        displayName = item.name;
                                                        displayImage = item.photos?.[0]?.photo?.image ?? undefined;
                                                        displayBlurhash = item.photos?.[0]?.photo?.imageBlurhash ?? undefined;
                                                    } else if (item.type === 'locality') {
                                                        displayName = item.name;
                                                        displayImage = item.photos?.[0]?.image ?? undefined;
                                                        displayBlurhash = item.photos?.[0]?.imageBlurhash ?? undefined;
                                                    } else if (item.type === 'photo') {
                                                        displayName = item.name ?? '';
                                                        displayImage = item.image ?? undefined;
                                                        displayBlurhash = item.imageBlurhash ?? undefined;
                                                    }

                                                    if (!displayImage || !displayName) return null;

                                                    return (
                                                        <Link
                                                            href={
                                                                item.type === 'mineral'
                                                                    ? `/minerals/${item.slug}`
                                                                    : item.type === 'locality'
                                                                        ? `/localities/${item.slug}`
                                                                        : item.type === 'photo'
                                                                            ? `/photos/${item.id}`
                                                                            : item.type === 'article'
                                                                                ? `/articles/${item.slug}`
                                                                                : '/'
                                                            }
                                                            asChild
                                                            onPress={() => {
                                                                setSearchModalVisible(false);
                                                                setSearchQuery('');
                                                            }}
                                                        >
                                                            <TouchableOpacity
                                                                style={styles.resultRow}
                                                                activeOpacity={0.7}
                                                            >
                                                                <Image
                                                                    source={{ uri: displayImage }}
                                                                    style={styles.resultImage}
                                                                    placeholder={displayBlurhash ? { uri: displayBlurhash } : undefined}
                                                                    contentFit="cover"
                                                                    transition={400}
                                                                    placeholderContentFit="cover"
                                                                />
                                                                <View style={{ flex: 1, marginLeft: 12 }}>
                                                                    <ThemedText type="defaultSemiBold">{displayName}</ThemedText>
                                                                    <ThemedText style={styles.resultType}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</ThemedText>
                                                                </View>
                                                            </TouchableOpacity>
                                                        </Link>
                                                    );
                                                }}
                                                ListEmptyComponent={
                                                    searchQuery && !searchLoading ? (
                                                        <View style={styles.noResultsContainer}>
                                                            <View style={styles.noResultsIconWrap}>
                                                                <ThemedIcon
                                                                    Icon={Search}
                                                                    size={48}
                                                                    style={{ opacity: 0.4 }}
                                                                    lightColor={Colors.light.text}
                                                                    darkColor={Colors.dark.text}
                                                                />
                                                            </View>
                                                            <ThemedText type="defaultMedium" style={styles.noResultsTitle}>
                                                                No results found
                                                            </ThemedText>
                                                            <ThemedText style={[styles.noResultsSubtitle, { color: Colors[colorScheme].inputPlaceholder }]}>
                                                                Try a different search or clear your query.
                                                            </ThemedText>
                                                            <TouchableOpacity
                                                                style={[styles.noResultsClearButton, { backgroundColor: Colors[colorScheme].primary }]}
                                                                onPress={() => {
                                                                    setSearchQuery('');
                                                                    setSearchResults([]);
                                                                }}
                                                            >
                                                                <ThemedText>Clear</ThemedText>
                                                            </TouchableOpacity>
                                                        </View>
                                                    ) : null
                                                }
                                                keyboardShouldPersistTaps="handled"
                                            />
                                        )}
                                    </View>
                                </View>
                            </SafeAreaView>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    searchBarContainer: {
        paddingHorizontal: 16,
        paddingTop: 8,
        backgroundColor: 'transparent',
        width: '100%',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 24,
        paddingHorizontal: 12,
        height: 48,
        marginBottom: 8,
        width: '100%',
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
    fullscreenModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end',
    },
    fullscreenModalContent: {
        flex: 1,
        width: '100%',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderRadius: 0,
        padding: 0,
        alignItems: 'stretch',
        minHeight: undefined,
        maxHeight: undefined,
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
    modalBackButton: {
        marginRight: 8,
        minWidth: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalSearchInput: {
        flex: 1,
        fontSize: 18,
        height: 40,
        fontFamily: 'WorkSans_400Regular',
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
    skeletonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    skeletonImageContainer: {
        width: 48,
        height: 48,
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#e0e0e0',
        marginRight: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    skeletonImageGlimmer: {
        width: 48,
        height: 48,
        borderRadius: 8,
        position: 'absolute',
        top: 0,
        left: 0,
    },
    skeletonTextShort: {
        width: '60%',
        height: 16,
        borderRadius: 4,
        backgroundColor: '#e0e0e0',
        marginBottom: 6,
        overflow: 'hidden',
    },
    skeletonTextLong: {
        width: '40%',
        height: 12,
        borderRadius: 4,
        backgroundColor: '#e0e0e0',
        overflow: 'hidden',
    },
    noResultsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 48,
        paddingHorizontal: 24,
    },
    noResultsIconWrap: {
        borderRadius: 32,
        padding: 18,
        marginBottom: 16,
    },
    noResultsTitle: {
        fontSize: 20,
        marginBottom: 8,
        textAlign: 'center',
        opacity: 0.85,
        fontWeight: '600',
    },
    noResultsSubtitle: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 20,
        opacity: 0.8,
    },
    noResultsClearButton: {
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 28,
        marginTop: 8,
        alignItems: 'center',
    },
});
