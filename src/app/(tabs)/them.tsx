import { useLocalSearchParams } from 'expo-router';
import { Header,Screen } from '@/thanhphan/dungchung/UI';
import { TransactionForm } from '@/thanhphan/giaodich/TransactionForm';
import type { TransactionType } from '@/kieudulieu';

export default function AddTransaction(){
  const {type}=useLocalSearchParams<{type?:TransactionType}>();
  return <Screen><Header title="Thêm giao dịch" subtitle="Ghi lại khoản thu hoặc chi mới"/><TransactionForm defaultType={type==='income'?'income':'expense'}/></Screen>;
}
