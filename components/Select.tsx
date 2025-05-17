import React, { useRef, useState } from 'react';
import {
    FlatList,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
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
          style={styles.selectBox}
          onPress={openDropdown}
          activeOpacity={0.8}
        >
          <ThemedText>
            {selectedLabel}
          </ThemedText>
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
                  <ThemedText>{item.label}</ThemedText>
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
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
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
    borderColor: '#eee',
    zIndex: 1000,
  },
  option: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});

export default Select;
