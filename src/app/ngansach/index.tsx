import { useCallback, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { router } from '@/tienich/router';
import type { Budget } from '@/kieudulieu';
import { budgetService } from '@/dichvu';
import { Button, Card, EmptyState, Header, Loading, Screen } from '@/thanhphan/dungchung/UI';
import { Colors } from '@/hangso/colors';
import { apiMessage, formatCurrency } from '@/tienich/dinhdang';

function statusOf(progress: number) {
  if (progress > 100) return { text: 'Đã vượt ngân sách', color: Colors.expense, icon: '🚨' };
  if (progress >= 100) return { text: 'Đã dùng hết ngân sách', color: Colors.expense, icon: '⛔' };
  if (progress >= 80) return { text: 'Sắp đạt giới hạn', color: Colors.warning, icon: '⚠️' };
  return { text: 'Trong giới hạn', color: Colors.income, icon: '✓' };
}

export default function Budgets() {
  const [items, setItems] = useState<Budget[]>([]); const [loading, setLoading] = useState(true);
  const load = useCallback(() => budgetService.list().then(result => setItems(result.data)).catch(error => Alert.alert('Lỗi', apiMessage(error))).finally(() => setLoading(false)), []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const remove = (item: Budget) => Alert.alert('Xóa ngân sách?', item.category_name, [{ text: 'Hủy' }, { text: 'Xóa', style: 'destructive', onPress: async () => { try { await budgetService.remove(item.id); load(); } catch (error) { Alert.alert('Lỗi', apiMessage(error)); } } }]);
  return <Screen><Header title="Ngân sách" subtitle="Theo dõi giới hạn chi tiêu theo từng danh mục" /><Button title="+ Tạo ngân sách" onPress={() => router.push('/ngansach/them')} />
    {loading ? <Loading /> : items.length ? items.map(item => { const progress = Number(item.progress); const status = statusOf(progress); return <Card key={item.id} style={{ gap: 9 }}>
      <View style={{ flexDirection: 'row' }}><Text style={{ flex: 1, fontWeight: '800', fontSize: 17, color: Colors.text }}>{item.icon} {item.category_name}</Text><Text style={{ color: Colors.muted }}>T{item.month}/{item.year}</Text></View>
      <View style={{ height: 10, backgroundColor: Colors.primarySoft, borderRadius: 5, overflow: 'hidden' }}><View style={{ height: 10, width: `${Math.min(progress, 100)}%`, backgroundColor: status.color, borderRadius: 5 }} /></View>
      <Text style={{ color: Colors.muted }}>Đã chi {formatCurrency(item.spent)} / {formatCurrency(item.amount_limit)}</Text>
      <Text style={{ fontWeight: '800', color: status.color }}>{status.icon} {status.text} · {Math.round(progress)}%</Text>
      <Text style={{ color: Number(item.remaining) < 0 ? Colors.expense : Colors.text }}>Còn lại: {formatCurrency(item.remaining)}</Text>
      <View style={{ flexDirection: 'row', gap: 18 }}><Pressable onPress={() => router.push(`/ngansach/${item.id}/sua`)}><Text style={{ color: Colors.primary, fontWeight: '700' }}>Chỉnh sửa</Text></Pressable><Pressable onPress={() => remove(item)}><Text style={{ color: Colors.expense, fontWeight: '700' }}>Xóa</Text></Pressable></View>
    </Card>; }) : <EmptyState title="Chưa có ngân sách" />}
  </Screen>;
}
