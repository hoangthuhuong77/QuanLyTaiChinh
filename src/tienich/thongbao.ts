import { Platform } from 'react-native';

export async function configureNotifications(){
  if(Platform.OS==='web')return;
  const Notifications=await import('expo-notifications');
  Notifications.setNotificationHandler({handleNotification:async()=>({shouldShowBanner:true,shouldShowList:true,shouldPlaySound:false,shouldSetBadge:false})});
}

export async function scheduleReminder(kind:'transaction'|'saving'){
  if(Platform.OS==='web')throw new Error('Nhắc việc cục bộ chỉ hỗ trợ trên điện thoại.');
  const Notifications=await import('expo-notifications');
  const permission=await Notifications.requestPermissionsAsync();
  if(!permission.granted)throw new Error('Bạn chưa cấp quyền thông báo.');
  if(Platform.OS==='android')await Notifications.setNotificationChannelAsync('reminders',{name:'Nhắc việc tài chính',importance:Notifications.AndroidImportance.DEFAULT});
  const content=kind==='transaction'?{title:'Ghi lại giao dịch 📝',body:'Bạn có khoản thu hoặc chi nào cần cập nhật hôm nay?'}:{title:'Mục tiêu tiết kiệm 🎯',body:'Hãy kiểm tra và cập nhật tiến độ mục tiêu của bạn.'};
  await Notifications.scheduleNotificationAsync({content,trigger:{type:Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,seconds:kind==='transaction'?86400:604800,repeats:true,channelId:'reminders'}});
}
