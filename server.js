const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PageHeader = require("./model/PageHeader")
const Product = require("./model/Product")
const Category = require("./model/Category")
const Rippon = require("./model/Rippon")
const DeletedField = require("./model/DeletedField")
const adminacc = require("./router/admin.js")
const session = require("express-session")
const pagerouter = require("./router/page.js")
const productrouter = require("./router/product.js")
const categoryrouter = require("./router/category.js")
const ripponrouter = require("./router/rippon.js")
const cartrouter = require("./router/addcart.js")

require('dotenv').config();

const app = express();

app.use(session({
    secret: 'dynamic-site',
    resave: false,
    saveUninitialized: true
}));


// /* ================== UPLOAD FOLDER ================== */
// const uploadPath = path.join(__dirname, 'pages/uploads');
// if (!fs.existsSync(uploadPath)) {
//     fs.mkdirSync(uploadPath, { recursive: true });
// }

// /* ================== MULTER ================== */
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, uploadPath),
//     filename: (req, file, cb) =>
//         cb(null, Date.now() + '-' + file.originalname)
// });
// const upload = multer({ storage });

/* ================== STATIC ================== */
// app.use('/uploads', express.static(uploadPath));
app.use('/css', express.static(path.join(__dirname, 'access/css')));
app.use('/access', express.static(path.join(__dirname, 'access')));
app.use('/public', express.static(path.join(__dirname, 'public')));
/* ================== MONGODB ================== */
mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

/* ================== BODY PARSERS ================== */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// login register forgot password routes
app.use("/acc", adminacc)

// add product router
app.use("/page", pagerouter)

// add category router
app.use("/category", categoryrouter)

// add rippon router
app.use("/rippon", ripponrouter)

// add product router
app.use("/product", productrouter)

// add cart router
app.use("/cart", cartrouter)

/* ================== PAGES ================== */
// login and register routers
app.get("/login", (req,res)=>{
  res.sendFile(path.join(__dirname,"./public/auth/login.html"))
})

app.get("/register", (req,res)=>{
  res.sendFile(path.join(__dirname,"./public/auth/register.html"))
})

app.get("/verify-otp" , (req, res)=>{
  res.sendFile(path.join(__dirname,"./public/auth/verify-otp.html"))
})

app.get("/forgot-password" , (req, res)=>{
  res.sendFile(path.join(__dirname,"./public/auth/forgot-password.html"))
})

app.get("/verify-forgot-otp" , (req, res)=>{
    res.sendFile(path.join(__dirname,"./public/auth/verify-forgot-otp.html"))
})

app.get("/reset-password" , (req, res)=>{
    res.sendFile(path.join(__dirname,"./public/auth/reset-password.html"))
})
app.get('/add', (req, res) => res.sendFile(path.join(__dirname, 'access/add.html')));
app.get('/prod', (req, res) => res.sendFile(path.join(__dirname, 'access/product.html')));
app.get('/controls', (req, res) => res.sendFile(path.join(__dirname, 'access/controls.html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, './public/pages/home/home.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, './public/pages/about/about.html')));
app.get('/our-product', (req, res) => res.sendFile(path.join(__dirname, './public/pages/product/product.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, './public/pages/contact/contact.html')));
app.get('/cart', (req, res) => res.sendFile(path.join(__dirname, './public/pages/cart/cart.html')));
app.get('/category', (req, res) => res.sendFile(path.join(__dirname, 'access/category.html')));
app.get('/rippon', (req, res) => res.sendFile(path.join(__dirname, 'access/rippon.html')));
app.get('/listcategory',(req,res)=>res.sendFile(path.join(__dirname, 'access/listcategory.html')));
app.get('/listproduct',(req,res)=>res.sendFile(path.join(__dirname, 'access/listproduct.html')));
app.get('/edit-product',(req,res)=>res.sendFile(path.join(__dirname, 'access/edit-product.html')));
app.get('/list',(req,res)=>res.sendFile(path.join(__dirname, 'access/list.html')));
app.get('/deleted',(req,res)=>res.sendFile(path.join(__dirname, 'access/deleted.html')));
app.get('/listrippon', (req, res) =>res.sendFile(path.join(__dirname, 'access/listrippon.html')));


/* ================== Log out  ================== */

app.get("/logout", (req,res)=>{
  req.session.destroy();
  res.send(`
   <script>
          alert("logout successfully");
          window.location.href = "/";
        </script>
    `)
})

/* ================== SERVER ================== */
app.listen(9000, () => {
    console.log('Server running → http://localhost:9000');
});