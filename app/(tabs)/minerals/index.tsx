import AssociatesSearch from '@/components/AssociatesSearch';
import { CheckboxGroup } from '@/components/CheckboxGroup';
import { Collapsible } from '@/components/Collapsible';
import Select from '@/components/Select';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Link } from 'expo-router';
import { Camera, Search, SlidersHorizontal } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
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
    const [associateMinerals, setAssociateMinerals] = useState<any[]>([]);
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
        filterObj.associates = associateMinerals.map((m: any) => m.name);
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
    }, [search, hardnessRange, lusters, mineralClass, crystalSystems, associateMinerals, sort]);

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

    const handlePickImage = async () => {
        // Ask for permission if needed
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Permission to access media library is required!');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 1,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            // setSelectedImage(uri); // If you want to store it
            // ...do something with the image uri...
        }
    };

    return (
        <SafeAreaProvider>
            <ThemedView style={styles.container}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.content}>
                        <View style={{ paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderColor: colorScheme === "light" ? Colors.light.border : Colors.dark.border, display: 'flex', gap: 8 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ flex: 1 }}>
                                    <View style={[styles.searchBar, colorScheme === 'light' ? styles.searchBarLight : styles.searchBarDark]}>
                                        {/* Magnifying Glass Icon */}
                                        <ThemedIcon
                                            Icon={Search}
                                            size={20}
                                            style={{ marginRight: 8, opacity: 0.7 }}
                                        />
                                        <TextInput
                                            style={[styles.searchBarInput, colorScheme === 'light' ? styles.searchBarInputLight : styles.searchBarInputDark]}
                                            placeholder="Search minerals..."
                                            placeholderTextColor={colorScheme === 'light' ? Colors.light.inputPlaceholder : Colors.dark.inputPlaceholder}
                                            value={search}
                                            onChangeText={setSearch}
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            clearButtonMode="while-editing"
                                        />
                                        <TouchableOpacity onPress={handlePickImage}>
                                            <ThemedIcon
                                                Icon={Camera}
                                                size={20}
                                                style={{ marginRight: 8 }}
                                                lightColor={Colors.light.text}
                                                darkColor={Colors.dark.text}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
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
                                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                                    <View style={{ flex: 1 }} />
                                </TouchableWithoutFeedback>
                                <View
                                    style={[
                                        styles.modalContent,
                                        colorScheme === 'light' ? styles.modalContentLight : styles.modalContentDark
                                    ]}
                                >
                                    {/* Sticky Modal Header */}
                                    <View style={[
                                        styles.modalHeader,
                                        colorScheme === 'light' ? styles.modalHeaderLight : styles.modalHeaderDark
                                    ]}>
                                        <TouchableOpacity
                                            onPress={() => setModalVisible(false)}
                                            style={styles.modalHeaderButton}
                                            accessibilityLabel="Close"
                                        >
                                            <ThemedText style={{ fontSize: 22, color: colorScheme === 'light' ? Colors.light.text : Colors.dark.text }}>×</ThemedText>
                                        </TouchableOpacity>
                                        <ThemedText style={[
                                            styles.modalHeaderTitle,
                                            { color: colorScheme === 'light' ? Colors.light.text : Colors.dark.text }
                                        ]}>Filters</ThemedText>
                                        <TouchableOpacity
                                            onPress={() => {
                                                setHardnessRange([1, 10]);
                                                setLusters([]);
                                                setMineralClass([]);
                                                setCrystalSystems([]);
                                                setSort(null);
                                                setSearch('');
                                            }}
                                            style={styles.modalHeaderButton}
                                            accessibilityLabel="Reset"
                                        >
                                            <ThemedText type="defaultSemiBold">Reset</ThemedText>
                                        </TouchableOpacity>
                                    </View>
                                    {/* Scrollable Content */}
                                    <ScrollView
                                        contentContainerStyle={{
                                            flexGrow: 1,
                                            paddingBottom: 16,
                                            paddingHorizontal: 16,
                                            paddingTop: 16,
                                            rowGap: 16, // add vertical spacing between collapsibles
                                        }}
                                        showsVerticalScrollIndicator={false}
                                        style={{
                                            backgroundColor: colorScheme === 'light'
                                                ? Colors.light.background
                                                : Colors.dark.background
                                        }}
                                    >
                                        {/* Hardness Range Slider */}
                                        <Collapsible title="Hardness">
                                            <View
                                                style={{
                                                    marginTop: 8
                                                }}
                                            >
                                                <ThemedText
                                                    style={{
                                                        fontWeight: 'bold',
                                                        marginBottom: 8,
                                                        color: colorScheme === 'light'
                                                            ? Colors.light.text
                                                            : Colors.dark.text,
                                                    }}
                                                >
                                                    Hardness Range
                                                </ThemedText>
                                                <MultiSlider
                                                    values={hardnessRange}
                                                    min={1}
                                                    max={10}
                                                    step={1}
                                                    onValuesChange={(values) => setHardnessRange([values[0], values[1]] as [number, number])}
                                                    allowOverlap={false}
                                                    snapped
                                                    containerStyle={{ marginHorizontal: 10 }}
                                                    selectedStyle={{
                                                        backgroundColor: Colors[colorScheme].text,
                                                    }}
                                                    unselectedStyle={{
                                                        backgroundColor: colorScheme === 'light'
                                                            ? Colors.light.border
                                                            : Colors.dark.border,
                                                    }}
                                                    markerStyle={{
                                                        backgroundColor: colorScheme === 'light'
                                                            ? Colors.light.background
                                                            : Colors.dark.background,
                                                        borderColor: Colors[colorScheme].text,
                                                        borderWidth: 2,
                                                        width: 24,
                                                        height: 24,
                                                        shadowColor: 'transparent',
                                                    }}
                                                />
                                                <ThemedText style={{ color: colorScheme === 'light' ? Colors.light.text : Colors.dark.text }}>
                                                    {hardnessRange[0]} - {hardnessRange[1]}
                                                </ThemedText>
                                            </View>
                                        </Collapsible>
                                        {/* Luster Checkboxes */}
                                        <Collapsible title="Lusters">
                                            <View style={{ marginTop: 8 }}>
                                                <CheckboxGroup
                                                    options={LUSTER_OPTIONS}
                                                    selected={lusters}
                                                    onToggle={toggleLuster}
                                                />
                                            </View>
                                        </Collapsible>
                                        {/* Mineral Class Checkboxes */}
                                        <Collapsible title="Mineral Class">
                                            <View style={{ marginTop: 8 }}>
                                                <CheckboxGroup
                                                    options={MINERAL_CLASS_OPTIONS}
                                                    selected={mineralClass}
                                                    onToggle={toggleMineralClass}
                                                />
                                            </View>
                                        </Collapsible>
                                        {/* Crystal Systems Checkboxes */}
                                        <Collapsible title="Crystal Systems">
                                            <View style={{ marginTop: 8 }}>
                                                <CheckboxGroup
                                                    options={CRYSTAL_SYSTEM_OPTIONS}
                                                    selected={crystalSystems}
                                                    onToggle={toggleCrystalSystem}
                                                />
                                            </View>
                                        </Collapsible>
                                        {/* Associates Collapsible */}
                                        <Collapsible title="Associates">
                                            <AssociatesSearch
                                                selected={associateMinerals}
                                                onChange={setAssociateMinerals}
                                            />
                                        </Collapsible>
                                    </ScrollView>
                                    {/* Sticky Modal Footer */}
                                    <View style={[
                                        styles.modalFooter,
                                        colorScheme === 'light' ? styles.modalFooterLight : styles.modalFooterDark
                                    ]}>
                                        <TouchableOpacity
                                            style={[
                                                styles.showResultsButton,
                                                { backgroundColor: Colors[colorScheme].primary }
                                            ]}
                                            onPress={() => setModalVisible(false)}
                                        >
                                            <ThemedText>
                                                Show Results
                                            </ThemedText>
                                        </TouchableOpacity>
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
                                        <Link href={`/minerals/${item.slug}`} asChild>
                                            <TouchableOpacity>
                                                <View style={styles.itemRow}>
                                                    <Image
                                                        source={{ uri: (item.photos && item.photos[0]?.photo?.image) || 'https://via.placeholder.com/60' }}
                                                        style={styles.itemImage}
                                                        contentFit="cover"
                                                        placeholder={{ uri: item.photos && item.photos[0]?.photo?.imageBlurhash }}
                                                        placeholderContentFit="cover"
                                                        transition={700}
                                                    />
                                                    <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                                                </View>
                                            </TouchableOpacity>
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
        width: '100%',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        padding: 0,
        alignItems: 'stretch',
        minHeight: 200,
        maxHeight: '80%',
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
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        zIndex: 2,
    },
    modalHeaderLight: {
        backgroundColor: Colors.light.background,
        borderColor: Colors.light.border,
    },
    modalHeaderDark: {
        backgroundColor: Colors.dark.background,
        borderColor: Colors.dark.border,
    },
    modalHeaderButton: {
        minWidth: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalHeaderTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center',
        flex: 1,
    },
    modalFooter: {
        bottom: 0,
        padding: 20,
        borderTopWidth: StyleSheet.hairlineWidth,
        zIndex: 2,
    },
    modalFooterLight: {
        backgroundColor: Colors.light.background,
        borderColor: Colors.light.border,
    },
    modalFooterDark: {
        backgroundColor: Colors.dark.background,
        borderColor: Colors.dark.border,
    },
    showResultsButton: {
        borderRadius: 8,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
});