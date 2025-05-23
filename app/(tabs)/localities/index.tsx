import AssociatesSearch from '@/components/AssociatesSearch';
import Select from '@/components/Select';
import { ThemedIcon } from '@/components/ThemedIcon';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Image, useImage } from 'expo-image';
import * as Location from 'expo-location';
import { AppleMaps, GoogleMaps } from 'expo-maps';
import { Link } from 'expo-router';
import { List as ListIcon, LocateFixed, Search, SlidersHorizontal, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SORT_OPTIONS = [
    { label: 'Default', value: 'default' },
    { label: 'A-Z', value: 'name-asc' },
    { label: 'Z-A', value: 'name-desc' },
];

export default function LocalitiesScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const [localities, setLocalities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
    const [filters, setFilters] = useState({
        name: '',
        minerals: [] as any[],
        latitude: '',
        longitude: '',
        radius: '',
    });
    const [searchInput, setSearchInput] = useState('');
    const [sort, setSort] = useState<{ property: string, sort: 'asc' | 'desc' } | null>(null);

    const [fetchingLocation, setFetchingLocation] = useState(false);
    const [selectedLocality, setSelectedLocality] = useState<any | null>(null);
    const bottom = useBottomTabOverflow();

    // Debounce search input and update filters.search
    useEffect(() => {
        const timeout = setTimeout(() => {
            setFilters(f => ({ ...f, name: searchInput }));
        }, 300);
        return () => clearTimeout(timeout);
    }, [searchInput]);

    // Build filter object for API
    const buildFilterObj = () => {
        const obj: Record<string, any> = {};
        if (filters.name) obj.name = filters.name;
        if (filters.minerals.length > 0) obj.minerals = filters.minerals.map((m: any) => m.name);
        if (filters.latitude && filters.longitude && filters.radius) {
            obj.latitude = Number(filters.latitude);
            obj.longitude = Number(filters.longitude);
            obj.radius = Number(filters.radius);
        }
        return obj;
    };

    // Add handler for sort dropdown
    const handleSortChange = (value: string) => {
        if (value === 'default') setSort(null);
        else if (value === 'name-asc') setSort({ property: 'name', sort: 'asc' });
        else if (value === 'name-desc') setSort({ property: 'name', sort: 'desc' });
    };

    // Fetch localities from API
    const fetchLocalities = async () => {
        setLoading(true);
        setSelectedLocality(null);
        let url = 'https://www.prospectorminerals.com/api/localities?limit=100';
        const filterObj = buildFilterObj();
        const params: Record<string, string> = {};
        if (Object.keys(filterObj).length > 0) params.filter = JSON.stringify(filterObj);
        if (sort && sort.property !== 'default') {
            params.sortBy = sort.property;
            params.sort = sort.sort;
        }
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
            const res = await fetch(finalUrl);
            const data = await res.json();
            setLocalities(data.results || []);
        } catch {
            setLocalities([]);
        }
        setLoading(false);
    };

    // Refetch when filters or sort change
    useEffect(() => {
        fetchLocalities();
        // eslint-disable-next-line
    }, [filters, sort]);

    // Use current location for filter
    const handleUseCurrentLocation = async () => {
        setFetchingLocation(true);
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            alert('Permission to access location was denied');
            setFetchingLocation(false);
            return;
        }
        let loc = await Location.getCurrentPositionAsync({});
        setFilters(f => ({
            ...f,
            latitude: loc.coords.latitude.toString(),
            longitude: loc.coords.longitude.toString(),
        }));
        setFetchingLocation(false);
    };

    // Preload marker images for Apple Maps
    const singleKnown = useImage(require('@/assets/images/localities/PM-Single-Locality-Pin_Light.png'));
    const singleEstimated = useImage(require('@/assets/images/localities/PM-Single-Locality-Pin_Dark.png'));
    const groupKnown = useImage(require('@/assets/images/localities/PM-Group-Locality-Pin_Light.png'));
    const groupEstimated = useImage(require('@/assets/images/localities/PM-Group-Locality-Pin_Dark.png'));

    const { top } = useSafeAreaInsets();
    return (
        <ThemedView style={{ flex: 1 }}>
            {/* Header with filter, search, and view toggle */}
            <View style={[
                { paddingHorizontal: 16, paddingVertical: 8, marginTop: top },
                viewMode === "list" ? { borderBottomWidth: 1, borderColor: Colors[colorScheme].border } : { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
            ]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <View style={[styles.searchBar, colorScheme === 'light' ? styles.searchBarLight : styles.searchBarDark]}>
                        <Search size={20} color={Colors[colorScheme].text} style={{ marginRight: 8, opacity: 0.7 }} />
                        <TextInput
                            style={[styles.searchBarInput, colorScheme === 'light' ? styles.searchBarInputLight : styles.searchBarInputDark]}
                            placeholder="Search localities..."
                            placeholderTextColor={Colors[colorScheme].inputPlaceholder}
                            value={searchInput}
                            onChangeText={setSearchInput}
                            autoCapitalize="none"
                            autoCorrect={false}
                            clearButtonMode="while-editing"
                        />
                    </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        style={[styles.filterButton, colorScheme === 'light' ? styles.filterButtonLight : styles.filterButtonDark]}
                    >
                        <SlidersHorizontal size={18} style={{ marginRight: 6 }} color={Colors[colorScheme].text} />
                        <ThemedText style={{ fontSize: 14 }}>Filter</ThemedText>
                    </TouchableOpacity>
                    {viewMode === 'list' && (
                        <View style={{ marginLeft: 8, minWidth: 120 }}>
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
                    )}
                </View>
            </View>
            {/* Filter Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    style={styles.modalOverlay}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={{ flex: 1 }} />
                </TouchableOpacity>
                <View style={[
                    styles.modalContent,
                    colorScheme === 'light' ? styles.modalContentLight : styles.modalContentDark
                ]}>
                    <ScrollView contentContainerStyle={{ padding: 16 }}>
                        <ThemedText type="defaultSemiBold" style={{ fontSize: 18, marginBottom: 12 }}>Filters</ThemedText>
                        {/* Minerals filter */}
                        <ThemedText style={{ marginBottom: 6 }}>Minerals</ThemedText>
                        <AssociatesSearch
                            selected={filters.minerals}
                            onChange={minerals => setFilters(f => ({ ...f, minerals }))}
                        />
                        {/* Location filter */}
                        <ThemedText style={{ marginTop: 18, marginBottom: 6 }}>Location</ThemedText>
                        <View style={{ flexDirection: 'column', gap: 8, marginBottom: 8 }}>
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                <TextInput
                                    style={[styles.filterInput, colorScheme === 'light' ? styles.filterInputLight : styles.filterInputDark]}
                                    placeholder="Latitude"
                                    keyboardType="numeric"
                                    value={filters.latitude}
                                    placeholderTextColor={Colors[colorScheme].inputPlaceholder}
                                    onChangeText={v => setFilters(f => ({ ...f, latitude: v }))}
                                />
                                <TextInput
                                    style={[styles.filterInput, colorScheme === 'light' ? styles.filterInputLight : styles.filterInputDark]}
                                    placeholder="Longitude"
                                    keyboardType="numeric"
                                    value={filters.longitude}
                                    placeholderTextColor={Colors[colorScheme].inputPlaceholder}
                                    onChangeText={v => setFilters(f => ({ ...f, longitude: v }))}
                                />
                            </View>
                            <TextInput
                                style={[styles.filterInput, colorScheme === 'light' ? styles.filterInputLight : styles.filterInputDark]}
                                placeholder="Radius (km)"
                                placeholderTextColor={Colors[colorScheme].inputPlaceholder}
                                keyboardType="numeric"
                                value={filters.radius}
                                onChangeText={v => setFilters(f => ({ ...f, radius: v }))}
                            />
                            <TouchableOpacity
                                style={[styles.currentLocationButton, colorScheme === 'light' ? styles.currentLocationButtonLight : styles.currentLocationButtonDark]}
                                onPress={handleUseCurrentLocation}
                                disabled={fetchingLocation}
                            >
                                <LocateFixed size={18} color={Colors[colorScheme].text} />
                                <ThemedText style={{ marginLeft: 4, display: 'flex' }}>Use Current Location</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={[styles.showResultsButton, colorScheme === 'light' ? styles.showResultsButtonLight : styles.showResultsButtonDark]}
                            onPress={() => setModalVisible(false)}
                        >
                            <ThemedText>Show Results</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            {/* Main Content */}
            <View style={{ flex: 1 }}>
                {loading ? (
                    <ActivityIndicator style={{ marginTop: 40 }} />
                ) : viewMode === 'map' ? (
                    Platform.OS === 'ios' ? (
                        <AppleMaps.View
                            style={{ flex: 1 }}
                            uiSettings={{
                                myLocationButtonEnabled: false,
                            }}
                            markers={localities
                                .filter(loc => loc.latitude && loc.longitude)
                                .map(loc => ({
                                    coordinates: {
                                        latitude: Number(loc.latitude),
                                        longitude: Number(loc.longitude),
                                    },
                                    id: loc.id,
                                    systemImage: loc.coordinates_known ? 'mappin.and.ellipse' : 'mappin.and.ellipse.fill',
                                    tintColor: loc.type === 'Single' ? 'brown' : 'blue',
                                    onPress: () => setSelectedLocality(loc),
                                }))
                            }
                            onMarkerClick={(marker) => {
                                setSelectedLocality(localities.find(loc => loc.id === marker.id));
                            }}
                            onMapClick={() => setSelectedLocality(null)}
                        />
                    ) : (
                        <GoogleMaps.View
                            style={{ flex: 1 }}
                            markers={localities
                                .filter(loc => loc.latitude && loc.longitude)
                                .map(loc => ({
                                    id: loc.id,
                                    coordinate: {
                                        latitude: Number(loc.latitude),
                                        longitude: Number(loc.longitude),
                                    },
                                    icon: loc.type === 'Single'
                                        ? loc.coordinates_known
                                            ? singleKnown ?? undefined
                                            : singleEstimated ?? undefined
                                        : loc.coordinates_known
                                            ? groupKnown ?? undefined
                                            : groupEstimated ?? undefined,
                                    title: loc.name,
                                    description: loc.country,
                                }))
                            }
                            onMarkerClick={(marker) => {
                                setSelectedLocality(localities.find(loc => loc.id === marker.id));
                            }}
                            onMapClick={() => setSelectedLocality(null)}
                        />
                    )
                ) : (
                    <FlatList
                        data={localities}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ padding: 12 }}
                        renderItem={({ item }) => (
                            <Link href={`/localities/${item.slug}`} asChild>
                                <TouchableOpacity style={styles.listItem}>
                                    <Image
                                        source={{ uri: item.photos?.[0]?.image }}
                                        style={{ width: 80, height: "100%", borderTopLeftRadius: 12, borderBottomLeftRadius: 12, marginRight: 12 }}
                                        contentFit="cover"
                                        placeholder={{ uri: item.photos?.[0]?.imageBlurhash }}
                                        placeholderContentFit="cover"
                                        transition={700}
                                    />
                                    <View style={{ flex: 1, flexDirection: 'column', padding: 12 }}>
                                        <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                                        {item.latitude && item.longitude && (
                                            <View
                                                style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    marginTop: 4,
                                                }}
                                            >
                                                <Image
                                                    source={
                                                        item.type === "Single"
                                                            ? item.coordinates_known
                                                                ? require('@/assets/images/localities/PM-Single-Locality-Pin_Light.png')
                                                                : require('@/assets/images/localities/PM-Single-Locality-Pin_Dark.png')
                                                            : item.coordinates_known
                                                                ? require('@/assets/images/localities/PM-Group-Locality-Pin_Light.png')
                                                                : require('@/assets/images/localities/PM-Group-Locality-Pin_Dark.png')
                                                    }
                                                    style={{ width: 24, height: 24, marginBottom: 0, marginRight: 6 }}
                                                    contentFit="contain"
                                                    transition={1000}
                                                />
                                                <ThemedText style={{
                                                    fontSize: 12,
                                                    color: Colors[colorScheme].text,
                                                    opacity: 0.5,
                                                    lineHeight: 24,
                                                }}>
                                                    {item.latitude}, {item.longitude}
                                                </ThemedText>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            </Link>
                        )}
                    />
                )}
                {/* Marker Popup and Floating List Button */}
                <View
                    pointerEvents="box-none"
                    style={[
                        styles.popupContainer,
                        { marginBottom: bottom || 16 }
                    ]}
                >
                    {/* Floating List Button (only show on map view) */}
                    <TouchableOpacity
                        style={[styles.toggleButton, { backgroundColor: Colors[colorScheme].background }]}
                        onPress={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
                        activeOpacity={0.85}
                    >
                        <ListIcon size={20} color={Colors[colorScheme].text} />
                        <ThemedText style={{ marginLeft: 8, fontSize: 16 }}>List</ThemedText>
                    </TouchableOpacity>
                    {/* Marker Popup */}
                    {selectedLocality && viewMode === "map" && (
                        <Link href={`/localities/${selectedLocality.slug}`} asChild>
                            <TouchableOpacity>
                                <View style={[styles.popup, colorScheme === 'light' ? styles.popupLight : styles.popupDark]}>
                                    {/* Wrap content in a flex row and constrain image width */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                        {selectedLocality.photos?.[0]?.image && (
                                            <Image
                                                source={{ uri: selectedLocality.photos[0].image }}
                                                style={{
                                                    width: 80,
                                                    height: "100%",
                                                    borderTopLeftRadius: 16,
                                                    borderBottomLeftRadius: 16,
                                                    backgroundColor: '#eee',
                                                }}
                                                contentFit="cover"
                                                placeholder={{ uri: selectedLocality.photos[0].imageBlurhash }}
                                                placeholderContentFit="cover"
                                                transition={500}
                                            />
                                        )}
                                        <View style={{ flex: 1, padding: 16 }}>
                                            <ThemedText type="defaultSemiBold" style={{ fontSize: 18, flexShrink: 1 }}>
                                                {selectedLocality.name}
                                            </ThemedText>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.popupClose}
                                        onPress={() => setSelectedLocality(null)}
                                    >
                                        <ThemedIcon Icon={X} />
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        </Link>
                    )}
                </View>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    searchBar: {
        height: 48,
        borderColor: '#e0e0e0',
        borderRadius: 24,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
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
    filterButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        backgroundColor: 'transparent',
        alignItems: 'center',
        flexDirection: 'row',
        height: 40,
    },
    filterButtonLight: {
        backgroundColor: Colors.light.background,
        borderColor: Colors.light.border,
    },
    filterButtonDark: {
        backgroundColor: Colors.dark.background,
        borderColor: Colors.dark.border,
    },
    currentLocationButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
        flexDirection: 'row',
        gap: 3,
        height: 40,
        borderWidth: 1,
    },
    currentLocationButtonLight: {
        color: Colors.light.text,
        borderColor: Colors.light.border,
    },
    currentLocationButtonDark: {
        color: Colors.dark.text,
        borderColor: Colors.dark.border,
    },
    toggleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginBottom: 16,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        backgroundColor: 'transparent',
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
        zIndex: 100,
    },
    toggleButtonLight: {
        borderColor: Colors.light.border,
    },
    toggleButtonDark: {
        borderColor: Colors.dark.border,
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
    modalFooter: {
        padding: 16,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: '#e0e0e0',
    },
    showResultsButton: {
        borderRadius: 12,
        height: 40,
        marginBottom: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    showResultsButtonLight: {
        backgroundColor: Colors.light.primary,
    },
    showResultsButtonDark: {
        backgroundColor: Colors.dark.primary,
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#f5f5f5',
    },
    listItem: {
        borderRadius: 10,
        backgroundColor: '#f8f8f8',
        marginBottom: 10,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    popupContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        zIndex: 50,
        paddingHorizontal: 16, // add horizontal padding here
    },
    popup: {
        width: '100%',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        borderRadius: 16,
        marginBottom: 16,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 5,
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        position: 'relative',
    },
    popupLight: {
        backgroundColor: Colors.light.background,
        borderColor: Colors.light.border,
    },
    popupDark: {
        backgroundColor: Colors.dark.background,
        borderColor: Colors.dark.border,
    },
    popupClose: {
        position: 'absolute',
        top: 4,
        right: 4,
        padding: 4,
    },
    filterInput: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
    },
    filterInputLight: {
        backgroundColor: Colors.light.inputBackground,
        color: Colors.light.inputText,
    },
    filterInputDark: {
        backgroundColor: Colors.dark.inputBackground,
        color: Colors.dark.inputText,
    },
});