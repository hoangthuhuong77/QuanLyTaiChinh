require('dotenv').config();
const express=require('express');const cors=require('cors');const swaggerUi=require('swagger-ui-express');const openapi=require('./tailieu/openapi');const pool=require('./cauhinh/database');const auth=require('./trunggian/authMiddleware');const {notFound,errorHandler}=require('./trunggian/errorMiddleware');
if(!process.env.JWT_SECRET){console.error('Thiếu JWT_SECRET trong file .env.');process.exit(1);}
const app=express();app.use(cors());app.use(express.json({limit:'5mb'}));app.get('/api/openapi.json',(_req,res)=>res.json(openapi));app.use('/api/docs',swaggerUi.serve,swaggerUi.setup(openapi,{customSiteTitle:'Tài liệu API Quản lý tài chính',swaggerOptions:{docExpansion:'list'}}));app.get('/api/health',async(_req,res,next)=>{try{await pool.query('SELECT 1');res.json({status:'ok'});}catch(e){next(e);}});
const authController=require('./dieukhien/taikhoan');
app.post('/api/dangky',authController.register);app.post('/api/dangnhap',authController.login);
app.use(['/api/auth','/api/taikhoan'],require('./duongdan/taikhoan'));
app.use(['/api/wallets','/api/vitien'],auth,require('./duongdan/vitien'));
app.use(['/api/categories','/api/danhmuc'],auth,require('./duongdan/danhmuc'));
app.use(['/api/transactions','/api/giaodich'],auth,require('./duongdan/giaodich'));
app.use(['/api/transfers','/api/chuyentien'],auth,require('./duongdan/chuyentien'));
app.use(['/api/budgets','/api/ngansach'],auth,require('./duongdan/ngansach'));
app.use(['/api/statistics','/api/thongke'],auth,require('./duongdan/thongke'));
app.use(['/api/savings-goals','/api/muctieutietkiem'],auth,require('./duongdan/muctieutietkiem'));
app.use(['/api/notifications','/api/thongbao'],auth,require('./duongdan/thongbao'));
app.use(notFound);app.use(errorHandler);
const port=Number(process.env.PORT||3000);app.listen(port,'0.0.0.0',()=>console.log(`API đang chạy tại http://0.0.0.0:${port}`));
