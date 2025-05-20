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
    { label: 'A-Z', value: 'title-asc' },
    { label: 'Z-A', value: 'title-desc' },
    { label: 'Newest', value: 'date-desc' },
    { label: 'Oldest', value: 'date-asc' },
];

export default function ArticlesScreen() {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [cursor, setCursor] = useState<string | null>(null);
    const [sort, setSort] = useState<{ property: string, sort: 'asc' | 'desc' } | null>(null);
    const [search, setSearch] = useState('');
    const colorScheme = useColorScheme() ?? 'light';
    const LIMIT = 20;

    const buildFilterObj = () => {
        let filterObj: Record<string, any> = {};
        if (search) filterObj.title = search;
        return filterObj;
    };

    type FetchArticlesArgs = {
        append?: boolean;
        cursorParam?: string | null;
        signal?: AbortSignal;
    };

    const fetchArticles = async ({
        append = false,
        cursorParam = null,
        signal
    }: FetchArticlesArgs = {}) => {
        if (append) setIsFetchingMore(true);
        else setLoading(true);

        let url = `https://www.prospectorminerals.com/api/articles?limit=${LIMIT}`;
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
                setArticles((prev) => [...prev, ...((data.results as any[]) || [])]);
            } else {
                setArticles((data.results as any[]) || []);
            }
            setCursor((data as any).next || null);
        } catch {
            if (!append) setArticles([]);
        }
        setLoading(false);
        setIsFetchingMore(false);
    };

    useEffect(() => {
        const controller = new AbortController();
        setCursor(null);
        setArticles([]);
        setLoading(true);
        const timeout = setTimeout(() => {
            fetchArticles({ append: false, cursorParam: null, signal: controller.signal });
        }, 300);
        return () => {
            controller.abort();
            clearTimeout(timeout);
        };
        // eslint-disable-next-line
    }, [sort, search]);

    const handleEndReached = () => {
        if (!loading && !isFetchingMore && cursor) {
            fetchArticles({ append: true, cursorParam: cursor });
        }
    };

    const handleSortChange = (value: string) => {
        if (value === 'default') setSort(null);
        else if (value === 'title-asc') setSort({ property: 'title', sort: 'asc' });
        else if (value === 'title-desc') setSort({ property: 'title', sort: 'desc' });
        else if (value === 'date-asc') setSort({ property: 'publishedAt', sort: 'asc' });
        else if (value === 'date-desc') setSort({ property: 'publishedAt', sort: 'desc' });
    };

    // Calculate image size for 1-column list
    const screenWidth = Dimensions.get('window').width;
    const imageWidth = screenWidth - 32;

    return (
        <SafeAreaProvider>
            <ThemedView style={styles.container}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.content}>
                        <View style={{ paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderColor: colorScheme === "light" ? Colors.light.border : Colors.dark.border, gap: 8 }}>
                            <View style={[styles.searchBar, colorScheme === 'light' ? styles.searchBarLight : styles.searchBarDark]}>
                                <Search size={20} style={{ marginRight: 8, opacity: 0.7 }} color={colorScheme === 'light' ? Colors.light.text : Colors.dark.text} />
                                <TextInput
                                    style={[styles.searchBarInput, colorScheme === 'light' ? styles.searchBarInputLight : styles.searchBarInputDark]}
                                    placeholder="Search articles..."
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
                                                : sort.property === 'title' && sort.sort === 'asc'
                                                    ? 'title-asc'
                                                    : sort.property === 'title' && sort.sort === 'desc'
                                                        ? 'title-desc'
                                                        : sort.property === 'publishedAt' && sort.sort === 'asc'
                                                            ? 'date-asc'
                                                            : sort.property === 'publishedAt' && sort.sort === 'desc'
                                                                ? 'date-desc'
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
                            {loading && articles.length === 0 ? (
                                <ActivityIndicator />
                            ) : articles.length === 0 ? (
                                <ThemedText>No articles found</ThemedText>
                            ) : (
                                <FlatList
                                    data={articles}
                                    keyExtractor={(item) => item.slug}
                                    contentContainerStyle={{ paddingBottom: 16 }}
                                    renderItem={({ item }) => (
                                        <Link
                                            href={`/articles/${item.slug}`}
                                            asChild
                                        >
                                            <TouchableOpacity style={styles.articleCard}>
                                                <Image
                                                    style={{
                                                        width: imageWidth,
                                                        height: 180,
                                                        borderRadius: 8,
                                                        backgroundColor: colorScheme === 'light' ? Colors.light.inputBackground : Colors.dark.inputBackground,
                                                    }}
                                                    source={{ uri: item.image }}
                                                    placeholder={{ uri: item.imageBlurhash }}
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
                                    onEndReached={handleEndReached}
                                    ListFooterComponent={
                                        isFetchingMore ? <ActivityIndicator style={{ margin: 16 }} /> : null
                                    }
                                    style={{ paddingTop: 8 }}
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
        borderRadius: 24,
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
        flex: 1,
        overflow: 'hidden',
    },
    articleCard: {
        marginBottom: 20,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: 'transparent',
    },
});