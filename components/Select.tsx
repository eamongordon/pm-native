import { Colors } from '@/constants/Colors';
import { ArrowUpDown, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    useColorScheme,
} from 'react-native';
import { ThemedIcon } from './ThemedIcon';
import { ThemedText } from './ThemedText';

type Option = {
    label: string;
    value: string;
};

type SelectProps = {
    options: Option[];
    selectedValue: string | null;
    onValueChange: (value: string) => void;
    placeholder?: string;
    prefix?: string;
};

const Select: React.FC<SelectProps> = ({
    options,
    selectedValue,
    onValueChange,
    placeholder = 'Select an option',
    prefix,
}) => {
    const [modalVisible, setModalVisible] = useState(false);
    const colorScheme = useColorScheme() ?? 'light';

    const selectedLabel =
        options.find((opt) => opt.value === selectedValue)?.label || placeholder;

    return (
        <View>
            <TouchableOpacity
                style={[
                    styles.selectBox,
                    colorScheme === 'light' ? styles.selectBoxLight : styles.selectBoxDark,
                ]}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.8}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <ThemedIcon
                        Icon={ArrowUpDown}
                        size={18}
                        style={{ marginRight: 8 }}
                    />
                    <ThemedText style={{ fontSize: 14 }}>
                        {prefix ? `${prefix}${selectedLabel}` : selectedLabel}
                    </ThemedText>
                </View>
            </TouchableOpacity>
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
                            colorScheme === 'light' ? styles.modalContentLight : styles.modalContentDark,
                        ]}
                    >
                        <View style={styles.modalHeader}>
                            <ThemedText
                                type="defaultMedium"
                                style={[
                                    styles.modalHeaderTitle,
                                    { color: colorScheme === 'light' ? Colors.light.text : Colors.dark.text, textAlign: 'left', flex: 1 }
                                ]}
                            >
                                Sort
                            </ThemedText>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={styles.modalHeaderButton}
                                accessibilityLabel="Close"
                            >
                                <ThemedIcon
                                    Icon={X}
                                    size={22}
                                    lightColor={colorScheme === 'light' ? Colors.light.text : Colors.dark.text}
                                    darkColor={colorScheme === 'light' ? Colors.light.text : Colors.dark.text}
                                />
                            </TouchableOpacity>
                        </View>
                        <ScrollView
                            contentContainerStyle={{
                                paddingVertical: 8,
                                paddingHorizontal: 0,
                            }}
                            showsVerticalScrollIndicator={false}
                        >
                            {options.map((item) => (
                                <TouchableOpacity
                                    key={item.value}
                                    style={styles.optionRow}
                                    onPress={() => onValueChange(item.value)}
                                >
                                    <View
                                        style={[
                                            styles.radioCircle,
                                            {
                                                borderColor: colorScheme === 'light'
                                                    ? Colors.light.inputText
                                                    : Colors.dark.inputText,
                                            },
                                        ]}
                                    >
                                        {selectedValue === item.value && (
                                            <View
                                                style={[
                                                    styles.radioCircleFilled,
                                                    {
                                                        backgroundColor: colorScheme === 'light'
                                                            ? Colors.light.inputText
                                                            : Colors.dark.inputText,
                                                    },
                                                ]}
                                            />
                                        )}
                                    </View>
                                    <ThemedText style={styles.optionText}>{item.label}</ThemedText>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[
                                    styles.showResultsButton,
                                    { backgroundColor: Colors[colorScheme].primary }
                                ]}
                                onPress={() => setModalVisible(false)}
                            >
                                <ThemedText type="defaultMedium">
                                    Show Results
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
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
        borderRadius: 20,
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
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end',
        alignItems: 'stretch',
    },
    modalContent: {
        width: '100%',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        padding: 0,
        alignItems: 'stretch',
        minHeight: 120,
        maxHeight: '60%',
        overflow: 'hidden',
        backgroundColor: 'white', // fallback
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
    modalHeaderTitle: {
        fontSize: 18,
        textAlign: 'center',
        flex: 1,
    },
    modalHeaderButton: {
        minWidth: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    radioCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    radioCircleFilled: {
        width: 14,
        height: 14,
        borderRadius: 7,
    },
    optionText: {
        fontSize: 16,
    },
    modalFooter: {
        padding: 20,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: '#e0e0e0',
        backgroundColor: 'transparent',
    },
    showResultsButton: {
        borderRadius: 12,
        marginBottom: 16,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default Select;
