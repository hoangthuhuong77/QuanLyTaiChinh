import { createContext,useContext,useEffect,useState,type PropsWithChildren } from 'react';
import { authService } from '@/dichvu';import type { User } from '@/kieudulieu';import { tokenStorage } from '@/tienich/luutru';
type AuthContextValue={user:User|null;loading:boolean;login:(login:string,password:string,remember?:boolean)=>Promise<void>;register:(data:object)=>Promise<void>;logout:()=>Promise<void>;refresh:()=>Promise<void>};
const AuthContext=createContext<AuthContextValue|null>(null);
export function AuthProvider({children}:PropsWithChildren){const [user,setUser]=useState<User|null>(null);const [loading,setLoading]=useState(true);
 const refresh=async()=>{try{const {data}=await authService.profile();if(data.role==='admin'){await tokenStorage.remove();setUser(null);return;}setUser(data);}catch{await tokenStorage.remove();setUser(null);}};
 useEffect(()=>{tokenStorage.get().then(token=>token?refresh():undefined).finally(()=>setLoading(false));},[]);
 const save=async(data:{token:string;user:User},persist=true)=>{await tokenStorage.set(data.token,persist);setUser(data.user);};
 const login=async(loginValue:string,password:string,remember=true)=>{const {data}=await authService.login({login:loginValue,password});if(data.user.role==='admin')throw new Error('Tài khoản quản trị chỉ đăng nhập tại trang web quản trị.');await save(data,remember);};
 return <AuthContext.Provider value={{user,loading,login,register:async(data)=>save((await authService.register(data)).data),logout:async()=>{await tokenStorage.remove();setUser(null);},refresh}}>{children}</AuthContext.Provider>}
export function useAuth(){const value=useContext(AuthContext);if(!value)throw new Error('useAuth phải nằm trong AuthProvider');return value;}
