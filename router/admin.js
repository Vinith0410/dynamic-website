const express = require("express")
const bcryptjs = require("bcryptjs");
const nodemailer = require("nodemailer")
const user = require("../model/Admin.js")
const adminrouter = express.Router();
require('dotenv').config();

/* ================== CHECK LOGIN STATUS ================== */
adminrouter.get('/check-auth', (req, res) => {
  if (req.session && req.session.userId) {
    res.json({ 
      isLoggedIn: true, 
      userId: req.session.userId 
    });
  } else {
    res.json({ isLoggedIn: false });
  }
});

const generateotp = () => Math.floor(100000+Math.random()*900000).toString()
// 0.48 //

const sendOTP = async (to, otp) =>{
  const transporter = nodemailer.createTransport({
        host:"smtp.gmail.com",
        port:587, // 587 -tls 465-ssl
        secure:false,
        auth:{
          user:process.env.EMAIL,
          pass:process.env.EMAIL_PASSWORD
        },
        tls:{
          rejectUnauthorized:false
        }
      });

      await transporter.sendMail({
        from:process.env.EMAIL,
        to,
        subject:"Your OTP Code – Expires in 5 Minutes",
        text:`
        Hello 👋, your One-Time Password (OTP) is ${otp}. Please use this code to complete your verification.
        ⏳ This OTP is valid for only 5 minutes, so enter it as soon as possible. 🔐 For your security,
         do not share this code with anyone. If you didn’t request this, please ignore this email. 😊
        `
      })
}

adminrouter.post('/register', async(req,res)=>{
try{
  const {username, email, password} = req.body;
  console.log(username, email, password) //123= 10 hash function sk352/[;rg]
  const hashpassword = await bcryptjs.hash(password, 10);
  const userid = await user.findOne({email})
  if(userid){
    if(userid.isverified){
      return res.send(`
      <script>
          alert("email id already register please login")
          window.location.href = "/";
      </script>
      `)
    }
    if(userid.otpExpire && userid.otpExpire > Date.now()){
      return res.send(`
      <script>
          alert("otp Already sent to your mail please verify your email")
          window.location.href = "/verify-otp?mail=${email}";
      </script>
      `)
    }
    await user.deleteOne({_id:userid._id})
  }
   const otp = generateotp()
  const newuser = new user({
    name:username,
    email,
    password:hashpassword,
    otp,
    otpExpire: Date.now() + 5*60000
  })
  await newuser.save();
  await sendOTP(email,otp)
  res.send(`
    <script>
    alert("Otp sent to your mail please verify your email");
    window.location.href = "/verify-otp?mail=${email}";
  </script>
    `)

}catch(err){
  console.log("error on register ",err)
  res.send(`
    <script>
    alert("error on register");
  </script>
  `)
}
})

adminrouter.post("/verify-otp", async(req,res)=>{
  const {email,otp} = req.body
  const userid = await user.findOne({email})
try{
  if(!userid){
    return res.send(`
      <script>
          alert("user not found")
          window.location.href = "/register";
      </script>
      `)
  }

  if(userid.isverified){
     return res.send(`
      <script>
          alert("email already verified")
          window.location.href = "/";
      </script>
      `)
  }

  if(userid.otpExpire < Date.now()){
     await user.deleteOne({_id:userid._id})
      return res.send(`
      <script>
          alert("otp expired please register again")
          window.location.href = "/register";
      </script>
      `)
    }

    if(userid.otp !== otp){
      return res.send(`
      <script>
          alert("wrong otp")
          history.back();
      </script>
      `)
    }
    userid.isverified = true;
    userid.otp=null;
    userid.otpExpire=null,
    await userid.save()
     return res.send(`
      <script>
          alert("Email verified successfully please login")
          window.location.href = "/";
      </script>
      `)
     }catch(err){
      console.log(err)
      res.send(`
        <script>
          alert("otp verification error")
      </script>
        `)
     }

})

//login page hand
adminrouter.post("/login", async(req,res)=>{
  const{email, password} = req.body
  try{
    const userid = await user.findOne({email})
    // console.log(userid)
    if(!userid){
     return res.send(`
         <script>
          alert("user Mail id not found");
          window.location.href = "/";
        </script>
        `)
    }
    if(!userid.isverified){
      return res.send(`
         <script>
          alert("Email id not verified please verify your email first");
          window.location.href = "/verify-otp?mail=${email}";
        </script>
        `)
    }
    const ismatch = await bcryptjs.compare(password,userid.password)
    if(ismatch){
      req.session.userId= userid._id;
      res.send(`
         <script>
          alert("Successfully logged in!");
          window.location.href = "/";
        </script>
        `)
    }else{
      res.send(`
         <script>
          alert("pasword wrong");
          window.location.href = "/";
        </script>
        `)
    }

  }catch(err){
    console.log("error on user id", err)
    res.send(`
      <script>
        alert("error on user id");
      </script>
      `)
  }
})

// forgot-password

adminrouter.post("/forgot-password", async(req,res)=>{
  const {email} = req.body;
  try{
    const userid = await user.findOne({email})

    if(!userid){
      return res.send(`
         <script>
          alert("email not register");
          window.location.href = "/forgot-password";
        </script>
        `)
    }

    if(!userid.isverified){
       return res.send(`
         <script>
          alert("email not verified so verified first ");
          window.location.href = "/verify-otp?mail=${email}";
        </script>
        `)
    }

    const otp = generateotp();
    userid.otp = otp;
    userid.otpExpire = Date.now() + 5 * 60000
    await userid.save()
    await sendOTP(email, otp)
    res.send(`
         <script>
          alert("otp send for reset your password");
          window.location.href = "/verify-forgot-otp?mail=${email}";
        </script>
        `)

  }catch(err){
    console.log(err);
    res.send(`
      <script>
        alert("error on otp send");
      </script>
      `)
  }
})

adminrouter.post("/verify-forgot-otp", async(req,res)=>{
  const {email, otp} = req.body;
  const userid = await user.findOne({email})

  try{

 if(!userid){
    return res.send(`
      <script>
          alert("user not found")
          window.location.href = "/register";
      </script>
      `)
  }

  if(userid.otpExpire < Date.now()){
    userid.otp=null,
    userid.otpExpire=null
    await userid.save();
      return res.send(`
      <script>
          alert("otp expired please request again")
          window.location.href = "/forgot-password";
      </script>
      `)
    }

    if(userid.otp !== otp){
      return res.send(`
      <script>
          alert("wrong otp")
          history.back();
      </script>
      `)
    }
    userid.otp=null;
    userid.otpExpire=null,
    await userid.save()
   res.send(`
      <script>
          alert("otp verified successfully now change your password")
          window.location.href = "/reset-password?email=${email}";
      </script>
      `)

  }catch(err){
    console.log(err)
    res.send(`
      <script>
        alert("error on otp verification");
      </script>
      `)
  }
})

adminrouter.post("/reset-password", async(req,res)=>{
  const {email, password} = req.body;
  console.log(password,email)
  try{
    const hash = await bcryptjs.hash(password, 10);

    await user.updateOne({email},{
      password:hash,
      otp:null,
    })

      res.send(`
        <script>
            alert("password change successfully now you can login to your new password")
            window.location.href = "/";
        </script>
        `)

  }catch(err){
    console.log(err)
    res.send(`
      <script>
        alert("error on password changing");
      </script>
      `)
  }

})

module.exports = adminrouter;
