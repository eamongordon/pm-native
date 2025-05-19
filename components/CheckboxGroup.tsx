import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Check } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedIcon } from './ThemedIcon';

type CheckboxGroupProps = {
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
};

export function CheckboxGroup({
  options,
  selected,
  onToggle,
}: CheckboxGroupProps) {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <View style={{ flexDirection: 'column' }}>
      {options.map((option) => {
        const isChecked = selected.includes(option);
        return (
          <Pressable
            key={option}
            onPress={() => onToggle(option)}
            style={styles.checkboxRow}
          >
            <View
              style={[
                styles.customCheckbox,
                colorScheme === 'light' ? styles.customCheckboxLight : styles.customCheckboxDark,
                isChecked && (colorScheme === 'light' ? styles.customCheckboxCheckedLight : styles.customCheckboxCheckedDark),
              ]}
            >
              {isChecked && (
                <ThemedIcon
                  Icon={Check}
                  size={16}
                  color={
                    colorScheme === 'light' ? Colors.light.text : Colors.dark.text
                  }
                  style={styles.checkmarkIcon}
                />
              )}
            </View>
            <ThemedText style={{ marginLeft: 8 }}>{option}</ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  customCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customCheckboxLight: {
    borderColor: Colors.light.border,
  },
  customCheckboxDark: {
    borderColor: Colors.dark.border,
  },
  customCheckboxCheckedLight: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary,
  },
  customCheckboxCheckedDark: {
    borderColor: Colors.dark.primary,
    backgroundColor: Colors.dark.primary,
  },
  checkmarkIcon: {
    position: 'absolute',
    top: 1,
    left: 1,
  },
});
