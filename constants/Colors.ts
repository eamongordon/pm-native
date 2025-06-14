/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    primary: '#d4d4d8',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    border: '#e0e0e0',
    inputBackground: '#f7f7f7',
    inputText: '#222',
    inputPlaceholder: '#888',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    primary: '#52525b',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    border: '#33383b',
    inputBackground: '#23272b',
    inputText: '#ECEDEE',
    inputPlaceholder: '#888',
  },
};
