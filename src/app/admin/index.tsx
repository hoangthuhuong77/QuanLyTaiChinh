import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Card, Field, Header, Loading, Screen } from '@/thanhphan/dungchung/UI';
import { Colors } from '@/hangso/colors';
import { adminService } from '@/dichvu';
import type { AdminDashboard, AdminFeedback, AdminStatistics, AdminUser, Category } from '@/kieudulieu';
import { useAuth } from '@/ngucanh/AuthContext';
import { apiMessage } from '@/tienich/dinhdang';

type Section = 'dashboard' | 'users' | 'categories' | 'notifications' | 'feedback' | 'statistics' | 'account';
const sections: { key: Section; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Tổng quan', icon: '⌂' },
  { key: 'users', label: 'Người dùng', icon: '◉' },
  { key: 'categories', label: 'Danh mục', icon: '▦' },
  { key: 'notifications', label: 'Thông báo', icon: '!' },
  { key: 'feedback', label: 'Phản hồi', icon: '?' },
  { key: 'statistics', label: 'Thống kê', icon: '▥' },
  { key: 'account', label: 'Tài khoản', icon: '●' },
];

const metricLabels: { key: keyof AdminDashboard; label: string; icon: string }[] = [
  { key: 'total_users', label: 'Tổng người dùng', icon: '◉' },
  { key: 'new_users', label: 'Người dùng mới tháng này', icon: '+' },
  { key: 'active_users', label: 'Đang hoạt động', icon: '✓' },
  { key: 'total_transactions', label: 'Tổng giao dịch', icon: '↕' },
  { key: 'total_wallets', label: 'Số lượng ví', icon: '▣' },
  { key: 'total_categories', label: 'Số danh mục', icon: '▦' },
];

export default function AdminHome() {
  const [section, setSection] = useState<Section>('dashboard');
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [statistics, setStatistics] = useState<AdminStatistics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [feedback, setFeedback] = useState<AdminFeedback[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [dashboardResult, usersResult, categoriesResult, feedbackResult] = await Promise.all([
        adminService.dashboard(), adminService.users({ limit: 8, search: search.trim() || undefined }), adminService.categories(), adminService.feedback(),
      ]);
      setDashboard(dashboardResult.data); setUsers(usersResult.data.items); setCategories(categoriesResult.data); setFeedback(feedbackResult.data);
    } catch (error) { Alert.alert('Không thể tải dữ liệu', apiMessage(error)); } finally { setLoading(false); }
  }, [search]);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  const loadStatistics = async () => { try { setStatistics((await adminService.statistics()).data); } catch (error) { Alert.alert('Không thể tải thống kê', apiMessage(error)); } };
  const changeStatus = async (item: AdminUser) => { try { await adminService.setUserStatus(item.id, item.status === 'active' ? 'locked' : 'active'); load(); } catch (error) { Alert.alert('Không thể cập nhật', apiMessage(error)); } };
  const removeUser = (item: AdminUser) => Alert.alert('Xóa người dùng?', `Xóa tài khoản ${item.username}?`, [{ text: 'Hủy', style: 'cancel' }, { text: 'Xóa', style: 'destructive', onPress: async () => { try { await adminService.removeUser(item.id); load(); } catch (error) { Alert.alert('Không thể xóa', apiMessage(error)); } } }]);
  const updateFeedback = async (item: AdminFeedback) => { try { await adminService.updateFeedback(item.id, { status: item.status === 'resolved' ? 'pending' : 'resolved', admin_reply: item.admin_reply || 'Đã tiếp nhận và xử lý.' }); load(); } catch (error) { Alert.alert('Không thể cập nhật', apiMessage(error)); } };
  const addCategory = () => { let name = ''; Alert.prompt('Danh mục mới', 'Nhập tên danh mục mặc định', value => { name = value.trim(); if (name) adminService.createCategory({ name, type: 'expense', icon: '•' }).then(load).catch(error => Alert.alert('Không thể tạo', apiMessage(error))); }); };
  const createAnnouncement = () => Alert.prompt('Thông báo mới', 'Nhập nội dung gửi tới tất cả người dùng', value => { if (value?.trim()) adminService.createNotification({ title: 'Thông báo hệ thống', message: value.trim() }).then(() => Alert.alert('Đã gửi thông báo')).catch(error => Alert.alert('Không thể gửi', apiMessage(error))); });

  if (loading && !dashboard) return <Screen><Loading /></Screen>;
  const title = sections.find(item => item.key === section)?.label || 'Quản trị hệ thống';
  return <Screen>
    <View style={styles.hero}><View style={{ flex: 1 }}><Text style={styles.eyebrow}>CONTROL CENTER</Text><Text style={styles.brand}>Quản trị hệ thống</Text><Text style={styles.welcome}>Xin chào, {user?.full_name || user?.username}</Text></View><Pressable onPress={logout} style={styles.logout}><Text style={styles.logoutText}>Thoát</Text></Pressable></View>
    <View style={styles.nav}>{sections.map(item => <Pressable key={item.key} onPress={() => { setSection(item.key); if (item.key === 'statistics') loadStatistics(); }} style={[styles.navItem, section === item.key && styles.navItemActive]}><Text style={[styles.navIcon, section === item.key && styles.navTextActive]}>{item.icon}</Text><Text style={[styles.navLabel, section === item.key && styles.navTextActive]}>{item.label}</Text></Pressable>)}</View>
    <Header title={title} subtitle="Theo dõi và điều hành dữ liệu trong hệ thống" />
    {section === 'dashboard' && dashboard ? <Dashboard data={dashboard} /> : null}
    {section === 'users' ? <Users users={users} search={search} setSearch={setSearch} onStatus={changeStatus} onRemove={removeUser} /> : null}
    {section === 'categories' ? <Categories categories={categories} onAdd={addCategory} /> : null}
    {section === 'notifications' ? <Notifications onCreate={createAnnouncement} /> : null}
    {section === 'feedback' ? <Feedback items={feedback} onUpdate={updateFeedback} /> : null}
    {section === 'statistics' ? <Statistics data={statistics} /> : null}
    {section === 'account' ? <Account user={user} onLogout={logout} /> : null}
  </Screen>;
}

