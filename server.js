import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv'  ;
import cookieParser  from 'cookie-parser';
import  connectDB   from './config/db.js';
import router from './routes/auth.route.js';
import userRoute from './routes/user.route.js';
import swaggerDocs from "./config/swagger.js";
dotenv.config()

const app = express();

const PORT = process.env.PORT || 5000;
connectDB();

const allowedOrigins = ['http://localhost:5173']


app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: allowedOrigins, credentials:true}));


// API ENDPOINTS 
app.use('/api/auth/', router);
app.use('/api/user/', userRoute);


swaggerDocs(app);

app.listen(PORT, () => {

  console.log(`Server Started on port: http://localhost:${PORT}/`);
});
