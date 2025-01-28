// /// Create Routes to The application 
import express from 'express';
import { IsAuthenticated, loginuser, logout, registeruser, resetPassword, sendResetOTP, sendVerifyOTP, verifyEmail }  from "../controllers/auth.controllers.js";
import userAuth from '../middlewares/user.auth.js';


const router = express.Router()


// router.get('/', getuser);
router.post('/register/', registeruser);
router.post('/login/', loginuser);
router.post('/logout/', logout);
router.post('/send-otp',userAuth, sendVerifyOTP);
router.post('/verify-account',userAuth, verifyEmail);
router.post('/is-auth',userAuth, IsAuthenticated);
router.post('/send-resetpassword', sendResetOTP);
router.post('/reset-password', resetPassword);

export default router;