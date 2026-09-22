export type TransactionType = 'income' | 'expense';
export interface User { id:number; full_name:string; email:string; username:string; phone?:string|null; avatar_url?:string|null; role?:'user'|'admin'; status?:'active'|'locked'; created_at:string }
export interface AuthResponse { token:string; user:User }
export interface Wallet { id:number; name:string; type:string; initial_balance:number; current_balance:number; description?:string; created_at:string }
export interface Category { id:number; name:string; type:TransactionType; icon?:string; created_at:string }
export interface Transaction { id:number; wallet_id:number; category_id:number; type:TransactionType; amount:number; description?:string; transaction_date:string; wallet_name:string; category_name:string; category_icon?:string }
export interface Budget { id:number; category_id:number; category_name:string; icon?:string; amount_limit:number; month:number; year:number; spent:number; remaining:number; progress:number }
export interface SavingsGoal { id:number; name:string; target_amount:number; current_amount:number; deadline?:string; status:'active'|'completed'|'paused'; progress:number }
export interface Overview { total_income:number; total_expense:number; total_balance:number; remaining:number; recent:Transaction[] }
export interface CategoryStatistic { id:number; name:string; icon?:string; type:TransactionType; total:number }
export interface MonthlyStatistic { month:number; income:number; expense:number }
export interface Transfer { id:number; from_wallet_id:number; to_wallet_id:number; from_wallet_name:string; to_wallet_name:string; amount:number; description?:string; transfer_date:string; created_at:string }
export interface AppNotification { id:number; type:string; title:string; message:string; is_read:boolean|number; created_at:string }
export interface NotificationResponse { items:AppNotification[]; unread_count:number }