function Dashboard({ data }: { data: AdminDashboard }) { return <View style={styles.grid}>{metricLabels.map(metric => <Card key={metric.key} style={styles.metric}><View style={styles.metricIcon}><Text style={{ color: Colors.primary, fontSize: 21 }}>{metric.icon}</Text></View><Text style={styles.metricValue}>{data[metric.key].toLocaleString('vi-VN')}</Text><Text style={styles.metricLabel}>{metric.label}</Text></Card>)}</View>; }
function Users({ users, search, setSearch, onStatus, onRemove }: { users: AdminUser[]; search: string; setSearch: (value: string) => void; onStatus: (user: AdminUser) => void; onRemove: (user: AdminUser) => void }) { return <View style={{ gap: 14 }}><Field label="Tìm người dùng" value={search} onChangeText={setSearch} placeholder="Tên, email hoặc username" />{users.map(item => <Card key={item.id} style={styles.row}><View style={{ flex: 1, gap: 3 }}><Text style={styles.rowTitle}>{item.full_name}</Text><Text style={styles.rowMeta}>@{item.username} · {item.email}</Text><Text style={[styles.badge, item.status === 'active' ? styles.active : styles.locked]}>{item.status === 'active' ? 'Đang hoạt động' : 'Đã khóa'}</Text></View><View style={styles.rowActions}><Pressable onPress={() => onStatus(item)}><Text style={styles.action}>{item.status === 'active' ? 'Khóa' : 'Mở'}</Text></Pressable><Pressable onPress={() => onRemove(item)}><Text style={[styles.action, { color: Colors.expense }]}>Xóa</Text></Pressable></View></Card>)}</View>; }
function Categories({ categories, onAdd }: { categories: Category[]; onAdd: () => void }) { return <View style={{ gap: 12 }}><Pressable onPress={onAdd} style={styles.addButton}><Text style={styles.addButtonText}>+ Thêm danh mục mặc định</Text></Pressable>{categories.map(item => <Card key={item.id} style={styles.listRow}><Text style={styles.categoryIcon}>{item.icon || '•'}</Text><View style={{ flex: 1 }}><Text style={styles.rowTitle}>{item.name}</Text><Text style={styles.rowMeta}>{item.type === 'income' ? 'Khoản thu' : 'Khoản chi'}</Text></View></Card>)}</View>; }
function Notifications({ onCreate }: { onCreate: () => void }) { return <View style={{ gap: 14 }}><Card style={styles.feature}><Text style={styles.featureIcon}>!</Text><View style={{ flex: 1 }}><Text style={styles.rowTitle}>Thông báo toàn hệ thống</Text><Text style={styles.rowMeta}>Gửi thông tin bảo trì, cập nhật hoặc hướng dẫn tới người dùng.</Text></View></Card><Pressable onPress={onCreate} style={styles.addButton}><Text style={styles.addButtonText}>+ Tạo thông báo mới</Text></Pressable></View>; }
function Feedback({ items, onUpdate }: { items: AdminFeedback[]; onUpdate: (item: AdminFeedback) => void }) { return <View style={{ gap: 12 }}>{items.length ? items.map(item => <Card key={item.id} style={styles.row}><View style={{ flex: 1, gap: 4 }}><Text style={styles.rowTitle}>{item.subject}</Text><Text style={styles.rowMeta}>{item.full_name} · {item.type}</Text><Text style={styles.feedbackMessage}>{item.message}</Text><Text style={[styles.badge, item.status === 'resolved' ? styles.active : styles.pending]}>{item.status === 'resolved' ? 'Đã xử lý' : item.status}</Text></View><Pressable onPress={() => onUpdate(item)}><Text style={styles.action}>{item.status === 'resolved' ? 'Mở lại' : 'Xử lý'}</Text></Pressable></Card>) : <Text style={styles.empty}>Chưa có phản hồi.</Text>}</View>; }
function Statistics({ data }: { data: AdminStatistics | null }) { return data ? <View style={{ gap: 14 }}><View style={styles.grid}>{[['Người dùng', data.total_users], ['Giao dịch', data.total_transactions], ['Người dùng mới 30 ngày', data.new_users_30_days]].map(([label, value]) => <Card key={String(label)} style={styles.metric}><Text style={styles.metricValue}>{Number(value).toLocaleString('vi-VN')}</Text><Text style={styles.metricLabel}>{label}</Text></Card>)}</View><Card><Text style={styles.cardTitle}>Tăng trưởng theo tháng</Text>{data.monthly_users.map(item => <View key={item.month} style={styles.statLine}><Text style={styles.rowMeta}>{item.month}</Text><Text style={styles.rowTitle}>{item.users} người dùng mới</Text></View>)}</Card><Text style={styles.note}>Không hiển thị chi tiết tiền của từng người dùng để bảo vệ riêng tư.</Text></View> : <Loading />; }
function Account({ user, onLogout }: { user: AdminUser | null; onLogout: () => void }) { return <View style={{ gap: 14 }}><Card style={styles.profile}><View style={styles.avatar}><Text style={styles.avatarText}>{user?.full_name?.slice(0, 1) || 'A'}</Text></View><Text style={styles.profileName}>{user?.full_name}</Text><Text style={styles.rowMeta}>@{user?.username}</Text><Text style={styles.role}>ADMINISTRATOR</Text></Card><Pressable onPress={onLogout} style={[styles.addButton, { backgroundColor: '#FCE7E5', borderColor: '#F4BBB6' }]}><Text style={[styles.addButtonText, { color: Colors.expense }]}>Đăng xuất tài khoản</Text></Pressable></View>; }

