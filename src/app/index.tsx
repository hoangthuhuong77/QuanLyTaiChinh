import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { Colors } from '@/hangso/colors';
import { useAuth } from '@/ngucanh/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return <View style={{ flex:1, alignItems:'center', justifyContent:'center', backgroundColor:Colors.background }}><ActivityIndicator size="large" color={Colors.primary}/></View>;
  }

  return <Redirect href={user ? '/(tabs)/index' : '/(auth)/dangnhap'} />;
}
