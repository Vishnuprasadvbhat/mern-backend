// Define models for the database 

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({

  name: {type: String,required: true},
  email : {type: String, required: "true",  unique: true},
  password : {type: String, required: "true",  unique: true},
  VerifyOTP : {type: String, default: ''},
  VerifyOTPExpireAt : {type: Number, default: 0},
  isVerified : {type: Boolean, default: false},
  resetOTP : {type: String, default: ''},
  resetOTPExpireAt : {type: Number, default: 0},
  Role : {type: String, default: 'user'},

})


const UserModel = mongoose.model('user', UserSchema);

export default UserModel;

// mongoose.models.user ||