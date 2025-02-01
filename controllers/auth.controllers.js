// write the functions used in the http methods.
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../models.js/user.model.js';
import transporter from '../config/nodemailer.js';
import userAuth from '../middlewares/user.auth.js';
import dotenv from 'dotenv';
import winston from 'winston';
import Joi from 'joi';

dotenv.config();



const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: 'logs/error.log', level: 'error' })],
});

const registerSchema = Joi.object({
  Name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(20).required(),
});


export const getuser = (async (req, res) => {
  res.send('Hello World!')
});


export const registeruser = (async (req, res) => {
  logger.info('Register endpoint hit');

  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  const {Name, email, password} = req.body

  if (!Name || !email || !password) {
    return res.status(400).json({sucess: false, message: 'Please enter all fields'})
  }

  try {
    const startTime = Date.now()
    const existinguser = await UserModel.findOne({email})
    const userCheckTime = Date.now()
    console.log(`Check existing user took ${userCheckTime - startTime}ms`)

    if (existinguser){
      return res.status(409).json({sucess:false, message: 'Email already exists'})
    }
    const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const hashTime = Date.now();
    console.log(`Hashing password took ${hashTime - userCheckTime}ms`)


    const user = new UserModel({Name , email, password: hashedPassword})
    await user.save()
    const saveUserTime = Date.now();
    console.log(`Saving user took ${saveUserTime - hashTime}ms`);

    const token = jwt.sign({ id: user._id.toString() }, process.env.SECRET_KEY, {expiresIn: '7d'});

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite : process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge : 7 * 24 * 60 * 60 * 1000,
    });

    const endTime = Date.now();
    console.log(`Total time taken: ${endTime - startTime}ms`);
    
    // Sending Welcome Email
    const mailOptions = {
      from: process.env.SENDER_EMAIL, 
      to: email,
      subject: 'Welcome to Ihub Technologies',
      text: `Your account has been successfully created with email id: ${email}`
    }

    await transporter.sendMail(mailOptions);

    logger.info(`User registered successfully in ${Date.now() - startTime}ms`);

    return res.status(200).json({sucess:true, message: 'Successfully Registered'});
  }
  catch(error){
    logger.error(`Registration error: ${error.message}`);
    res.status(500).json({sucess:false, message: error.message})
  }

});

export const loginuser = (async (req, res) => {

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(404).json({sucess: false, message: 'Email and password are required'});
  }

  try {

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({sucess: false, message: 'Invalid email'});    }

    const IsMatch = await bcrypt.compare(password, user.password);
    if (!IsMatch) {
      return res.status(404).json({sucess: false, message: 'Invalid password'});
    }
    const token = jwt.sign({id: user._id}, process.env.SECRET_KEY, {expiresIn: '7d'});

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite : process.env.NODE_ENV === 'production' ?
      'none' : 'strict',
      maxAge : 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({sucess:true, message: 'Successfully Logged In'});
  }

  catch (error){
    res.status(500).json({sucess:false, message: error.message})
  }

})

export const logout = async (req, res) => {
  
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite : process.env.NODE_ENV === 'production' ?
      'none' : 'strict',
    });

    return res.status(200).json({success: false , message: 'Sucessfully Logged Out'})
  }

  catch (error){
    res.status(500).json({sucess:false, message: error.message})
  }
}


// SEND VERIFICATION OTP TO USER'S EMAIL 
export const sendVerifyOTP = async (req,res) => {
  try
  {
    const {userId} = req.body;

    const user = await UserModel.findById(userId);

    if (user.isVerified) {
      return res.json({success:true, message: 'Account is verified'});
    }

    const otp =  String(Math.floor(100000 + Math.random() * 900000));

    user.VerifyOTP = otp;
    user.VerifyOTPExpireAt = Date.now() + 24 * 60 *60 * 1000
    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL, 
      to: user.email,
      subject: 'Account Verification OTP',
      text: `Your OTP is ${otp}. Verify your account using this OTP`};

    transporter.sendMail(mailOptions);

    return res.status(200).json({sucess:true, message: 'Verification OTP sent to your email'});

    //const user = await UserModel.findOne({email: req.body.email});
  } 
  catch (error){
    res.status(500).json({sucess:false, message: error.message})
  }
}


export const verifyEmail = async (req,res) => {
  
    const {userId, otp}  = req.body;

    if (!userId || !otp) {
      return res.json({success:false,message: 'Missing Details' })
    };
  try{

    const user = await UserModel.findById(userId);

    if (!user){
      return res.json({success:false, message: 'User not found'});
    }

    if (user.VerifyOTP !== otp|| user.VerifyOTP === '') {
      return res.json({success:false, message: 'Invalid OTP'});
    }

    if (user.VerifyOTPExpireAt < Date.now() ){
        return res.json({success:false, message: 'OTP Expired'})
    }

    user.isVerified = true;

    user.VerifyOTP = '';
    user.VerifyOTPExpireAt = 0;
    await user.save()

    return res.json({success:true, message: 'Email Verified'});
  }
  catch (error){
    res.status(500).json({sucess:false, message: error.message})
  }
}

export const IsAuthenticated = async (req, res) => {
  try {
    const {userId} = req.body
    const user = await UserModel.findById(userId)

    if (!user) {
      return res.json({success: false, message: 'User not found'})
    }
    if (!user.isVerified) {
      return res.json({success: false, message: 'Email not verified'})
    }
    return res.json({success: true, message: 'User authenticated'})
  }
  catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}


// SEND PASSWORD RESET OTP 
export const sendResetOTP = async (req, res) => {
  const {email } = req.body

try {
  if (!email) {
    return res.json({success: false, message: 'Email is required'})
  };

  const user = await UserModel.findOne({email: email});

  if (!user) {
    return res.json({success: false, message: 'User not found'})
  };

  const otp =  String(Math.floor(100000 + Math.random() * 900000));
  
  const resetOTPExpireAt = Date.now() + 15 * 60 * 1000;
  user.resetOTP = otp;
  user.resetOTPExpireAt =  resetOTPExpireAt;
  await user.save();
  
  const mailOptions= {
    from: process.env.SENDER_EMAIL, 
    to: email,
    subject: 'Password Reset OTP',
    text: `Use this OTP to reset your password: ${otp}.`};

  await transporter.sendMail(mailOptions);

  return res.json({success: true, message: 'OTP sent to your email'});

  }
  catch (error){
    res.status(500).json({success:false, message: error.message})
  };


};


export const resetPassword = async (req, res) => {
  const {email, otp, newpassword}  = req.body;

  if (!email || !otp || !newpassword) {
    return res.json({success: false, message: 'Email,OTP and New Password are Required'});
  }
  try {
  const user = await UserModel.findOne({email: email});

  if (!user){
    return res.json({success: false, message: 'User not found'})
  }

  if (user.resetOTP === '' || user.resetOTP != otp ) {
    return res.json({success: false, message: 'Invalid OTP'});
  }
  
  if (user.resetOTPExpireAt < Date.now()) {
    return res.json({success:false, message: 'OTP has expired'});
  }
  const newhashedpassword = await bcrypt.hash(newpassword, 10);
  user.password = newhashedpassword;
  user.resetOTP = '';
  user.resetOTPExpireAt = 0;
  await user.save()
  res.json({success: true, message: 'Password reset successfully'});
  
  }
catch (error){
  return res.status(500).json({success:false, message: error.message})
}};


