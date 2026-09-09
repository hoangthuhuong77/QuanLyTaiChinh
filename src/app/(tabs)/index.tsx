import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Card, EmptyState, Header, Loading, Screen } from '@/thanhphan/dungchung/UI';
import { Colors } from '@/hangso/colors';
import { notificationService, statisticsService, walletService } from '@/dichvu';
import type { Overview, Wallet } from '@/kieudulieu';
import { formatCurrency } from '@/tienich/dinhdang';
import { router } from '@/tienich/router';
import { TransactionItem } from '@/thanhphan/giaodich/TransactionItem';

const quickActions = [
  { icon: '↓', label: 'Khoản thu', href: '/them?type=income' },
  { icon: '↑', label: 'Khoản chi', href: '/them?type=expense' },
  { icon: '⇄', label: 'Chuyển tiền', href: '/chuyentien' },
  { icon: '▥', label: 'Thống kê', href: '/thongke' },
];

const walletLabels: Record<string, string> = { cash: 'Tiền mặt', bank: 'Ngân hàng', 'e-wallet': 'Ví điện tử', saving: 'Tiết kiệm' };

export default function Home() {
  const [data, setData] = useState<Overview | null>(null); const [wallets, setWallets] = useState<Wallet[]>([]); const [unread, setUnread] = useState(0); const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { try { const [overview, walletResult, notifications] = await Promise.all([statisticsService.overview(), walletService.list(), notificationService.list()]); setData(overview.data); setWallets(walletResult.data); setUnread(notifications.data.unread_count); } finally { setLoading(false); } }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  if (loading) return <Screen><Loading /></Screen>;
  return <Screen>
    <Header title="Xin chào bạn!" subtitle="Tổng quan tài chính tháng này" right={<Pressable onPress={() => router.push('/thongbao')} style={{ padding: 12 }}><Text style={{ fontSize: 27 }}>🔔</Text>{unread > 0 ? <View style={{ position: 'absolute', right: 3, top: 3, minWidth: 20, height: 20, borderRadius: 10, backgroundColor: Colors.expense, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: Colors.white, fontSize: 12, fontWeight: '800' }}>{unread}</Text></View> : null}</Pressable>} />
    <Card style={{ backgroundColor: Colors.primary, borderColor: Colors.primary, gap: 11 }}><Text style={{ color: '#C9E8E0', fontSize: 16 }}>Tổng số dư</Text><Text style={{ fontSize: 34, fontWeight: '900', color: Colors.white }}>{formatCurrency(data?.total_balance || 0)}</Text><View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}><View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,.13)', padding: 14, borderRadius: 14 }}><Text style={{ color: '#D8EFE9', fontSize: 14 }}>Thu nhập tháng</Text><Text style={{ color: Colors.white, fontWeight: '800', fontSize: 16, marginTop: 4 }}>{formatCurrency(data?.total_income || 0)}</Text></View><View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,.13)', padding: 14, borderRadius: 14 }}><Text style={{ color: '#D8EFE9', fontSize: 14 }}>Chi tiêu tháng</Text><Text style={{ color: Colors.white, fontWeight: '800', fontSize: 16, marginTop: 4 }}>{formatCurrency(data?.total_expense || 0)}</Text></View></View><View style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,.2)', paddingTop: 11, marginTop: 3 }}><Text style={{ color: '#D8EFE9', fontSize: 14 }}>Còn lại trong tháng</Text><Text style={{ color: Colors.white, fontSize: 20, fontWeight: '900', marginTop: 3 }}>{formatCurrency(data?.remaining || 0)}</Text></View></Card>
    <Text style={{ fontSize: 21, fontWeight: '800', color: Colors.text }}>Chức năng nhanh</Text><View style={{ flexDirection: 'row', gap: 8 }}>{quickActions.map(action => <Pressable key={action.label} onPress={() => router.push(action.href)} style={{ flex: 1, alignItems: 'center', gap: 7, paddingVertical: 4 }}><View style={{ width: 54, height: 54, borderRadius: 17, backgroundColor: Colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 27, color: Colors.primary }}>{action.icon}</Text></View><Text style={{ fontSize: 13, color: Colors.text, textAlign: 'center', fontWeight: '700' }}>{action.label}</Text></Pressable>)}</View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={{ fontSize: 21, fontWeight: '800', color: Colors.text }}>Các ví tiền</Text><Pressable onPress={() => router.push('/vitien')}><Text style={{ color: Colors.primary, fontWeight: '700', fontSize: 16 }}>Xem tất cả</Text></Pressable></View>
    <View style={{ gap: 10 }}>{wallets.slice(0, 3).map(wallet => <Card key={wallet.id} style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}><View style={{ flex: 1 }}><Text style={{ color: Colors.muted, fontSize: 14 }}>{walletLabels[wallet.type] || wallet.type}</Text><Text style={{ fontWeight: '800', color: Colors.text, fontSize: 17, marginTop: 3 }}>{wallet.name}</Text></View><Text style={{ fontWeight: '900', color: Colors.primary, fontSize: 17 }}>{formatCurrency(wallet.current_balance)}</Text></Card>)}</View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={{ fontSize: 21, fontWeight: '800', color: Colors.text }}>Giao dịch gần đây</Text><Pressable onPress={() => router.push('/giaodich')}><Text style={{ color: Colors.primary, fontWeight: '700', fontSize: 16 }}>Xem thêm</Text></Pressable></View>
    {data?.recent?.length ? data.recent.map(item => <TransactionItem key={item.id} item={item} />) : <EmptyState title="Chưa có giao dịch" description="Dùng chức năng nhanh để ghi lại khoản thu hoặc chi đầu tiên." />}
  </Screen>;
}
