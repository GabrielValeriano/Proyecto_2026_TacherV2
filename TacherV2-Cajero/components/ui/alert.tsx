import * as React from 'react';
import { View, Text } from 'react-native';

export function Alert({ children, style, ...props }: React.ComponentPropsWithoutRef<typeof View>) {
  return (
    <View
      style={[{ padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#f8fafc' }, style]}
      {...props}
    >
      {children}
    </View>
  );
}

export function AlertTitle({ children, style, ...props }: React.ComponentPropsWithoutRef<typeof Text>) {
  return (
    <Text style={[{ fontSize: 16, fontWeight: '700', marginBottom: 4, color: '#0f172a' }, style]} {...props}>
      {children}
    </Text>
  );
}

export function AlertDescription({ children, style, ...props }: React.ComponentPropsWithoutRef<typeof Text>) {
  return (
    <Text style={[{ fontSize: 14, color: '#475569' }, style]} {...props}>
      {children}
    </Text>
  );
}