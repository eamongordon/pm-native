import Select from '@/components/Select';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { Link } from 'expo-router';
import { SlidersHorizontal } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, Image, Modal, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemedIcon } from '../../../components/ThemedIcon';

const LUSTER_OPTIONS = [
    'Silky', 'Vitreous', 'Waxy', 'Submetallic', 'Metallic',
    'Resinous', 'Pearly', 'Greasy', 'Dull', 'Adamantine'
];
const MINERAL_CLASS_OPTIONS = [
    'Silicates', 'Phosphates', 'Carbonates', 'Sulfates',
    'Sulfides', 'Halides', 'Oxides', 'Native Elements'
];
const CRYSTAL_SYSTEM_OPTIONS = [
    'Tetragonal', 'Isometric', 'Hexagonal', 'Triclinic',
    'Monoclinic', 'Trigonal', 'Orthorhombic'
];

const SORT_OPTIONS = [
    { label: 'Sort: Default', value: 'default' },
    { label: 'A-Z', value: 'name-asc' },
    { label: 'Z-A', value: 'name-desc' },
];

export default function HomeScreen() {
    const [minerals, setMinerals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [search, setSearch] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [hardnessRange, setHardnessRange] = useState<[number, number]>([1, 10]);
    const [lusters, setLusters] = useState<string[]>([]);
    const [mineralClass, setMineralClass] = useState<string[]>([]);
    const [crystalSystems, setCrystalSystems] = useState<string[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [sort, setSort] = useState<{ property: string, sort: 'asc' | 'desc' } | null>(null);
    const colorScheme = useColorScheme() ?? 'light';
    const LIMIT = 10;

    const buildFilterObj = () => {
        let filterObj: Record<string, any> = {};
        if (search) filterObj.name = search;
        if (hardnessRange && (hardnessRange[0] !== 1 || hardnessRange[1] !== 10)) {
            filterObj.minHardness = hardnessRange[0];
            filterObj.maxHardness = hardnessRange[1];
        }
        if (lusters.length > 0) filterObj.lusters = lusters;
        if (mineralClass.length > 0) filterObj.mineralClass = mineralClass;
        if (crystalSystems.length > 0) filterObj.crystalSystems = crystalSystems;
        // Add sort if not default
        if (sort && sort.property !== 'default') {
            filterObj.sort = sort;
        }
        return filterObj;
    };

    type FetchMineralsArgs = {
        append?: boolean;
        cursorParam?: string | null;
        signal?: AbortSignal;
    };

    const fetchMinerals = async ({
        append = false,
        cursorParam = null,
        signal
    }: FetchMineralsArgs = {}) => {
        if (append) setIsFetchingMore(true);
        else setLoading(true);

        // Always add limit directly to the endpoint URL
        let url = `https://www.prospectorminerals.com/api/minerals?limit=${LIMIT}`;
        const filterObj = buildFilterObj();
        const params: Record<string, string> = {};
        if (cursorParam) params.cursor = cursorParam;
        if (Object.keys(filterObj).length > 0) params.filter = JSON.stringify(filterObj);

        const query = Object.entries(params)
            .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
            .join('&');
        if (query) url += `&${query}`;

        // Only use proxy in web
        const finalUrl =
            Platform.OS === 'web'
                ? `https://corsproxy.io/?url=${encodeURIComponent(url)}`
                : url;

        try {
            const res = await fetch(finalUrl, { signal });
            const data = await res.json();
            if (append) {
                setMinerals((prev) => [...prev, ...((data.results as any[]) || [])]);
            } else {
                setMinerals((data.results as any[]) || []);
            }
            setCursor((data as any).next || null);
        } catch {
            if (!append) setMinerals([]);
        }
        setLoading(false);
        setIsFetchingMore(false);
    };

    // Reset minerals and cursor when filters/search change
    useEffect(() => {
        const controller = new AbortController();
        setCursor(null);
        setMinerals([]);
        setLoading(true);
        const timeout = setTimeout(() => {
            fetchMinerals({ append: false, cursorParam: cursor, signal: controller.signal });
        }, 300);
        return () => {
            controller.abort();
            clearTimeout(timeout);
        };
        // eslint-disable-next-line
    }, [search, hardnessRange, lusters, mineralClass, crystalSystems, sort]);

    // Checkbox toggle handler
    const toggleLuster = (luster: string) => {
        setLusters((prev: string[]) =>
            prev.includes(luster)
                ? prev.filter((l) => l !== luster)
                : [...prev, luster]
        );
    };
    const toggleMineralClass = (cls: string) => {
        setMineralClass((prev: string[]) =>
            prev.includes(cls)
                ? prev.filter((c) => c !== cls)
                : [...prev, cls]
        );
    };
    const toggleCrystalSystem = (sys: string) => {
        setCrystalSystems((prev: string[]) =>
            prev.includes(sys)
                ? prev.filter((c) => c !== sys)
                : [...prev, sys]
        );
    };

    const handleEndReached = () => {
        if (!loading && !isFetchingMore && cursor) {
            console.log('Fetching more minerals...');
            fetchMinerals({ append: true, cursorParam: cursor });
        }
    };

    // Helper for menu label
    const getSortLabel = () => {
        if (!sort || sort.property === 'default') return 'Sort: Default';
        if (sort.property === 'name' && sort.sort === 'asc') return 'A-Z';
        if (sort.property === 'name' && sort.sort === 'desc') return 'Z-A';
        return 'Sort';
    };

    // Add a handler for Select value change
    const handleSortChange = (value: string) => {
        if (value === 'default') setSort(null);
        else if (value === 'name-asc') setSort({ property: 'name', sort: 'asc' });
        else if (value === 'name-desc') setSort({ property: 'name', sort: 'desc' });
    };

    return (
        <SafeAreaProvider>
            <ThemedView style={styles.container}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.content}>
                        <View style={{ paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderColor: colorScheme === "light" ? Colors.light.border : Colors.dark.border, display: 'flex', gap: 8 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TextInput
                                    style={[
                                        styles.searchBar,
                                        { flex: 1, fontFamily: 'WorkSans_400Regular' },
                                        colorScheme === 'light' ? styles.searchBarLight : styles.searchBarDark
                                    ]}
                                    placeholder="Search minerals..."
                                    placeholderTextColor={colorScheme === 'light' ? Colors.light.inputPlaceholder : Colors.dark.inputPlaceholder}
                                    value={search}
                                    onChangeText={setSearch}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    clearButtonMode="while-editing"
                                />
                            </View>
                            {/* Filter and Sort below search bar */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <TouchableOpacity
                                    onPress={() => setModalVisible(true)}
                                    style={[styles.filterButton, colorScheme === 'light' ? styles.filterButtonLight : styles.filterButtonDark]}
                                >
                                    <ThemedIcon
                                        Icon={SlidersHorizontal}
                                        size={18}
                                        style={{ marginRight: 6 }}
                                    />
                                    <ThemedText style={{ fontSize: 14 }}>Filter</ThemedText>
                                </TouchableOpacity>
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
                                    />
                                </View>
                            </View>
                        </View>
                        {/* Modal for filters */}
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
                                    {/* Mineral Class Checkboxes */}
                                    <View style={{ marginTop: 24 }}>
                                        <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Mineral Class</Text>
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                            {MINERAL_CLASS_OPTIONS.map((cls) => (
                                                <Pressable
                                                    key={cls}
                                                    onPress={() => toggleMineralClass(cls)}
                                                    style={[
                                                        styles.checkboxRow,
                                                        mineralClass.includes(cls) && styles.checkboxRowSelected
                                                    ]}
                                                >
                                                    <View style={[
                                                        styles.checkbox,
                                                        mineralClass.includes(cls) && styles.checkboxChecked
                                                    ]}>
                                                        {mineralClass.includes(cls) && <View style={styles.checkboxDot} />}
                                                    </View>
                                                    <Text style={{ marginLeft: 8 }}>{cls}</Text>
                                                </Pressable>
                                            ))}
                                        </View>
                                    </View>
                                    {/* Crystal Systems Checkboxes */}
                                    <View style={{ marginTop: 24 }}>
                                        <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Crystal Systems</Text>
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                            {CRYSTAL_SYSTEM_OPTIONS.map((sys) => (
                                                <Pressable
                                                    key={sys}
                                                    onPress={() => toggleCrystalSystem(sys)}
                                                    style={[
                                                        styles.checkboxRow,
                                                        crystalSystems.includes(sys) && styles.checkboxRowSelected
                                                    ]}
                                                >
                                                    <View style={[
                                                        styles.checkbox,
                                                        crystalSystems.includes(sys) && styles.checkboxChecked
                                                    ]}>
                                                        {crystalSystems.includes(sys) && <View style={styles.checkboxDot} />}
                                                    </View>
                                                    <Text style={{ marginLeft: 8 }}>{sys}</Text>
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
                        <View style={{ flex: 1, paddingHorizontal: 16 }}>
                            {loading && minerals.length === 0 ? (
                                <ActivityIndicator />
                            ) : minerals.length === 0 ? (
                                <ThemedText>No minerals found</ThemedText>
                            ) : (
                                <FlatList
                                    data={minerals}
                                    keyExtractor={(item) => item.id}
                                    style={{ alignSelf: 'stretch', flex: 1 }}
                                    contentContainerStyle={{ paddingBottom: 16 }}
                                    renderItem={({ item }) => (
                                        <Link href={`/minerals/${item.id}`} asChild>
                                            <View style={styles.itemRow}>
                                                <Image
                                                    source={{ uri: (item.photos && item.photos[0]?.photo?.image) || 'https://via.placeholder.com/60' }}
                                                    style={styles.itemImage}
                                                />
                                                <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                                            </View>
                                        </Link>
                                    )}
                                    ItemSeparatorComponent={() => <View style={[styles.divider, colorScheme === "light" ? styles.dividerLight : styles.dividerDark]} />}
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
        height: 40,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
    },
    searchBarLight: {
        backgroundColor: Colors.light.inputBackground,
        color: Colors.light.inputText,
    },
    searchBarDark: {
        backgroundColor: Colors.dark.inputBackground,
        color: Colors.dark.inputText,
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
    },
    dividerLight: {
        backgroundColor: Colors.light.border,
    },
    dividerDark: {
        backgroundColor: Colors.dark.border,
    },
    filterButton: {
        marginTop: 0,
        marginLeft: 0,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        height: 40,
    },
    filterButtonLight: {
        borderColor: Colors.light.border,
    },
    filterButtonDark: {
        borderColor: Colors.dark.border,
    },
    sortDropdownContainer: {
        overflow: 'hidden',
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
    sortMenuTrigger: {
        height: 40,
        borderColor: '#e0e0e0',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
});