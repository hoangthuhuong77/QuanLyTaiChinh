import { useState } from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Button, Card, Field, Header, Screen } from '@/thanhphan/dungchung/UI';
import { useAuth } from '@/ngucanh/AuthContext';
import { authService } from '@/dichvu';
import { Colors } from '@/hangso/colors';
import { apiMessage } from '@/tienich/dinhdang';

export default function EditProfile() {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({ full_name: user?.full_name || '', email: user?.email || '', username: user?.username || '', phone: user?.phone || '', avatar_url: user?.avatar_url || '' });
  const [saving, setSaving] = useState(false); const change = (key: keyof typeof form) => (value: string) => setForm(current => ({ ...current, [key]: value }));
  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync(); if (!permission.granted) return Alert.alert('Cần quyền truy cập', 'Bạn hãy cho phép ứng dụng truy cập thư viện ảnh.');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.45, base64: true });
    const asset = result.assets?.[0]; if (!result.canceled && asset?.base64) setForm(current => ({ ...current, avatar_url: `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}` }));
  };
  const submit = async () => { if (!form.full_name.trim() || !form.email.trim() || !form.username.trim()) return Alert.alert('Thiếu thông tin', 'Họ tên, email và tên đăng nhập không được để trống.'); try { setSaving(true); await authService.updateProfile(form); await refresh(); Alert.alert('Thành công', 'Đã cập nhật hồ sơ.'); router.back(); } catch (error) { Alert.alert('Lỗi', apiMessage(error)); } finally { setSaving(false); } };
  return <Screen><Header title="Chỉnh sửa hồ sơ" /><Card style={{ gap: 14 }}>
    <View style={{ alignItems: 'center', gap: 8 }}>{form.avatar_url ? <Image source={{ uri: form.avatar_url }} style={{ width: 96, height: 96, borderRadius: 48 }} /> : <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: Colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 36, fontWeight: '900', color: Colors.primary }}>{form.full_name.charAt(0).toUpperCase() || '?'}</Text></View>}<Pressable onPress={pickAvatar}><Text style={{ color: Colors.primary, fontWeight: '800' }}>Chọn ảnh đại diện</Text></Pressable>{form.avatar_url ? <Pressable onPress={() => setForm(current => ({ ...current, avatar_url: '' }))}><Text style={{ color: Colors.expense }}>Xóa ảnh</Text></Pressable> : null}</View>
    <Field label="Họ và tên" value={form.full_name} onChangeText={change('full_name')} /><Field label="Email" value={form.email} onChangeText={change('email')} keyboardType="email-address" /><Field label="Tên đăng nhập" value={form.username} onChangeText={change('username')} /><Field label="Số điện thoại (không bắt buộc)" value={form.phone} onChangeText={change('phone')} keyboardType="phone-pad" /><Button title="Lưu thay đổi" loading={saving} onPress={submit} />
  </Card></Screen>;
}
