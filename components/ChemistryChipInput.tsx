import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Plus, Search, X } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedIcon } from './ThemedIcon';
import { ThemedText } from './ThemedText';

type ChemistryChipInputProps = {
    values: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
};

export default function ChemistryChipInput({ values, onChange, placeholder }: ChemistryChipInputProps) {
    const [input, setInput] = useState('');
    const inputRef = useRef<TextInput>(null);
    const colorScheme = useColorScheme() ?? 'light';

    const handleAdd = () => {
        const val = input.trim();
        if (val && !values.includes(val)) {
            onChange([...values, val]);
        }
        setInput('');
    };

    const handleRemove = (val: string) => {
        onChange(values.filter(v => v !== val));
    };

    const handleSubmit = () => {
        handleAdd();
    };

    return (
        <View style={[styles.container, colorScheme === 'light' ? styles.containerLight : styles.containerDark]}>
            <View style={[styles.searchBar, colorScheme === 'light' ? styles.searchBarLight : styles.searchBarDark]}>
                <ThemedIcon
                    Icon={Search}
                    size={20}
                    style={{ marginRight: 8, opacity: 0.7 }}
                />
                <TextInput
                    ref={inputRef}
                    style={[styles.searchBarInput, colorScheme === 'light' ? styles.searchBarInputLight : styles.searchBarInputDark]}
                    placeholder={placeholder || 'Add...'}
                    placeholderTextColor={colorScheme === 'light' ? Colors.light.inputPlaceholder : Colors.dark.inputPlaceholder}
                    value={input}
                    onChangeText={setInput}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onSubmitEditing={handleSubmit}
                    returnKeyType="done"
                />
                <TouchableOpacity onPress={handleAdd} style={styles.addBtn}>
                    <ThemedIcon
                        Icon={Plus}
                        size={16}
                    />
                    <ThemedText
                        lightColor={Colors.light.icon}
                        darkColor={Colors.dark.icon}
                    >
                        Add
                    </ThemedText>
                </TouchableOpacity>
            </View>
            <View style={[styles.chipsWrap, values.length === 0 && { display: "none" }]}>
                {values.map(val => (
                    <View key={val} style={[styles.chip, colorScheme === 'light' ? styles.chipLight : styles.chipDark]}>
                        <Text style={styles.chipText}>{val}</Text>
                        <TouchableOpacity onPress={() => handleRemove(val)} style={[styles.removeBtnContainer, colorScheme === 'light' ? styles.removeBtnContainerLight : styles.removeBtnContainerDark]}>
                            <X size={10} strokeWidth={3} color={colorScheme === 'light' ? Colors.dark.text : Colors.light.text} />
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        marginBottom: 2,
    },
    containerLight: {
        backgroundColor: Colors.light.inputBackground,
    },
    containerDark: {
        backgroundColor: Colors.dark.inputBackground,
    },
    searchBar: {
        height: 44,
        borderColor: '#e0e0e0',
        borderRadius: 12,
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
    addBtn: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        marginLeft: 8,
        gap: 4,
    },
    chipsWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 4,
        marginHorizontal: 12,
        marginBottom: 8,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        paddingVertical: 4,
        paddingHorizontal: 10,
    },
    chipLight: {
        backgroundColor: 'rgba(212,212,216,0.6)',
    },
    chipDark: {
        backgroundColor: 'rgba(82,82,91,0.6)',
    },
    chipText: {
        fontSize: 15,
        color: '#333',
        marginRight: 4,
    },
    removeBtnContainer: {
        padding: 3,
        borderRadius: 100,
        opacity: 0.8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        aspectRatio: 1,
        marginLeft: 2,
        marginRight: -2,
        paddingHorizontal: 2,
    },
    removeBtnContainerLight: {
        backgroundColor: Colors.dark.primary,
    },
    removeBtnContainerDark: {
        backgroundColor: Colors.light.primary,
    },
});
