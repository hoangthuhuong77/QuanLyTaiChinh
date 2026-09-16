import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Button, Card, Field } from '@/thanhphan/dungchung/UI';
import { categoryService, transactionService, walletService } from '@/dichvu';
import type { Category, Transaction, TransactionType, Wallet } from '@/kieudulieu';
import { Colors } from '@/hangso/colors';
import { apiMessage, today } from '@/tienich/dinhdang';
import { showMessage } from '@/tienich/thongdiep';

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
  const [loadingChoices, setLoadingChoices] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoadingChoices(true);
    setLoadError('');
    Promise.all([walletService.list(), categoryService.list()]).then(([walletResult, categoryResult]) => {
      if (!active) return;
      setWallets(walletResult.data);
      setCategories(categoryResult.data);
      setWalletId((current) => walletResult.data.some((wallet) => wallet.id === current) ? current : walletResult.data[0]?.id);
    }).catch((error) => {
      if (active) setLoadError(apiMessage(error));
    }).finally(() => {
      if (active) setLoadingChoices(false);
    });
    return () => { active = false; };
  }, []));

  const visibleCategories = categories.filter((category) => category.type === type);
  const categoryId = visibleCategories.some((category) => category.id === selectedCategoryId) ? selectedCategoryId : visibleCategories[0]?.id;

  const submit = async () => {
    if (loadingChoices) return;
    const problem = loadError || (!wallets.length ? 'Bạn chưa có ví tiền. Hãy tạo ví trước khi thêm khoản thu hoặc chi.' : !visibleCategories.length ? 'Bạn chưa có danh mục phù hợp. Hãy tạo danh mục trước khi thêm giao dịch.' : !walletId || !categoryId || !Number.isFinite(Number(amount)) || Number(amount) <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(date) ? 'Chọn ví, danh mục; nhập số tiền lớn hơn 0 và ngày dạng YYYY-MM-DD.' : '');
    if (problem) {
      setFormError(problem);
      showMessage('Không thể lưu giao dịch', problem);
      return;
    }
    try {
      setFormError('');
      setSaving(true);
      const data = { wallet_id:walletId, category_id:categoryId, type, amount:Number(amount), description, transaction_date:date };
      if (initial) await transactionService.update(initial.id, data); else await transactionService.create(data);
      showMessage('Thành công', initial ? 'Đã cập nhật giao dịch.' : 'Đã thêm giao dịch.');
      router.back();
    } catch (error) { const message = apiMessage(error); setFormError(message); showMessage('Không thể lưu', message); }
    finally { setSaving(false); }
  };

  return <Card style={{ gap:16 }}>
    <Text style={{ fontWeight:'800', color:Colors.text }}>Loại giao dịch</Text>
    <View style={{ flexDirection:'row', gap:10 }}><Choice selected={type==='expense'} label="Chi tiêu" onPress={() => setType('expense')}/><Choice selected={type==='income'} label="Thu nhập" onPress={() => setType('income')}/></View>
    <Field label="Số tiền (VNĐ)" value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0"/>
    <Text style={{ fontWeight:'800', color:Colors.text }}>Ví tiền</Text>
    <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8 }}>{wallets.map((wallet) => <Choice key={wallet.id} selected={walletId===wallet.id} label={wallet.name} onPress={() => setWalletId(wallet.id)}/>)}</View>
    {!loadingChoices && !wallets.length && !loadError ? <><Text style={{ color:Colors.expense }}>Bạn cần tạo ví tiền trước khi ghi khoản thu hoặc chi.</Text><Button title="Tạo ví tiền đầu tiên" variant="secondary" onPress={() => router.push('/vitien/them')}/></> : null}
    <Text style={{ fontWeight:'800', color:Colors.text }}>Danh mục</Text>
    <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8 }}>{visibleCategories.map((category) => <Choice key={category.id} selected={categoryId===category.id} label={`${category.icon||'•'} ${category.name}`} onPress={() => setSelectedCategoryId(category.id)}/>)}</View>
    {!loadingChoices && !visibleCategories.length && !loadError ? <><Text style={{ color:Colors.expense }}>Chưa có danh mục {type === 'income' ? 'thu nhập' : 'chi tiêu'}.</Text><Button title="Tạo danh mục" variant="secondary" onPress={() => router.push('/danhmuc/them')}/></> : null}
    <Field label="Ngày giao dịch" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD"/>
    <Field label="Ghi chú" value={description} onChangeText={setDescription} placeholder="Nội dung giao dịch" multiline/>
    {loadError ? <Text style={{ color:Colors.expense }}>Không tải được ví/danh mục: {loadError}</Text> : null}
    {formError ? <Text style={{ color:Colors.expense }}>{formError}</Text> : null}
    <Button title={initial ? 'Lưu thay đổi' : 'Thêm giao dịch'} onPress={submit} loading={saving} disabled={loadingChoices || !!loadError}/>
  </Card>;
}
