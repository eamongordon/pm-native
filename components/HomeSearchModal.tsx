import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Image } from 'expo-image';
import { Search } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function HomeSearchModal() {
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const colorScheme = useColorScheme() ?? 'light';

    const handleSearch = async (query: string) => {
        if (!query) {
            setSearchResults([]);
            return;
        }
        setSearchLoading(true);
        try {
            const endpoints = [
                {
                    url: `https://www.prospectorminerals.com/api/minerals?limit=5&filter=${encodeURIComponent(JSON.stringify({ name: query }))}`,
                    type: 'mineral',
                    getId: (item: any) => item.id,
                    getName: (item: any) => item.name,
                    getImage: (item: any) => item.photos?.[0]?.photo?.image,
                    getBlurhash: (item: any) => item.photos?.[0]?.photo?.imageBlurhash,
                },
                {
                    url: `https://www.prospectorminerals.com/api/photos?limit=5&filter=${encodeURIComponent(JSON.stringify({ name: query }))}`,
                    type: 'photo',
                    getId: (item: any) => item.id,
                    getName: (item: any) => item.name,
                    getImage: (item: any) => item.image,
                    getBlurhash: (item: any) => item.imageBlurhash,
                },
                {
                    url: `https://www.prospectorminerals.com/api/articles?limit=5&filter=${encodeURIComponent(JSON.stringify({ title: query }))}`,
                    type: 'article',
                    getId: (item: any) => item.slug,
                    getName: (item: any) => item.title,
                    getImage: (item: any) => item.image,
                    getBlurhash: (item: any) => item.imageBlurhash,
                },
                {
                    url: `https://www.prospectorminerals.com/api/localities?limit=5&filter=${encodeURIComponent(JSON.stringify({ name: query }))}`,
                    type: 'locality',
                    getId: (item: any) => item.id,
                    getName: (item: any) => item.name,
                    getImage: (item: any) => item.image,
                    getBlurhash: (item: any) => item.imageBlurhash,
                },
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
                    return (data.results || []).map((item: any) => ({
                        id: ep.getId(item),
                        name: ep.getName(item),
                        image: ep.getImage(item),
                        blurhash: ep.getBlurhash(item),
                        type: ep.type,
                    }));
                })
            );
            setSearchResults(results.flat());
        } catch {
            setSearchResults([]);
        }
        setSearchLoading(false);
    };

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
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, colorScheme === 'light' ? styles.modalContentLight : styles.modalContentDark]}>
                        <View style={styles.modalHeader}>
                            <TextInput
                                style={[styles.modalSearchInput, colorScheme === 'light' ? styles.searchBarInputLight : styles.searchBarInputDark]}
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
                            <TouchableOpacity onPress={() => setSearchModalVisible(false)} style={styles.modalCloseButton}>
                                <ThemedText style={{ fontSize: 22 }}>×</ThemedText>
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 1 }}>
                            {searchLoading ? (
                                <ActivityIndicator style={{ marginTop: 32 }} />
                            ) : (
                                <FlatList
                                    data={searchResults}
                                    keyExtractor={item => `${item.type}-${item.id}`}
                                    renderItem={({ item }) => (
                                        <View style={styles.resultRow}>
                                            <Image
                                                source={{ uri: item.image }}
                                                style={styles.resultImage}
                                                placeholder={{ uri: item.blurhash }}
                                                contentFit="cover"
                                                transition={400}
                                                placeholderContentFit="cover"
                                            />
                                            <View style={{ flex: 1, marginLeft: 12 }}>
                                                <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                                                <ThemedText style={styles.resultType}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</ThemedText>
                                            </View>
                                        </View>
                                    )}
                                    ListEmptyComponent={
                                        searchQuery && !searchLoading ? (
                                            <ThemedText style={{ textAlign: 'center', marginTop: 32 }}>No results found</ThemedText>
                                        ) : null
                                    }
                                />
                            )}
                        </View>
                    </View>
                </View>
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
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 40,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        width: '100%',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 0,
        alignItems: 'stretch',
        minHeight: 300,
        maxHeight: '80%',
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
    modalSearchInput: {
        flex: 1,
        fontSize: 18,
        height: 40,
        fontFamily: 'WorkSans_400Regular',
    },
    modalCloseButton: {
        marginLeft: 12,
        minWidth: 32,
        alignItems: 'center',
        justifyContent: 'center',
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
});
