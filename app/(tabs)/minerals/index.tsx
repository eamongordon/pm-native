import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, TextInput, View } from 'react-native';

export default function HomeScreen() {
    const [minerals, setMinerals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchMinerals = async (nameFilter: string = '') => {
        setLoading(true);
        let url = 'https://corsproxy.io/?url=https://www.prospectorminerals.com/api/minerals';
        if (nameFilter) {
            const filter = encodeURIComponent(JSON.stringify({ name: nameFilter }));
            url += `?filter=${filter}`;
        }
        try {
            const res = await fetch(url);
            const data = await res.json();
            setMinerals(data.results);
        } catch {
            setMinerals([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMinerals();
    }, []);

    useEffect(() => {
        // Debounce search input
        const timeout = setTimeout(() => {
            fetchMinerals(search);
        }, 300);
        return () => clearTimeout(timeout);
    }, [search]);

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        >
            <View style={styles.container}>
                <ThemedText>Minerals</ThemedText>
                <TextInput
                    style={styles.searchBar}
                    placeholder="Search minerals..."
                    value={search}
                    onChangeText={setSearch}
                    autoCapitalize="none"
                    autoCorrect={false}
                    clearButtonMode="while-editing"
                />
                {loading ? (
                    <ActivityIndicator />
                ) : minerals.length === 0 ? (
                    <ThemedText>No minerals found</ThemedText>
                ) : (
                    <FlatList
                        data={minerals}
                        keyExtractor={(item) => item.id?.toString() ?? item.name}
                        style={{ alignSelf: 'stretch' }}
                        contentContainerStyle={{ paddingBottom: 16 }}
                        renderItem={({ item }) => (
                            <Link href={`/minerals/${item.id}`} asChild>
                                <View style={styles.itemRow}>
                                    <Image
                                        source={{ uri: item.photos[0].photo.image || 'https://via.placeholder.com/60' }}
                                        style={styles.itemImage}
                                    />
                                    <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                                </View>
                            </Link>
                        )}
                        ItemSeparatorComponent={() => <View style={styles.divider} />}
                    />
                )}
            </View>
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    searchBar: {
        height: 40,
        borderColor: '#e0e0e0',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        margin: 16,
        backgroundColor: '#fff',
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        marginVertical: 4,
        alignSelf: 'stretch',
    },
    itemImage: {
        width: 100,
        height: 66.67,
        borderRadius: 8,
        marginRight: 16,
    },
    itemName: {
        fontSize: 18,
        flexShrink: 1,
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
    },
});