import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, View } from 'react-native';

export default function HomeScreen() {
    const [minerals, setMinerals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('https://corsproxy.io/?url=https://www.prospectorminerals.com/api/minerals')
            .then(res => res.json())
            .then(data => {
                console.log('Minerals:', data);
                setMinerals(data.results);
                setLoading(false);
            })
            .catch(() => setLoading(false));
        console.log('Fetching minerals...');
    }, []);

    if (loading) {
        return (
            <ParallaxScrollView
                headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
            >
                <View style={styles.container}>
                    <ActivityIndicator />
                </View>
            </ParallaxScrollView>
        );
    }

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        >
            <View style={styles.container}>
                <ThemedText>Minerals</ThemedText>
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
                />
            </View>
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        marginVertical: 4,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
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
});