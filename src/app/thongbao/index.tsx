import { useCallback,useState } from 'react';
import { Alert,Pressable,Text,View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { notificationService } from '@/dichvu';
import type { AppNotification } from '@/kieudulieu';
import { Button,Card,EmptyState,Header,Loading,Screen } from '@/thanhphan/dungchung/UI';
import { Colors } from '@/hangso/colors';
import { apiMessage,formatDate } from '@/tienich/dinhdang';
import { scheduleReminder } from '@/tienich/thongbao';

export default function NotificationsScreen(){
  const [items,setItems]=useState<AppNotification[]>([]);const [unread,setUnread]=useState(0);const [loading,setLoading]=useState(true);
  const load=useCallback(async()=>{try{const {data}=await notificationService.list();setItems(data.items);setUnread(data.unread_count);}finally{setLoading(false)}},[]);useFocusEffect(useCallback(()=>{load()},[load]));
  const remind=async(kind:'transaction'|'saving')=>{try{await scheduleReminder(kind);Alert.alert('Đã bật nhắc việc',kind==='transaction'?'Ứng dụng sẽ nhắc nhập giao dịch mỗi ngày.':'Ứng dụng sẽ nhắc mục tiêu mỗi tuần.');}catch(error){Alert.alert('Không thể bật',apiMessage(error))}};
  const markAll=async()=>{await notificationService.markAllRead();await load()};const remove=async(id:number)=>{await notificationService.remove(id);await load()};
  return <Screen><Header title="Thông báo" subtitle={`${unread} thông báo chưa đọc`}/><Card style={{gap:10}}><Text style={{fontWeight:'800',color:Colors.text}}>Nhắc việc trên điện thoại</Text><Button title="Nhắc nhập giao dịch hằng ngày" variant="secondary" onPress={()=>remind('transaction')}/><Button title="Nhắc mục tiêu tiết kiệm hằng tuần" variant="secondary" onPress={()=>remind('saving')}/></Card>{unread>0?<Button title="Đánh dấu tất cả đã đọc" variant="secondary" onPress={markAll}/>:null}{loading?<Loading/>:items.length?items.map(item=><Pressable key={item.id} onPress={async()=>{if(!item.is_read){await notificationService.markRead(item.id);load()}}}><Card style={{gap:7,borderColor:item.is_read?Colors.border:Colors.primary}}><View style={{flexDirection:'row',gap:8}}><Text style={{flex:1,fontWeight:'800',color:Colors.text}}>{item.type==='budget'?'⚠️':'🔔'} {item.title}</Text>{!item.is_read?<View style={{width:9,height:9,borderRadius:5,backgroundColor:Colors.primary}}/>:null}</View><Text style={{color:Colors.muted}}>{item.message}</Text><View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{color:Colors.muted,fontSize:12}}>{formatDate(item.created_at)}</Text><Pressable onPress={()=>remove(item.id)}><Text style={{color:Colors.expense,fontWeight:'700'}}>Xóa</Text></Pressable></View></Card></Pressable>):<EmptyState title="Chưa có thông báo" description="Cảnh báo ngân sách sẽ xuất hiện tại đây."/>}</Screen>;
}
