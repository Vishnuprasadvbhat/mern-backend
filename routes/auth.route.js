// /// Create Routes to The application 
import express from 'express';
import { IsAuthenticated, loginuser, logout, registeruser, resetPassword, sendResetOTP, sendVerifyOTP, verifyEmail }  from "../controllers/auth.controllers.js";
import userAuth from '../middlewares/user.auth.js';
import rateLimit from 'express-rate-limit';

const router = express.Router()


// Rate limiter for OTP-related endpoints
const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // Limit each IP to 3 OTP requests per window
  message: "Too many OTP requests. Please try again later.",
});


// router.get('/', getuser);

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

/**
 * @swagger
 * /auth/users:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [Name, email, password]
 *             properties:
 *               Name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 example: "securePassword123"
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.post('/users', registeruser);


/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 example: "securePassword123"
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginuser);

/**
 * @swagger
 * /auth/logout:
 *   delete:
 *     summary: Logout user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', logout);


/**
 * @swagger
 * /auth/otp:
 *   post:
 *     summary: Send OTP for email verification
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: OTP sent
 *       429:
 *         description: Too many requests
 */
router.post('/otp', otpLimiter, userAuth, sendVerifyOTP);



/**
 * @swagger
 * /auth/verify:
 *   post:
 *     summary: Verify user email with OTP
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [otp]
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully
 */
router.post('/verify',userAuth, verifyEmail);


/**
 * @swagger
 * /auth/status:
 *   get:
 *     summary: Check if user is authenticated
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User is authenticated
 *       401:
 *         description: Unauthorized
 */
router.get('/status',userAuth, IsAuthenticated);

/**
 * @swagger
 * /auth/password/reset/request:
 *   post:
 *     summary: Request a password reset
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Password reset email sent
 */
router.post('/password/reset/request', sendResetOTP);


/**
 * @swagger
 * /auth/password/reset:
 *   put:
 *     summary: Reset user password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [newPassword, token]
 *             properties:
 *               newPassword:
 *                 type: string
 *                 example: "newSecurePassword123"
 *               token:
 *                 type: string
 *                 example: "resetToken123"
 *     responses:
 *       200:
 *         description: Password reset successful
 */
router.post('/password/reset', resetPassword);



export default router;