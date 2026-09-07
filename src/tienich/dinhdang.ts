export const formatCurrency=(value:number|string=0)=>`${Number(value).toLocaleString('vi-VN')} ₫`;
export const formatDate=(value:string)=>new Intl.DateTimeFormat('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(value));
export const today=()=>new Date().toISOString().slice(0,10);
export const apiMessage=(error:unknown)=>{
  const candidate=error as {response?:{data?:{message?:string}};message?:string};
  return candidate.response?.data?.message||candidate.message||'Đã có lỗi xảy ra.';
};
