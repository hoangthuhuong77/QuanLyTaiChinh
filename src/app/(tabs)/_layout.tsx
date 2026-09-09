import { Tabs } from 'expo-router';
import { Text, type ColorValue } from 'react-native';
import { Colors } from '@/hangso/colors';

const icon = (value: string, color: ColorValue) => <Text style={{ fontSize: 24, color }}>{value}</Text>;

export default function TabsLayout() {
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: Colors.primary, tabBarInactiveTintColor: Colors.muted, tabBarStyle: { height: 76, paddingTop: 7, paddingBottom: 9, borderTopColor: Colors.border, backgroundColor: Colors.surface }, tabBarLabelStyle: { fontSize: 13, fontWeight: '700' } }}>
    <Tabs.Screen name="index" options={{ title: 'Trang chủ', tabBarIcon: ({ color }) => icon('⌂', color) }} />
    <Tabs.Screen name="giaodich" options={{ title: 'Giao dịch', tabBarIcon: ({ color }) => icon('↕', color) }} />
    <Tabs.Screen name="them" options={{ title: 'Thêm mới', tabBarIcon: () => <Text style={{ fontSize: 30, color: Colors.white, backgroundColor: Colors.primary, width: 54, height: 54, textAlign: 'center', lineHeight: 51, borderRadius: 27 }}>+</Text> }} />
    <Tabs.Screen name="thongke" options={{ title: 'Thống kê', tabBarIcon: ({ color }) => icon('▥', color) }} />
    <Tabs.Screen name="canhan" options={{ title: 'Cá nhân', tabBarIcon: ({ color }) => icon('●', color) }} />
  </Tabs>;
}