const styles = StyleSheet.create({ hero: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primaryDark, borderRadius: 22, padding: 21, marginBottom: 4 }, eyebrow: { color: '#A4D6CA', fontSize: 11, fontWeight: '900', letterSpacing: 1.8 }, brand: { color: Colors.white, fontSize: 24, fontWeight: '900', marginTop: 6 }, welcome: { color: '#C8E5DE', fontSize: 14, marginTop: 4 }, logout: { borderWidth: 1, borderColor: '#5C9186', borderRadius: 12, paddingHorizontal: 13, paddingVertical: 9 }, logoutText: { color: Colors.white, fontWeight: '800' }, nav: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, navItem: { width: '23%', minHeight: 65, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, gap: 4 }, navItemActive: { backgroundColor: Colors.primarySoft, borderColor: '#A6D5C9' }, navIcon: { color: Colors.muted, fontSize: 20, fontWeight: '800' }, navLabel: { color: Colors.muted, fontSize: 11, fontWeight: '700', textAlign: 'center' }, navTextActive: { color: Colors.primary }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, metric: { width: '48%', minHeight: 128, padding: 15, gap: 7 }, metricIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: Colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, metricValue: { color: Colors.text, fontSize: 25, fontWeight: '900' }, metricLabel: { color: Colors.muted, fontSize: 13, lineHeight: 18 }, row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }, rowTitle: { color: Colors.text, fontSize: 16, fontWeight: '800' }, rowMeta: { color: Colors.muted, fontSize: 13, lineHeight: 19 }, rowActions: { gap: 12, alignItems: 'flex-end' }, action: { color: Colors.primary, fontWeight: '800', fontSize: 14 }, badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 7, overflow: 'hidden', fontSize: 12, fontWeight: '800' }, active: { color: Colors.income, backgroundColor: '#E1F5EC' }, locked: { color: Colors.expense, backgroundColor: '#FCE7E5' }, pending: { color: Colors.warning, backgroundColor: '#FFF2D9' }, addButton: { minHeight: 52, borderRadius: 14, borderWidth: 1, borderColor: '#A6D5C9', backgroundColor: Colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, addButtonText: { color: Colors.primary, fontSize: 16, fontWeight: '800' }, listRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 15 }, categoryIcon: { fontSize: 28, width: 34, textAlign: 'center' }, feature: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#FFF8E8', borderColor: '#F3DEAA' }, featureIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.warning, color: Colors.white, fontSize: 24, fontWeight: '900', textAlign: 'center', lineHeight: 38 }, feedbackMessage: { color: Colors.text, fontSize: 14, lineHeight: 20, marginTop: 3 }, empty: { color: Colors.muted, textAlign: 'center', padding: 20 }, cardTitle: { color: Colors.text, fontSize: 18, fontWeight: '800', marginBottom: 8 }, statLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: Colors.border }, note: { color: Colors.muted, fontSize: 13, lineHeight: 20 }, profile: { alignItems: 'center', gap: 7, paddingVertical: 28 }, avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 5 }, avatarText: { color: Colors.white, fontSize: 32, fontWeight: '900' }, profileName: { color: Colors.text, fontSize: 22, fontWeight: '900' }, role: { color: Colors.primary, fontSize: 12, fontWeight: '900', letterSpacing: 1.5, marginTop: 4 } });
