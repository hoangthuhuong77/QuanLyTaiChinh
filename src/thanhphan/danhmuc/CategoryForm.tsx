import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import type { Category, TransactionType } from '@/kieudulieu';
import { categoryService } from '@/dichvu';
import { Button, Card, Field } from '@/thanhphan/dungchung/UI';
import { Colors } from '@/hangso/colors';
import { apiMessage } from '@/tienich/dinhdang';

const icons = ['🍜', '🛵', '🛍️', '🎮', '📚', '🏥', '🏠', '🧾', '💼', '💻', '🎁', '💰', '👨‍👩‍👧', '📌'];

export function CategoryForm({ initial }: { initial?: Category }) {
  const [name, setName] = useState(initial?.name || ''); const [type, setType] = useState<TransactionType>(initial?.type || 'expense');
  const [icon, setIcon] = useState(initial?.icon || '📌'); const [saving, setSaving] = useState(false);
  const submit = async () => {
    if (!name.trim()) return Alert.alert('Thiếu tên', 'Vui lòng nhập tên danh mục.');
    try { setSaving(true); const data = { name: name.trim(), type, icon }; if (initial) await categoryService.update(initial.id, data); else await categoryService.create(data); Alert.alert('Thành công', 'Đã lưu danh mục.'); router.back(); }
    catch (error) { Alert.alert('Lỗi', apiMessage(error)); } finally { setSaving(false); }
  };
  return <Card style={{ gap: 14 }}>
    <Field label="Tên danh mục" value={name} onChangeText={setName} placeholder="Ví dụ: Ăn uống" />
    <Text style={{ fontWeight: '700', color: Colors.text }}>Chọn biểu tượng</Text>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{icons.map(item => <Pressable key={item} onPress={() => setIcon(item)} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1, borderColor: icon === item ? Colors.primary : Colors.border, backgroundColor: icon === item ? Colors.primarySoft : Colors.surface }}><Text style={{ fontSize: 22 }}>{item}</Text></Pressable>)}</View>
    <Text style={{ fontWeight: '700', color: Colors.text }}>Loại danh mục</Text>
    <View style={{ flexDirection: 'row', gap: 10 }}>{(['expense', 'income'] as const).map(item => <Pressable key={item} onPress={() => setType(item)} style={{ flex: 1, padding: 12, borderRadius: 12, alignItems: 'center', backgroundColor: type === item ? Colors.primary : Colors.primarySoft }}><Text style={{ fontWeight: '700', color: type === item ? Colors.white : Colors.primary }}>{item === 'expense' ? 'Chi tiêu' : 'Thu nhập'}</Text></Pressable>)}</View>
    <Button title="Lưu danh mục" onPress={submit} loading={saving} />
  </Card>;
}
