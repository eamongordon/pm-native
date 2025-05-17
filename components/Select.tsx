import { Colors } from '@/constants/Colors';
import { ArrowUpDown } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
    FlatList,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View,
    useColorScheme
} from 'react-native';
import { ThemedIcon } from './ThemedIcon';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

type Option = {
    label: string;
    value: string;
};

type SelectProps = {
    options: Option[];
    selectedValue: string | null;
    onValueChange: (value: string) => void;
    placeholder?: string;
};

const Select: React.FC<SelectProps> = ({
    options,
    selectedValue,
    onValueChange,
    placeholder = 'Select an option',
}) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [dropdownTop, setDropdownTop] = useState(0);
    const [dropdownLeft, setDropdownLeft] = useState(0);
    const [dropdownWidth, setDropdownWidth] = useState(0);
    const selectBoxRef = useRef<View>(null);

    const colorScheme = useColorScheme() ?? 'light';

    const openDropdown = () => {
        if (selectBoxRef.current) {
            selectBoxRef.current.measureInWindow((x, y, width, height) => {
                setDropdownTop(y + height);
                setDropdownLeft(x);
                setDropdownWidth(width);
                setModalVisible(true);
            });
        } else {
            setModalVisible(true);
        }
    };

    const selectedLabel =
        options.find((opt) => opt.value === selectedValue)?.label || placeholder;

    return (
        <View>
            <View ref={selectBoxRef}>
                <TouchableOpacity
                    style={[styles.selectBox, colorScheme === 'light' ? styles.selectBoxLight : styles.selectBoxDark]}
                    onPress={openDropdown}
                    activeOpacity={0.8}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <ThemedIcon
                            Icon={ArrowUpDown}
                            size={18}
                            style={{ marginRight: 8 }}
                        />
                        <ThemedText style={{ fontSize: 14 }}>
                            {selectedLabel}
                        </ThemedText>
                    </View>
                </TouchableOpacity>
            </View>
            <Modal
                visible={modalVisible}
                transparent
                animationType="none"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPressOut={() => setModalVisible(false)}
                >
                    <ThemedView
                        style={[
                            styles.dropdownMenu,
                            colorScheme === 'light' ? styles.dropdownMenuLight : styles.dropdownMenuDark,
                            {
                                position: 'absolute',
                                top: dropdownTop,
                                left: dropdownLeft,
                                width: dropdownWidth,
                                maxHeight: 300,
                            },
                        ]}
                    >
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.option}
                                    onPress={() => {
                                        onValueChange(item.value);
                                        setModalVisible(false);
                                    }}
                                >
                                    <ThemedText style={styles.optionText}>{item.label}</ThemedText>
                                </TouchableOpacity>
                            )}
                        />
                    </ThemedView>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    selectBox: {
        marginTop: 0,
        marginLeft: 0,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        height: 40,
    },
    selectBoxLight: {
        borderColor: Colors.light.border,
    },
    selectBoxDark: {
        borderColor: Colors.dark.border,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.0)',
    },
    dropdownMenu: {
        borderRadius: 8,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        borderWidth: 1,
        zIndex: 1000,
        paddingVertical: 4,
    },
    dropdownMenuLight: {
        borderColor: Colors.light.border,
        backgroundColor: Colors.light.background,
    },
    dropdownMenuDark: {
        backgroundColor: Colors.dark.inputBackground,
    },
    option: {
        paddingHorizontal: 16,
        paddingVertical: 4,
    },
    optionText: {
        fontSize: 14
    }
});

export default Select;
