import { useEffect, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Field } from '@/thanhphan/dungchung/UI';
import { categoryService, transactionService, walletService } from '@/dichvu';
import type { Category, Transaction, TransactionType, Wallet } from '@/kieudulieu';
import { Colors } from '@/hangso/colors';
import { apiMessage, today } from '@/tienich/dinhdang';

function Choice({ selected, label, onPress }: { selected:boolean; label:string; onPress:() => void }) {
  return <Pressable onPress={onPress} style={{ paddingHorizontal:14, paddingVertical:11, borderRadius:12, borderWidth:1, borderColor:selected ? Colors.primary : Colors.border, backgroundColor:selected ? Colors.primarySoft : Colors.surface }}><Text style={{ color:selected ? Colors.primary : Colors.text, fontWeight:'700' }}>{label}</Text></Pressable>;
}

export function TransactionForm({ initial, defaultType='expense' }: { initial?:Transaction; defaultType?:TransactionType }) {
  const [type, setType] = useState<TransactionType>(initial?.type || defaultType);
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const [description, setDescription] = useState(initial?.description || '');
  const [date, setDate] = useState(initial?.transaction_date?.slice(0, 10) || today());
  const [walletId, setWalletId] = useState(initial?.wallet_id);
  const [selectedCategoryId, setSelectedCategoryId] = useState(initial?.category_id);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([walletService.list(), categoryService.list()]).then(([walletResult, categoryResult]) => {
      setWallets(walletResult.data);
      setCategories(categoryResult.data);
      setWalletId((current) => current ?? walletResult.data[0]?.id);
    });
  }, []);

  const visibleCategories = categories.filter((category) => category.type === type);
  const categoryId = visibleCategories.some((category) => category.id === selectedCategoryId) ? selectedCategoryId : visibleCategories[0]?.id;

  const submit = async () => {
    if (!walletId || !categoryId || Number(amount) <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return Alert.alert('Dữ liệu chưa hợp lệ', 'Chọn ví, danh mục; nhập số tiền lớn hơn 0 và ngày dạng YYYY-MM-DD.');
    try {
      setSaving(true);
      const data = { wallet_id:walletId, category_id:categoryId, type, amount:Number(amount), description, transaction_date:date };
      if (initial) await transactionService.update(initial.id, data); else await transactionService.create(data);
      Alert.alert('Thành công', initial ? 'Đã cập nhật giao dịch.' : 'Đã thêm giao dịch.');
      router.back();
    } catch (error) { Alert.alert('Không thể lưu', apiMessage(error)); }
    finally { setSaving(false); }
  };

  return <Card style={{ gap:16 }}><Text style={{ fontWeight:'800', color:Colors.text }}>Loại giao dịch</Text><View style={{ flexDirection:'row', gap:10 }}><Choice selected={type==='expense'} label="Chi tiêu" onPress={() => setType('expense')}/><Choice selected={type==='income'} label="Thu nhập" onPress={() => setType('income')}/></View><Field label="Số tiền (VNĐ)" value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0"/><Text style={{ fontWeight:'800', color:Colors.text }}>Ví tiền</Text><View style={{ flexDirection:'row', flexWrap:'wrap', gap:8 }}>{wallets.map((wallet) => <Choice key={wallet.id} selected={walletId===wallet.id} label={wallet.name} onPress={() => setWalletId(wallet.id)}/>)}</View><Text style={{ fontWeight:'800', color:Colors.text }}>Danh mục</Text><View style={{ flexDirection:'row', flexWrap:'wrap', gap:8 }}>{visibleCategories.map((category) => <Choice key={category.id} selected={categoryId===category.id} label={`${category.icon||'•'} ${category.name}`} onPress={() => setSelectedCategoryId(category.id)}/>)}</View><Field label="Ngày giao dịch" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD"/><Field label="Ghi chú" value={description} onChangeText={setDescription} placeholder="Nội dung giao dịch" multiline/><Button title={initial ? 'Lưu thay đổi' : 'Thêm giao dịch'} onPress={submit} loading={saving}/></Card>;
}
