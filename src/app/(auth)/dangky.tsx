import { useState } from 'react';
import { Alert, Text } from 'react-native';
import { Link } from 'expo-router';
import { Button, Card, Field, Header, Screen } from '@/thanhphan/dungchung/UI';
import { Colors } from '@/hangso/colors';
import { useAuth } from '@/ngucanh/AuthContext';
import { apiMessage } from '@/tienich/dinhdang';

export default function Register() {
  const [form, setForm] = useState({ full_name: '', email: '', username: '', phone: '', password: '', confirm_password: '' }); const [loading, setLoading] = useState(false); const { register } = useAuth(); const field = (key: keyof typeof form) => (value: string) => setForm(current => ({ ...current, [key]: value }));
  const submit = async () => { if (!form.full_name.trim() || !form.email.includes('@') || !form.username.trim() || form.password.length < 6) return Alert.alert('Dữ liệu chưa hợp lệ', 'Nhập đủ thông tin, email hợp lệ và mật khẩu ít nhất 6 ký tự.'); if (form.password !== form.confirm_password) return Alert.alert('Mật khẩu không khớp', 'Vui lòng nhập lại phần xác nhận mật khẩu.'); try { setLoading(true); const { confirm_password: _, ...payload } = form; await register(payload); } catch (error) { Alert.alert('Đăng ký thất bại', apiMessage(error)); } finally { setLoading(false); } };
  return <Screen><Header title="Tạo tài khoản" subtitle="Bắt đầu xây dựng thói quen tài chính tốt hơn." /><Card style={{ gap: 16 }}>
    <Field label="Họ và tên" value={form.full_name} onChangeText={field('full_name')} placeholder="Nguyễn Văn A" /><Field label="Email" value={form.email} onChangeText={field('email')} keyboardType="email-address" placeholder="tenban@example.com" /><Field label="Tên đăng nhập" value={form.username} onChangeText={field('username')} placeholder="nguyenvana" /><Field label="Số điện thoại (không bắt buộc)" value={form.phone} onChangeText={field('phone')} keyboardType="phone-pad" placeholder="090..." /><Field label="Mật khẩu" value={form.password} onChangeText={field('password')} secureTextEntry placeholder="Ít nhất 6 ký tự" /><Field label="Xác nhận mật khẩu" value={form.confirm_password} onChangeText={field('confirm_password')} secureTextEntry placeholder="Nhập lại mật khẩu" /><Button title="Đăng ký" onPress={submit} loading={loading} /><Text style={{ textAlign: 'center', color: Colors.muted, fontSize: 16 }}>Đã có tài khoản? <Link href="/dangnhap" style={{ color: Colors.primary, fontWeight: '800' }}>Đăng nhập</Link></Text>
  </Card></Screen>;
}
