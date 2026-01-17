const express = require("express")
const productrouter = express.Router()
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require("../model/Product.js")


/* ================== UPLOAD FOLDER ================== */
const uploadPath = path.join(__dirname, '../public/pages/uploads');
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}
/* ================== MULTER ================== */
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) =>
        cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

const { isAdmin } = require('../middleware/auth');

productrouter.post('/add', isAdmin, upload.single('image'), async (req, res) => {
    try {
        const {
            name,
            ribbon,
            category,
            subcategory,
            description,
            oldPrice,
            price,
            discount,
            delivery,
            deliveryCharge,
            stock,
            deliveryChargeEnabled,
            colors
        } = req.body;

        const categoryArray = category
            ? (Array.isArray(category) ? category : [category])
            : [];

        const subCategoryArray = subcategory
            ? (Array.isArray(subcategory) ? subcategory : [subcategory])
            : [];

        const rawColors = colors;
        const colorArray = rawColors
            ? (Array.isArray(rawColors) ? rawColors : [rawColors])
                .map(c => c.trim())
                .filter(Boolean)
            : [];

        const hasDeliveryCharge = (deliveryChargeEnabled || 'yes') === 'yes';
        const finalDeliveryCharge = hasDeliveryCharge ? (deliveryCharge || '0') : '0';

        const productData = {
            image: req.file.filename,
            name,
            ribbon,
            category: categoryArray,
            subCategory: subCategoryArray,
            description,
            oldPrice,
            price,
            discount,
            delivery,
            deliveryCharge: finalDeliveryCharge,
            hasDeliveryCharge,
            stock
        };

        if (colorArray.length) {
            productData.colors = colorArray;
        }

        const product = new Product(productData);

        await product.save();

        res.send(`<script>
            alert('Product added successfully ✅');
            window.location.href='/controls';
        </script>`);
    } catch (err) {
        console.error(err);
        res.send(`<script>
            alert('Product upload failed ❌');
            window.location.href='/prod';
        </script>`);
    }
});

// GET all products
productrouter.get('/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

//get single product
productrouter.get('/api/product/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});


productrouter.post('/api/product/update/:id', isAdmin, upload.single('image'), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).send('Product not found');

        const {
            name,
            ribbon,
            category,
            subCategory,
            description,
            price,
            oldPrice,
            discount,
            delivery,
            deliveryCharge,
            stock,
            deliveryChargeEnabled,
            colors
        } = req.body;

        if (req.file) {
            // delete old image
            try {
                fs.unlinkSync(path.join(uploadPath, product.image));
            } catch {}
            product.image = req.file.filename;
        }

        product.name = name;
        product.ribbon = ribbon;
        product.category = Array.isArray(category) ? category : [category];
        product.subCategory = Array.isArray(subCategory) ? subCategory : [subCategory];
        product.description = description;
        product.price = price;
        product.oldPrice = oldPrice;
        product.discount = discount;
        product.delivery = delivery;
        if (typeof deliveryChargeEnabled !== 'undefined') {
            const hasDeliveryCharge = deliveryChargeEnabled === 'yes';
            product.hasDeliveryCharge = hasDeliveryCharge;
            product.deliveryCharge = hasDeliveryCharge
                ? (typeof deliveryCharge !== 'undefined' ? deliveryCharge : product.deliveryCharge)
                : '0';
        } else if (typeof deliveryCharge !== 'undefined') {
            product.deliveryCharge = deliveryCharge;
        }
        product.stock = stock ?? product.stock;

        if (typeof colors !== 'undefined') {
            const colorArray = (Array.isArray(colors) ? colors : [colors])
                .map(c => c.trim())
                .filter(Boolean);

            if (colorArray.length) {
                product.colors = colorArray;
            } else {
                product.colors = ['#000000'];
            }
        }

        await product.save();

        res.send(`<script>
            alert('Product updated successfully ✅');
            window.location.href='/listproduct';
        </script>`);

    } catch (err) {
        console.error(err);
        res.send(`<script>
            alert('Update failed ❌');
            window.history.back();
        </script>`);
    }
});

productrouter.post('/api/product/delete/:id', isAdmin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.json({ success:false });

        // delete image
        try {
            fs.unlinkSync(path.join(uploadPath, product.image));
        } catch {}

        await product.deleteOne();

        res.json({ success:true });
    } catch (err) {
        res.json({ success:false });
    }
});

// GET trending products (max 6)
productrouter.get('/api/products/trending', async (req, res) => {
    try {
        // Find products where ribbon contains 'trending' (case insensitive)
        const products = await Product.find({ ribbon: { $regex: /trending/i } })
            .sort({ createdAt: -1 })
            .limit(6);

        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch trending products' });
    }
});

// GET new arrival products (max 6)
productrouter.get('/api/products/new-arrival', async (req, res) => {
    try {
        // Find products where ribbon contains 'new' (case insensitive)
        const products = await Product.find({ ribbon: { $regex: /new/i } })
            .sort({ createdAt: -1 })
            .limit(6);

        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch new arrivals' });
    }
});

module.exports = productrouter
