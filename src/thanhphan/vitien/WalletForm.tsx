import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import type { Wallet } from '@/kieudulieu';
import { Button, Card, Field } from '@/thanhphan/dungchung/UI';
import { walletService } from '@/dichvu';
import { Colors } from '@/hangso/colors';
import { apiMessage } from '@/tienich/dinhdang';

const walletTypes = [
  { value: 'cash', label: 'Tiền mặt', icon: '💵' }, { value: 'bank', label: 'Ngân hàng', icon: '🏦' },
  { value: 'e-wallet', label: 'Ví điện tử', icon: '📱' }, { value: 'saving', label: 'Tiết kiệm', icon: '🐷' },
];

export function WalletForm({ initial }: { initial?: Wallet }) {
  const [name, setName] = useState(initial?.name || '');
  const [type, setType] = useState(initial?.type || 'cash');
  const [balance, setBalance] = useState(initial ? String(initial.initial_balance) : '0');
  const [description, setDescription] = useState(initial?.description || '');
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    if (!name.trim() || (!initial && !Number.isFinite(Number(balance)))) return Alert.alert('Dữ liệu chưa hợp lệ', 'Nhập tên ví và số dư hợp lệ.');
    try {
      setSaving(true);
      const data = { name: name.trim(), type, initial_balance: Number(balance), description };
      if (initial) await walletService.update(initial.id, data); else await walletService.create(data);
      Alert.alert('Thành công', 'Đã lưu ví tiền.'); router.back();
    } catch (error) { Alert.alert('Lỗi', apiMessage(error)); } finally { setSaving(false); }
  };
  return <Card style={{ gap: 14 }}>
    <Field label="Tên ví" value={name} onChangeText={setName} placeholder="Ví dụ: Vietcombank" />
    <Text style={{ fontWeight: '700', color: Colors.text }}>Loại ví</Text>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{walletTypes.map(item => <Pressable key={item.value} onPress={() => setType(item.value)} style={{ width: '48%', padding: 12, borderRadius: 13, borderWidth: 1, borderColor: type === item.value ? Colors.primary : Colors.border, backgroundColor: type === item.value ? Colors.primarySoft : Colors.surface }}><Text style={{ color: type === item.value ? Colors.primary : Colors.text, fontWeight: '700' }}>{item.icon} {item.label}</Text></Pressable>)}</View>
    {!initial ? <Field label="Số dư ban đầu" value={balance} onChangeText={setBalance} keyboardType="numeric" placeholder="0" /> : null}
    <Field label="Mô tả" value={description} onChangeText={setDescription} multiline placeholder="Ghi chú về ví" />
    <Button title={initial ? 'Lưu thay đổi' : 'Thêm ví'} onPress={submit} loading={saving} />
  </Card>;
}
