import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

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
                <Text>Minerals</Text>
                <FlatList
                    data={minerals}
                    keyExtractor={(item) => item.id?.toString() ?? item.name}
                    renderItem={({ item }) => (
                        <Link href={`/minerals/${item.id}`}>
                            <Text>{item.name}</Text>
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
        alignItems: 'center',
    },
});