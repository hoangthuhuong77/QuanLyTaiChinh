import { Pressable, Text, View } from 'react-native';
import type { Transaction } from '@/kieudulieu';
import { router } from '@/tienich/router';
import { Card } from '@/thanhphan/dungchung/UI';
import { Colors } from '@/hangso/colors';
import { formatCurrency, formatDate } from '@/tienich/dinhdang';

export function TransactionItem({ item }: { item: Transaction }) {
  const income = item.type === 'income';
  return <Pressable onPress={() => router.push(`/giaodich/${item.id}`)}><Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 }}>
    <View style={{ width: 49, height: 49, borderRadius: 15, backgroundColor: income ? '#DDF4EA' : '#FCE7E7', alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 24 }}>{item.category_icon || (income ? '↙' : '↗')}</Text></View>
    <View style={{ flex: 1 }}><Text style={{ fontWeight: '800', fontSize: 17, color: Colors.text }}>{item.category_name}</Text><Text style={{ color: Colors.muted, fontSize: 14, marginTop: 3 }}>{item.wallet_name} · {formatDate(item.transaction_date)}</Text></View>
    <Text style={{ fontWeight: '800', fontSize: 16, color: income ? Colors.income : Colors.expense }}>{income ? '+' : '−'}{formatCurrency(item.amount)}</Text>
  </Card></Pressable>;
}
