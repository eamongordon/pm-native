import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';

type ThemedIconProps = {
  Icon: React.ComponentType<{ color?: string; size?: number; style?: any }>;
  size?: number;
  color?: string;
  lightColor?: string;
  darkColor?: string;
  style?: any;
  iconProps?: Omit<React.ComponentProps<any>, 'color' | 'size' | 'style'>;
};

export function ThemedIcon({
  Icon,
  size = 20,
  color,
  lightColor,
  darkColor,
  style,
  iconProps,
}: ThemedIconProps) {
  const themeColor = useThemeColor({ light: lightColor, dark: darkColor }, 'icon');
  const themedColor = color ?? themeColor;
  return <Icon color={themedColor} size={size} style={style} {...iconProps} />;
}
