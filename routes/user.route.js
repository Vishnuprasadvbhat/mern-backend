import express from 'express';
import { getUserData } from '../controllers/user.controllers.js';
import userAuth from '../middlewares/user.auth.js';

const userRoute = express.Router()


userRoute.get('/data',userAuth, getUserData );


export default userRoute;