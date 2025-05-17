import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, Image, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const LUSTER_OPTIONS = [
    'Silky', 'Vitreous', 'Waxy', 'Submetallic', 'Metallic',
    'Resinous', 'Pearly', 'Greasy', 'Dull', 'Adamantine'
];

export default function HomeScreen() {
    const [minerals, setMinerals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [hardnessRange, setHardnessRange] = useState<[number, number]>([1, 10]);
    const [lusters, setLusters] = useState<string[]>([]);

    const fetchMinerals = async (nameFilter: string = '', hardness: [number, number] = [1, 10], lustersArr: string[] = []) => {
        setLoading(true);
        let url = 'https://corsproxy.io/?url=https://www.prospectorminerals.com/api/minerals';
        let filterObj: any = {};
        if (nameFilter) filterObj.name = nameFilter;
        if (hardness && (hardness[0] !== 1 || hardness[1] !== 10)) {
            filterObj.minHardness = hardness[0];
            filterObj.maxHardness = hardness[1];
        }
        if (lustersArr.length > 0) {
            filterObj.lusters = lustersArr;
        }
        if (Object.keys(filterObj).length > 0) {
            const filter = encodeURIComponent(JSON.stringify(filterObj));
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
            fetchMinerals(search, hardnessRange, lusters);
        }, 300);
        return () => clearTimeout(timeout);
    }, [search, hardnessRange, lusters]);

    // Checkbox toggle handler
    const toggleLuster = (luster: string) => {
        setLusters((prev) =>
            prev.includes(luster)
                ? prev.filter((l) => l !== luster)
                : [...prev, luster]
        );
    };

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        >
            <View style={styles.container}>
                <ThemedText>Minerals</ThemedText>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 16 }}>
                    <TextInput
                        style={[styles.searchBar, { flex: 1 }]}
                        placeholder="Search minerals..."
                        value={search}
                        onChangeText={setSearch}
                        autoCapitalize="none"
                        autoCorrect={false}
                        clearButtonMode="while-editing"
                    />
                    <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.filterButton}>
                        <Text style={{ fontSize: 16 }}>More Filters</Text>
                    </TouchableOpacity>
                </View>
                <Modal
                    visible={modalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <ThemedText style={{ fontWeight: 'bold', fontSize: 18 }}>More Filters</ThemedText>
                            {/* Hardness Range Slider */}
                            <View style={{ marginTop: 24 }}>
                                <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Hardness Range</Text>
                                <MultiSlider
                                    values={hardnessRange}
                                    min={1}
                                    max={10}
                                    step={1}
                                    onValuesChange={(values) => setHardnessRange([values[0], values[1]] as [number, number])}
                                    allowOverlap={false}
                                    snapped
                                    containerStyle={{ marginHorizontal: 10 }}
                                />
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                                    <Text>Min: {hardnessRange[0]}</Text>
                                    <Text>Max: {hardnessRange[1]}</Text>
                                </View>
                            </View>
                            {/* Luster Checkboxes */}
                            <View style={{ marginTop: 24 }}>
                                <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Lusters</Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                    {LUSTER_OPTIONS.map((luster) => (
                                        <Pressable
                                            key={luster}
                                            onPress={() => toggleLuster(luster)}
                                            style={[
                                                styles.checkboxRow,
                                                lusters.includes(luster) && styles.checkboxRowSelected
                                            ]}
                                        >
                                            <View style={[
                                                styles.checkbox,
                                                lusters.includes(luster) && styles.checkboxChecked
                                            ]}>
                                                {lusters.includes(luster) && <View style={styles.checkboxDot} />}
                                            </View>
                                            <Text style={{ marginLeft: 8 }}>{luster}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
                                <Button title="Cancel" onPress={() => setModalVisible(false)} />
                                <View style={{ width: 8 }} />
                                <Button title="Apply" onPress={() => setModalVisible(false)} />
                            </View>
                        </View>
                    </View>
                </Modal>
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
    filterButton: {
        marginLeft: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#e0e0e0',
        borderRadius: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end', // changed from 'center'
        alignItems: 'stretch',      // changed from 'center'
    },
    modalContent: {
        width: '100%',              // changed from '80%'
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,    // changed for bottom sheet effect
        borderTopRightRadius: 16,   // changed for bottom sheet effect
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        padding: 24,
        alignItems: 'stretch',
        minHeight: 200,             // optional: ensures some height
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 8,
        marginTop: 16,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        marginBottom: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        backgroundColor: '#fff',
    },
    checkboxRowSelected: {
        backgroundColor: '#e0f7fa',
        borderColor: '#26c6da',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#aaa',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    checkboxChecked: {
        borderColor: '#26c6da',
        backgroundColor: '#b2ebf2',
    },
    checkboxDot: {
        width: 12,
        height: 12,
        borderRadius: 2,
        backgroundColor: '#26c6da',
    },
});