import '@/global.css';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { PropsWithChildren } from 'react';
import { View } from 'react-native';

export function TemaOscuroClaro({ children }: PropsWithChildren) {
  const { colorScheme } = useColorScheme();

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      {children}
    </View>
  );
}

export default TemaOscuroClaro;