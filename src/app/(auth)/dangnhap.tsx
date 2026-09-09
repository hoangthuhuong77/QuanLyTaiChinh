import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Button, Card, Field, Screen } from '@/thanhphan/dungchung/UI';
import { Colors } from '@/hangso/colors';
import { useAuth } from '@/ngucanh/AuthContext';
import { apiMessage } from '@/tienich/dinhdang';

export default function Login() {
  const [login, setLogin] = useState(''); const [password, setPassword] = useState(''); const [remember, setRemember] = useState(true); const [loading, setLoading] = useState(false); const { login: signIn } = useAuth();
  const submit = async () => { if (!login.trim() || !password) return Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên đăng nhập và mật khẩu.'); try { setLoading(true); await signIn(login.trim(), password, remember); } catch (error) { Alert.alert('Đăng nhập thất bại', apiMessage(error)); } finally { setLoading(false); } };
  return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><Screen>
    <View style={{ paddingTop: 45, gap: 11 }}><View style={{ width: 64, height: 64, borderRadius: 19, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 31 }}>₫</Text></View><Text style={{ fontSize: 35, fontWeight: '900', color: Colors.text }}>Tài chính trong tầm tay</Text><Text style={{ color: Colors.muted, fontSize: 18, lineHeight: 25 }}>Đăng nhập để tiếp tục quản lý dòng tiền của bạn.</Text></View>
    <Card style={{ gap: 18 }}><Field label="Email hoặc tên đăng nhập" value={login} onChangeText={setLogin} placeholder="tenban@example.com" /><Field label="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry placeholder="Ít nhất 6 ký tự" />
      <Pressable onPress={() => setRemember(value => !value)} style={{ flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 3 }}><View style={{ width: 25, height: 25, borderRadius: 7, borderWidth: 1, borderColor: remember ? Colors.primary : Colors.border, backgroundColor: remember ? Colors.primary : Colors.surface, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: Colors.white, fontWeight: '900' }}>{remember ? '✓' : ''}</Text></View><Text style={{ color: Colors.text, fontSize: 16 }}>Ghi nhớ đăng nhập</Text></Pressable>
      <Button title="Đăng nhập" onPress={submit} loading={loading} /><Text style={{ textAlign: 'center', color: Colors.muted, fontSize: 16 }}>Chưa có tài khoản? <Link href="/dangky" style={{ color: Colors.primary, fontWeight: '800' }}>Đăng ký</Link></Text>
    </Card>
  </Screen></KeyboardAvoidingView>;
}
