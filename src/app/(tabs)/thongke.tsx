import { useCallback, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Svg, { Circle, G, Line, Path, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import { Card, EmptyState, Header, Loading, Screen } from '@/thanhphan/dungchung/UI';
import { statisticsService } from '@/dichvu';
import type { CategoryStatistic, MonthlyStatistic, Overview } from '@/kieudulieu';
import { Colors } from '@/hangso/colors';
import { apiMessage, formatCurrency } from '@/tienich/dinhdang';

const palette = ['#126A5B', '#E59B32', '#D95151', '#4D7FC1', '#8D63B8', '#28A6A6', '#8A9A5B'];
const point = (cx: number, cy: number, radius: number, angle: number) => ({ x: cx + radius * Math.cos((angle - 90) * Math.PI / 180), y: cy + radius * Math.sin((angle - 90) * Math.PI / 180) });
function arc(cx: number, cy: number, radius: number, start: number, end: number) { const from = point(cx, cy, radius, end); const to = point(cx, cy, radius, start); return `M ${cx} ${cy} L ${from.x} ${from.y} A ${radius} ${radius} 0 ${end - start > 180 ? 1 : 0} 0 ${to.x} ${to.y} Z`; }

function PieChart({ items }: { items: CategoryStatistic[] }) {
  const expenses = items.filter(item => item.type === 'expense' && Number(item.total) > 0); const total = expenses.reduce((sum, item) => sum + Number(item.total), 0);
  if (!total) return <EmptyState title="Chưa có chi tiêu" description="Biểu đồ sẽ xuất hiện khi có giao dịch chi." />;
  return <View style={{ alignItems: 'center', gap: 12 }}><Svg width={220} height={220}><G>{expenses.map((item, index) => { const start = expenses.slice(0, index).reduce((sum, current) => sum + Number(current.total) / total * 360, 0); const sweep = Number(item.total) / total * 360; const end = start + sweep; return sweep >= 359.99 ? <Circle key={item.id} cx={110} cy={110} r={88} fill={palette[index % palette.length]} /> : <Path key={item.id} d={arc(110, 110, 88, start, end)} fill={palette[index % palette.length]} />; })}<Circle cx={110} cy={110} r={45} fill={Colors.surface} /><SvgText x={110} y={106} textAnchor="middle" fill={Colors.muted} fontSize={12}>Tổng chi</SvgText><SvgText x={110} y={126} textAnchor="middle" fill={Colors.text} fontSize={13} fontWeight="bold">{Math.round(total / 1000)}K</SvgText></G></Svg>
    <View style={{ width: '100%', gap: 8 }}>{expenses.map((item, index) => <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: palette[index % palette.length] }} /><Text style={{ flex: 1, color: Colors.text }}>{item.icon} {item.name}</Text><Text style={{ color: Colors.muted }}>{Math.round(Number(item.total) / total * 100)}%</Text><Text style={{ fontWeight: '700', color: Colors.expense }}>{formatCurrency(item.total)}</Text></View>)}</View>
  </View>;
}

