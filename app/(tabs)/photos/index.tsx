import Select from '@/components/Select';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Platform, SafeAreaView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const SORT_OPTIONS = [
    { label: 'Default', value: 'default' },
    { label: 'A-Z', value: 'name-asc' },
    { label: 'Z-A', value: 'name-desc' },
];

export default function PhotosScreen() {
    const [photos, setPhotos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [cursor, setCursor] = useState<string | null>(null);
    const [sort, setSort] = useState<{ property: string, sort: 'asc' | 'desc' } | null>(null);
    const [search, setSearch] = useState('');
    const colorScheme = useColorScheme() ?? 'light';
    const LIMIT = 20;

    const buildFilterObj = () => {
        let filterObj: Record<string, any> = {};
        if (search) filterObj.name = search;
        return filterObj;
    };

    type FetchPhotosArgs = {
        append?: boolean;
        cursorParam?: string | null;
        signal?: AbortSignal;
    };

    const fetchPhotos = async ({
        append = false,
        cursorParam = null,
        signal
    }: FetchPhotosArgs = {}) => {
        if (append) setIsFetchingMore(true);
        else setLoading(true);

        let url = `https://www.prospectorminerals.com/api/photos?limit=${LIMIT}`;
        const filterObj = buildFilterObj();
        const params: Record<string, string> = {};
        if (cursorParam) params.cursor = cursorParam;
        if (Object.keys(filterObj).length > 0) params.filter = JSON.stringify(filterObj);
        if (sort && sort.property !== 'default') {
            params.sortBy = sort.property;
            params.sort = sort.sort;
        }

        const query = Object.entries(params)
            .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
            .join('&');
        if (query) url += `&${query}`;

        const finalUrl =
            Platform.OS === 'web'
                ? `https://corsproxy.io/?url=${encodeURIComponent(url)}`
                : url;

        try {
            const res = await fetch(finalUrl, { signal });
            const data = await res.json();
            if (append) {
                setPhotos((prev) => [...prev, ...((data.results as any[]) || [])]);
            } else {
                setPhotos((data.results as any[]) || []);
            }
            setCursor((data as any).next || null);
        } catch {
            if (!append) setPhotos([]);
        }
        setLoading(false);
        setIsFetchingMore(false);
    };

    useEffect(() => {
        const controller = new AbortController();
        setCursor(null);
        setPhotos([]);
        setLoading(true);
        const timeout = setTimeout(() => {
            fetchPhotos({ append: false, cursorParam: null, signal: controller.signal });
        }, 300);
        return () => {
            controller.abort();
            clearTimeout(timeout);
        };
        // eslint-disable-next-line
    }, [sort, search]);

    const handleEndReached = () => {
        if (!loading && !isFetchingMore && cursor) {
            fetchPhotos({ append: true, cursorParam: cursor });
        }
    };

    const handleSortChange = (value: string) => {
        if (value === 'default') setSort(null);
        else if (value === 'name-asc') setSort({ property: 'name', sort: 'asc' });
        else if (value === 'name-desc') setSort({ property: 'name', sort: 'desc' });
    };

    // Calculate image size for 2-column grid
    const screenWidth = Dimensions.get('window').width;
    const imageMargin = 8;
    const imageWidth = (screenWidth - 32 - imageMargin) / 2;

    return (
        <SafeAreaProvider>
            <ThemedView style={styles.container}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.content}>
                        <View style={{ paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderColor: colorScheme === "light" ? Colors.light.border : Colors.dark.border, gap: 8 }}>
                            <View style={[styles.searchBar, colorScheme === 'light' ? styles.searchBarLight : styles.searchBarDark]}>
                                {/* Magnifying Glass Icon */}
                                <Search size={20} style={{ marginRight: 8, opacity: 0.7 }} color={colorScheme === 'light' ? Colors.light.text : Colors.dark.text} />
                                <TextInput
                                    style={[styles.searchBarInput, colorScheme === 'light' ? styles.searchBarInputLight : styles.searchBarInputDark]}
                                    placeholder="Search photos..."
                                    placeholderTextColor={colorScheme === 'light' ? Colors.light.inputPlaceholder : Colors.dark.inputPlaceholder}
                                    value={search}
                                    onChangeText={setSearch}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    clearButtonMode="while-editing"
                                />
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <View style={styles.sortDropdownContainer}>
                                    <Select
                                        options={SORT_OPTIONS}
                                        selectedValue={
                                            !sort || sort.property === 'default'
                                                ? 'default'
                                                : sort.property === 'name' && sort.sort === 'asc'
                                                    ? 'name-asc'
                                                    : sort.property === 'name' && sort.sort === 'desc'
                                                        ? 'name-desc'
                                                        : 'default'
                                        }
                                        onValueChange={handleSortChange}
                                        placeholder="Sort"
                                        prefix="Sort: "
                                    />
                                </View>
                            </View>
                        </View>
                        <View style={{ flex: 1, paddingHorizontal: 16 }}>
                            {loading && photos.length === 0 ? (
                                <ActivityIndicator />
                            ) : photos.length === 0 ? (
                                <ThemedText>No photos found</ThemedText>
                            ) : (
                                <FlatList
                                    data={photos}
                                    keyExtractor={(item) => item.id}
                                    numColumns={2}
                                    columnWrapperStyle={{ gap: imageMargin }}
                                    contentContainerStyle={{ paddingBottom: 16, paddingTop: 8 }}
                                    renderItem={({ item }) => (
                                        <Link
                                            href={`/photos/${item.id}`}
                                            asChild
                                        >
                                            <TouchableOpacity style={{ flex: 1, marginBottom: imageMargin }}>
                                                <Image
                                                    style={{
                                                        width: imageWidth,
                                                        height: imageWidth,
                                                        borderRadius: 12,
                                                        backgroundColor: colorScheme === 'light' ? Colors.light.inputBackground : Colors.dark.inputBackground,
                                                    }}
                                                    source={{ uri: item.image }}
                                                    placeholder={{ uri: item.imageBlurhash }}
                                                    contentFit="cover"
                                                    transition={700}
                                                    placeholderContentFit="cover"
                                                />
                                            </TouchableOpacity>
                                        </Link>
                                    )}
                                    onEndReached={handleEndReached}
                                    ListFooterComponent={
                                        isFetchingMore ? <ActivityIndicator style={{ margin: 16 }} /> : null
                                    }
                                />
                            )}
                        </View>
                    </View>
                </SafeAreaView>
            </ThemedView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        overflow: 'hidden',
    },
    searchBar: {
        height: 48,
        borderColor: '#e0e0e0',
        borderRadius: 16,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchBarInput: {
        flex: 1,
        fontFamily: 'WorkSans_400Regular',
        height: 40,
    },
    searchBarInputLight: {
        color: Colors.light.inputText,
    },
    searchBarInputDark: {
        color: Colors.dark.inputText,
    },
    searchBarLight: {
        backgroundColor: Colors.light.inputBackground,
        color: Colors.light.inputText,
    },
    searchBarDark: {
        backgroundColor: Colors.dark.inputBackground,
        color: Colors.dark.inputText,
    },
    sortDropdownContainer: {
        overflow: 'hidden',
        flex: 1,
    },
});