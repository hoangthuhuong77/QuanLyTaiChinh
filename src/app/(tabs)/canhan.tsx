import { Image, Pressable, Text, View } from 'react-native';
import { router } from '@/tienich/router';
import { Button, Card, Header, Screen } from '@/thanhphan/dungchung/UI';
import { useAuth } from '@/ngucanh/AuthContext';
import { Colors } from '@/hangso/colors';

const menu = [
  ['💳', 'Ví tiền', '/vitien'], ['🔄', 'Chuyển tiền', '/chuyentien'], ['📂', 'Danh mục', '/danhmuc'],
  ['🎯', 'Ngân sách', '/ngansach'], ['🐷', 'Mục tiêu tiết kiệm', '/tietkiem'], ['🔔', 'Thông báo & nhắc việc', '/thongbao'],
  ['👤', 'Chỉnh sửa hồ sơ', '/canhan/sua'], ['🔐', 'Đổi mật khẩu', '/canhan/doimatkhau'],
] as const;

export default function Profile() {
  const { user, logout } = useAuth();
  return <Screen><Header title="Cá nhân" subtitle="Tài khoản và công cụ quản lý" />
    <Card style={{ alignItems: 'center', gap: 7 }}>
      {user?.avatar_url ? <Image source={{ uri: user.avatar_url }} style={{ width: 82, height: 82, borderRadius: 41 }} /> : <View style={{ width: 82, height: 82, borderRadius: 41, backgroundColor: Colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 32, color: Colors.primary, fontWeight: '900' }}>{user?.full_name.charAt(0).toUpperCase()}</Text></View>}
      <Text style={{ fontSize: 20, fontWeight: '900', color: Colors.text }}>{user?.full_name}</Text><Text style={{ color: Colors.muted }}>@{user?.username} · {user?.email}</Text>
    </Card>
    <Card style={{ padding: 4 }}>{menu.map(([icon, label, path], index) => <Pressable key={path} onPress={() => router.push(path)} style={{ padding: 16, flexDirection: 'row', borderBottomWidth: index === menu.length - 1 ? 0 : 1, borderColor: Colors.border }}><Text style={{ marginRight: 10 }}>{icon}</Text><Text style={{ flex: 1, color: Colors.text, fontWeight: '700' }}>{label}</Text><Text style={{ color: Colors.muted }}>›</Text></Pressable>)}</Card>
    <Button title="Đăng xuất" variant="secondary" onPress={logout} />
  </Screen>;
}