function MonthlyCharts({ items }: { items: MonthlyStatistic[] }) {
  if (!items.length) return <EmptyState title="Chưa có dữ liệu theo tháng" />;
  const width = 320, height = 180, bottom = 28, top = 12; const max = Math.max(1, ...items.flatMap(item => [Number(item.income), Number(item.expense)])); const slot = width / 12; const y = (value: number) => height - bottom - value / max * (height - bottom - top);
  const values = Array.from({ length: 12 }, (_, index) => items.find(item => Number(item.month) === index + 1) || { month: index + 1, income: 0, expense: 0 });
  const netMax = Math.max(1, ...values.map(item => Math.abs(Number(item.income) - Number(item.expense)))); const netY = (value: number) => 90 - value / netMax * 68; const points = values.map((item, index) => `${index * slot + slot / 2},${netY(Number(item.income) - Number(item.expense))}`).join(' ');
  return <View style={{ gap: 18 }}><Text style={{ fontWeight: '800', color: Colors.text }}>Biểu đồ cột thu – chi</Text><View style={{ alignItems: 'center' }}><Svg width={width} height={height}><Line x1={0} y1={height - bottom} x2={width} y2={height - bottom} stroke={Colors.border} />{values.map((item, index) => { const x = index * slot + 3; const incomeY = y(Number(item.income)); const expenseY = y(Number(item.expense)); return <G key={item.month}><Rect x={x} y={incomeY} width={8} height={height - bottom - incomeY} rx={2} fill={Colors.income} /><Rect x={x + 10} y={expenseY} width={8} height={height - bottom - expenseY} rx={2} fill={Colors.expense} /><SvgText x={x + 9} y={height - 9} textAnchor="middle" fontSize={9} fill={Colors.muted}>{item.month}</SvgText></G>; })}</Svg></View>
    <Text style={{ fontWeight: '800', color: Colors.text }}>Biểu đồ đường số tiền còn lại</Text><View style={{ alignItems: 'center' }}><Svg width={width} height={180}><Line x1={0} y1={90} x2={width} y2={90} stroke={Colors.border} strokeDasharray="4 4" /><Polyline points={points} fill="none" stroke={Colors.primary} strokeWidth={3} />{values.map((item, index) => <G key={item.month}><Circle cx={index * slot + slot / 2} cy={netY(Number(item.income) - Number(item.expense))} r={3.5} fill={Colors.primary} /><SvgText x={index * slot + slot / 2} y={172} textAnchor="middle" fontSize={9} fill={Colors.muted}>{item.month}</SvgText></G>)}</Svg></View>
  </View>;
}

export default function Statistics() {
  const [overview, setOverview] = useState<Overview>(); const [categories, setCategories] = useState<CategoryStatistic[]>([]); const [months, setMonths] = useState<MonthlyStatistic[]>([]); const [year, setYear] = useState(new Date().getFullYear()); const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { try { setLoading(true); const [overviewResult, categoryResult, monthResult] = await Promise.all([statisticsService.overview({ start_date: `${year}-01-01`, end_date: `${year}-12-31` }), statisticsService.category({ start_date: `${year}-01-01`, end_date: `${year}-12-31` }), statisticsService.monthly(year)]); setOverview(overviewResult.data); setCategories(categoryResult.data); setMonths(monthResult.data); } catch (error) { Alert.alert('Lỗi', apiMessage(error)); } finally { setLoading(false); } }, [year]);
  useFocusEffect(useCallback(() => { load(); }, [load])); if (loading || !overview) return <Screen><Loading /></Screen>;
  return <Screen><Header title="Thống kê tài chính" subtitle="Theo dõi dòng tiền và xu hướng chi tiêu" /><View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20 }}><Pressable onPress={() => setYear(value => value - 1)}><Text style={{ fontSize: 24, color: Colors.primary }}>‹</Text></Pressable><Text style={{ fontSize: 18, fontWeight: '900', color: Colors.text }}>Năm {year}</Text><Pressable onPress={() => setYear(value => value + 1)}><Text style={{ fontSize: 24, color: Colors.primary }}>›</Text></Pressable></View>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}><Card style={{ width: '48%' }}><Text style={{ color: Colors.muted }}>Tổng thu</Text><Text style={{ color: Colors.income, fontWeight: '900', marginTop: 6 }}>{formatCurrency(overview.total_income)}</Text></Card><Card style={{ width: '48%' }}><Text style={{ color: Colors.muted }}>Tổng chi</Text><Text style={{ color: Colors.expense, fontWeight: '900', marginTop: 6 }}>{formatCurrency(overview.total_expense)}</Text></Card><Card style={{ width: '100%' }}><Text style={{ color: Colors.muted }}>Còn lại</Text><Text style={{ color: Number(overview.remaining) >= 0 ? Colors.primary : Colors.expense, fontWeight: '900', fontSize: 20, marginTop: 6 }}>{formatCurrency(overview.remaining)}</Text></Card></View>
    <Card style={{ gap: 12 }}><Text style={{ fontSize: 18, fontWeight: '800', color: Colors.text }}>Chi tiêu theo danh mục</Text><PieChart items={categories} /></Card><Card style={{ gap: 12 }}><MonthlyCharts items={months} /></Card>
  </Screen>;
}
