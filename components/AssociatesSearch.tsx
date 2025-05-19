import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Image } from 'expo-image';
import { Search, X } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedIcon } from './ThemedIcon';
import { ThemedText } from './ThemedText';

type Mineral = {
    id: string;
    name: string;
    slug: string;
    photos?: { photo: { image: string, imageBlurhash?: string } }[];
};

type ChipInputProps = {
    selected: Mineral[];
    onChange: (minerals: Mineral[]) => void;
};

export default function AssociatesSearch({ selected, onChange }: ChipInputProps) {
    const [input, setInput] = useState('');
    const [minerals, setMinerals] = useState<Mineral[]>([]);
    const [loading, setLoading] = useState(false);
    const [cursor, setCursor] = useState<string | null>(null);
    const [fetchingMore, setFetchingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<TextInput>(null);
    const abortRef = useRef<AbortController | null>(null);
    const colorScheme = useColorScheme() ?? 'light';

    // Fetch minerals with optional search and cursor
    const fetchMinerals = async (opts?: { append?: boolean; cursor?: string | null; search?: string }) => {
        if (loading || fetchingMore) return;
        const isAppend = opts?.append;
        if (isAppend) setFetchingMore(true);
        else setLoading(true);

        let url = `https://www.prospectorminerals.com/api/minerals?limit=20`;
        const params: Record<string, string> = {};
        if (opts?.cursor) params.cursor = opts.cursor;
        if (opts?.search) params.filter = JSON.stringify({ name: opts.search });
        const query = Object.entries(params)
            .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
            .join('&');
        if (query) url += `&${query}`;
        if (Platform.OS === 'web') {
            url = `https://corsproxy.io/?url=${encodeURIComponent(url)}`;
        }

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const res = await fetch(url, { signal: controller.signal });
            const data = await res.json();
            if (isAppend) {
                setMinerals(prev => [...prev, ...(data.results || [])]);
            } else {
                setMinerals(data.results || []);
            }
            setCursor(data.next || null);
            setHasMore(!!data.next);
        } catch {
            if (!isAppend) setMinerals([]);
        }
        setLoading(false);
        setFetchingMore(false);
    };

    // Initial and input-based fetch
    useEffect(() => {
        setCursor(null);
        setHasMore(true);
        fetchMinerals({ append: false, search: input });
        // Cleanup on unmount
        return () => abortRef.current?.abort();
    }, [input]);

    // Filter out already selected minerals
    const filtered = useMemo(
        () => minerals.filter(m => !selected.some(sel => sel.id === m.id)),
        [minerals, selected]
    );

    const handleAdd = (mineral: Mineral) => {
        // Add mineral first, then drop focus after state update
        console.log('Adding mineral:', mineral);
        onChange([...selected, mineral]);
        setInput('');
        setFocused(false);
        inputRef.current?.blur();
    };

    const handleRemove = (mineral: Mineral) => {
        onChange(selected.filter(m => m.id !== mineral.id));
    };

    const handleEndReached = () => {
        if (hasMore && !fetchingMore && cursor) {
            fetchMinerals({ append: true, cursor, search: input });
        }
    };

    return (
        <View>
            <View style={[styles.container, colorScheme === 'light' ? styles.containerLight : styles.containerDark]}>
                <View style={[styles.searchBar, colorScheme === 'light' ? styles.searchBarLight : styles.searchBarDark]}>
                    {/* Magnifying Glass Icon */}
                    <ThemedIcon
                        Icon={Search}
                        size={20}
                        style={{ marginRight: 8, opacity: 0.7 }}
                    />
                    <TextInput
                        ref={inputRef}
                        style={[styles.searchBarInput, colorScheme === 'light' ? styles.searchBarInputLight : styles.searchBarInputDark]}
                        placeholder='Try "Malachite"'
                        placeholderTextColor={colorScheme === 'light' ? Colors.light.inputPlaceholder : Colors.dark.inputPlaceholder}
                        value={input}
                        onChangeText={setInput}
                        autoCapitalize="none"
                        autoCorrect={false}
                        clearButtonMode="while-editing"
                        onFocus={() => setFocused(true)}
                    />
                </View>
                <View style={[styles.chipsWrap, selected.length === 0 && { display: "none" }]}>
                    {selected.map(mineral => (
                        <View key={mineral.id} style={[styles.chip, colorScheme === 'light' ? styles.chipLight : styles.chipDark]}>
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
                            <Text style={styles.chipText}>{mineral.name}</Text>
                            <TouchableOpacity onPress={() => handleRemove(mineral)} style={[styles.removeBtnContainer, colorScheme === 'light' ? styles.removeBtnContainerLight : styles.removeBtnContainerDark]}>
                                <ThemedIcon
                                    Icon={X}
                                    size={10}
                                    iconProps={
                                        { strokeWidth: 3 }
                                    }
                                    color={colorScheme === 'light' ? Colors.dark.text : Colors.light.text}
                                />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </View>
            {focused && (input.length > 0 || minerals.length > 0) && (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item.id}
                    style={styles.dropdown}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.dropdownItem}
                            onPress={() => handleAdd(item)}
                            activeOpacity={0.7}
                        >
                            {item.photos && item.photos[0]?.photo?.image && (
                                <Image
                                    source={{ uri: item.photos[0].photo.image }}
                                    placeholder={item.photos[0].photo.imageBlurhash ? { uri: item.photos[0].photo.imageBlurhash } : undefined}
                                    contentFit="cover"
                                    placeholderContentFit="cover"
                                    transition={700}
                                    style={styles.dropdownImage}
                                />
                            )}
                            <ThemedText style={styles.dropdownText}>{item.name}</ThemedText>
                        </TouchableOpacity>
                    )}
                    ListFooterComponent={
                        fetchingMore ? <ActivityIndicator style={{ margin: 8 }} /> : null
                    }
                    onEndReached={handleEndReached}
                    onEndReachedThreshold={0.5}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 8,
        marginBottom: 2,
    },
    containerLight: {
        backgroundColor: Colors.light.inputBackground,
    },
    containerDark: {
        backgroundColor: Colors.dark.inputBackground,
    },
    searchBar: {
        height: 40,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchBarLight: {
        backgroundColor: Colors.light.inputBackground,
        color: Colors.light.inputText,
    },
    searchBarDark: {
        backgroundColor: Colors.dark.inputBackground,
        color: Colors.dark.inputText,
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
    dropdown: {
        maxHeight: 180,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#fff',
        marginBottom: 8,
        // Add shadow for iOS and elevation for Android
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderBottomColor: '#eee',
    },
    dropdownImage: {
        width: 28,
        height: 28,
        borderRadius: 14,
        marginRight: 8,
        backgroundColor: '#ddd',
    },
    dropdownText: {
        fontSize: 16,
        color: '#333',
    },
    chipsWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 4,
        marginHorizontal: 12,
        marginBottom: 8,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        paddingVertical: 4,
        paddingHorizontal: 10,
    },
    chipLight: {
        backgroundColor: 'rgba(212,212,216,0.6)', // 80% opaque white
    },
    chipDark: {
        backgroundColor: 'rgba(82,82,91,0.6)', // 70% opaque dark
    },
    chipImage: {
        width: 22,
        height: 22,
        borderRadius: 11,
        marginRight: 6,
        backgroundColor: '#ddd',
    },
    chipText: {
        fontSize: 15,
        color: '#333',
        marginRight: 4,
    },
    removeBtnContainer: {
        padding: 3,
        borderRadius: 100,
        opacity: 0.8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        aspectRatio: 1,
        marginLeft: 2,
        marginRight: -2,
        paddingHorizontal: 2,
    },
    removeBtnContainerLight: {
        backgroundColor: Colors.dark.primary,
    },
    removeBtnContainerDark: {
        backgroundColor: Colors.light.primary,
    },
});
