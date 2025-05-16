import { useThemeColor } from '@/hooks/useThemeColor';
import { useFonts, WorkSans_400Regular, WorkSans_700Bold } from '@expo-google-fonts/work-sans';
import { StyleSheet, Text, type TextProps } from 'react-native';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  
  const [fontsLoaded] = useFonts({
    WorkSans_400Regular,
    WorkSans_700Bold,
  });

  if (!fontsLoaded) {
    return null; // Or use <AppLoading /> for a better UX
  }
  
  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'WorkSans_400Regular',
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'WorkSans_700Bold',
  },
  title: {
    fontSize: 32,
    lineHeight: 32,
    fontFamily: 'WorkSans_700Bold',
  },
  subtitle: {
    fontSize: 20,
    fontFamily: 'WorkSans_700Bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
    fontFamily: 'WorkSans_400Regular',
  },
});
