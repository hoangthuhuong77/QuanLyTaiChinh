export type TransactionType = 'income' | 'expense';
export interface User { id:number; full_name:string; email:string; username:string; phone?:string|null; created_at:string }
export interface AuthResponse { token:string; user:User }
export interface Wallet { id:number; name:string; type:string; initial_balance:number; current_balance:number; description?:string; created_at:string }
export interface Category { id:number; name:string; type:TransactionType; icon?:string; created_at:string }
export interface Transaction { id:number; wallet_id:number; category_id:number; type:TransactionType; amount:number; description?:string; transaction_date:string; wallet_name:string; category_name:string; category_icon?:string }
export interface Budget { id:number; category_id:number; category_name:string; icon?:string; amount_limit:number; month:number; year:number; spent:number; remaining:number; progress:number }
export interface SavingsGoal { id:number; name:string; target_amount:number; current_amount:number; deadline?:string; status:'active'|'completed'|'paused'; progress:number }
export interface Overview { total_income:number; total_expense:number; total_balance:number; recent:Transaction[] }
export interface CategoryStatistic { id:number; name:string; icon?:string; type:TransactionType; total:number }
export interface MonthlyStatistic { month:number; income:number; expense:number }
