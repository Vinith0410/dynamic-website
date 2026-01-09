const mongoose = require("mongoose");

//user create
const userschema = new mongoose.Schema({
  name:String,
  email:String,
  password:String,
  otp:{
    type:String,
    default:null
  },
  otpExpire:{
    type:Date,
    default:null
  },
  isverified:{
    type:Boolean,
    default:false
  }
})
const user = mongoose.model("user", userschema)

module.exports=user