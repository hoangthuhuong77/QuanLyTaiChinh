import { api } from './api';
import type { AdminDashboard,AdminFeedback,AdminStatistics,AdminUsersResponse,AppNotification,AuthResponse,Budget,Category,CategoryStatistic,MonthlyStatistic,NotificationResponse,Overview,SavingsGoal,Transaction,Transfer,User,Wallet } from '@/kieudulieu';
export const authService={register:(data:object)=>api.post<AuthResponse>('/auth/register',data),login:(data:object)=>api.post<AuthResponse>('/auth/login',data),profile:()=>api.get<User>('/auth/profile'),updateProfile:(data:object)=>api.put<User>('/auth/profile',data),changePassword:(data:object)=>api.put('/auth/change-password',data)};
const crud=<T>(path:string)=>({list:(params?:object)=>api.get<T[]>(path,{params}),detail:(id:string|number)=>api.get<T>(`${path}/${id}`),create:(data:object)=>api.post<T>(path,data),update:(id:string|number,data:object)=>api.put<T>(`${path}/${id}`,data),remove:(id:string|number)=>api.delete(`${path}/${id}`)});
export const walletService=crud<Wallet>('/wallets');export const categoryService=crud<Category>('/categories');export const transactionService=crud<Transaction>('/transactions');export const budgetService=crud<Budget>('/budgets');export const savingsService=crud<SavingsGoal>('/savings-goals');
export const transferService={list:()=>api.get<Transfer[]>('/transfers'),create:(data:object)=>api.post('/transfers',data)};
export const notificationService={list:()=>api.get<NotificationResponse>('/notifications'),markRead:(id:number)=>api.put(`/notifications/${id}/read`),markAllRead:()=>api.put('/notifications/read-all'),remove:(id:number)=>api.delete(`/notifications/${id}`)};
export const statisticsService={overview:(params?:object)=>api.get<Overview>('/statistics/overview',{params}),category:(params?:object)=>api.get<CategoryStatistic[]>('/statistics/category',{params}),monthly:(year?:number)=>api.get<MonthlyStatistic[]>('/statistics/monthly',{params:{year}})};
export const adminService={
	dashboard:()=>api.get<AdminDashboard>('/admin/dashboard'),
	statistics:()=>api.get<AdminStatistics>('/admin/statistics'),
	users:(params?:object)=>api.get<AdminUsersResponse>('/admin/users',{params}),
	user:(id:number)=>api.get<AdminUser>(`/admin/users/${id}`),
	setUserStatus:(id:number,status:'active'|'locked')=>api.patch<AdminUser>(`/admin/users/${id}/status`,{status}),
	removeUser:(id:number)=>api.delete(`/admin/users/${id}`),
	categories:()=>api.get<Category[]>('/admin/categories'),
	createCategory:(data:object)=>api.post<Category>('/admin/categories',data),
	updateCategory:(id:number,data:object)=>api.put<Category>(`/admin/categories/${id}`,data),
	removeCategory:(id:number)=>api.delete(`/admin/categories/${id}`),
	notifications:()=>api.get<AppNotification[]>('/admin/notifications'),
	createNotification:(data:object)=>api.post('/admin/notifications',data),
	updateNotification:(id:number,data:object)=>api.put(`/admin/notifications/${id}`,data),
	removeNotification:(id:number)=>api.delete(`/admin/notifications/${id}`),
	feedback:(params?:object)=>api.get<AdminFeedback[]>('/admin/feedback',{params}),
	updateFeedback:(id:number,data:object)=>api.patch<AdminFeedback>(`/admin/feedback/${id}`,data),
};
