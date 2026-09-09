import { useCallback, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { router } from '@/tienich/router';
import type { SavingsGoal } from '@/kieudulieu';
import { savingsService } from '@/dichvu';
import { Button, Card, EmptyState, Field, Header, Loading, Screen } from '@/thanhphan/dungchung/UI';
import { Colors } from '@/hangso/colors';
import { apiMessage, formatCurrency, formatDate } from '@/tienich/dinhdang';

export default function Goals() {
  const [items, setItems] = useState<SavingsGoal[]>([]); const [loading, setLoading] = useState(true); const [addingId, setAddingId] = useState<number>(); const [amount, setAmount] = useState(''); const [saving, setSaving] = useState(false);
  const load = useCallback(() => savingsService.list().then(result => setItems(result.data)).catch(error => Alert.alert('Lỗi', apiMessage(error))).finally(() => setLoading(false)), []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const updateGoal = async (item: SavingsGoal, nextAmount: number, status?: SavingsGoal['status']) => { try { setSaving(true); await savingsService.update(item.id, { name: item.name, target_amount: Number(item.target_amount), current_amount: nextAmount, deadline: item.deadline || null, status: status || (nextAmount >= Number(item.target_amount) ? 'completed' : 'active') }); setAddingId(undefined); setAmount(''); await load(); } catch (error) { Alert.alert('Lỗi', apiMessage(error)); } finally { setSaving(false); } };
  const addMoney = (item: SavingsGoal) => { const value = Number(amount); if (!Number.isFinite(value) || value <= 0) return Alert.alert('Số tiền chưa hợp lệ', 'Vui lòng nhập số tiền lớn hơn 0.'); updateGoal(item, Number(item.current_amount) + value); };
  const remove = (item: SavingsGoal) => Alert.alert('Xóa mục tiêu?', item.name, [{ text: 'Hủy' }, { text: 'Xóa', style: 'destructive', onPress: async () => { try { await savingsService.remove(item.id); load(); } catch (error) { Alert.alert('Lỗi', apiMessage(error)); } } }]);
  return <Screen><Header title="Mục tiêu tiết kiệm" subtitle="Biến kế hoạch thành những cột mốc rõ ràng" /><Button title="+ Thêm mục tiêu" onPress={() => router.push('/tietkiem/them')} />
    {loading ? <Loading /> : items.length ? items.map(item => <Card key={item.id} style={{ gap: 9 }}>
      <View style={{ flexDirection: 'row' }}><Text style={{ flex: 1, fontSize: 18, fontWeight: '800', color: Colors.text }}>{item.status === 'completed' ? '✅' : '🎯'} {item.name}</Text><Text style={{ fontWeight: '800', color: Colors.primary }}>{Math.round(Number(item.progress))}%</Text></View>
      <View style={{ height: 10, backgroundColor: Colors.primarySoft, borderRadius: 5, overflow: 'hidden' }}><View style={{ height: 10, width: `${Math.min(Number(item.progress), 100)}%`, backgroundColor: item.status === 'completed' ? Colors.income : Colors.primary, borderRadius: 5 }} /></View>
      <Text style={{ color: Colors.muted }}>{formatCurrency(item.current_amount)} / {formatCurrency(item.target_amount)}</Text>{item.deadline ? <Text style={{ color: Colors.muted }}>Hạn: {formatDate(item.deadline)}</Text> : null}
      {addingId === item.id ? <View style={{ gap: 8 }}><Field label="Số tiền muốn thêm" value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="500000" /><View style={{ flexDirection: 'row', gap: 8 }}><View style={{ flex: 1 }}><Button title="Hủy" variant="secondary" onPress={() => { setAddingId(undefined); setAmount(''); }} /></View><View style={{ flex: 1 }}><Button title="Xác nhận" loading={saving} onPress={() => addMoney(item)} /></View></View></View> : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        {item.status !== 'completed' ? <Pressable onPress={() => setAddingId(item.id)}><Text style={{ color: Colors.income, fontWeight: '700' }}>+ Thêm tiền</Text></Pressable> : null}
        {item.status !== 'completed' ? <Pressable onPress={() => updateGoal(item, Number(item.target_amount), 'completed')}><Text style={{ color: Colors.primary, fontWeight: '700' }}>Hoàn thành</Text></Pressable> : null}
        <Pressable onPress={() => router.push(`/tietkiem/${item.id}/sua`)}><Text style={{ color: Colors.primary, fontWeight: '700' }}>Cập nhật</Text></Pressable><Pressable onPress={() => remove(item)}><Text style={{ color: Colors.expense, fontWeight: '700' }}>Xóa</Text></Pressable>
      </View>
    </Card>) : <EmptyState title="Chưa có mục tiêu" />}
  </Screen>;
}
