const express = require('express');
const ripponrouter = express.Router();
const Rippon = require("../model/Rippon.js")
const Product = require("../model/Product.js")
const PageHeader = require("../model/PageHeader.js")
const path = require('path');
const fs = require('fs');
const multer = require('multer');

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
ripponrouter.post('/add', upload.none(), async (req, res) => {
    try {
        let { ribbon } = req.body;

        // Ensure ribbon is always an array
        if (!ribbon) {
            return res.send(`<script>
                alert('Ribbon is required');
                window.location.href='/controls';
            </script>`);
        }

        if (!Array.isArray(ribbon)) {
            ribbon = [ribbon]; // when only one input exists
        }

        const newRippon = new Rippon({
            ribbons: ribbon
        });

        await newRippon.save();

        res.send(`<script>
            alert('Ribbon stored successfully ✅');
            window.location.href='/controls';
        </script>`);

    } catch (error) {
        console.error(error);
        res.send(`<script>
            alert('Server error ❌');
            window.location.href='/controls';
        </script>`);
    }
});

ripponrouter.get('/api/ribbons', async (req, res) => {
    try {
        const data = await Rippon.find().sort({ createdAt: -1 });
        const ribbons = data.flatMap(r => r.ribbons);
        res.json(ribbons);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch ribbons' });
    }
});

/* ================== RIPBON EDIT ================== */
ripponrouter.post('/api/ribbon/edit', async (req, res) => {
    try {
        const { oldRibbon, newRibbon } = req.body;
        if (!oldRibbon || !newRibbon) {
            return res.status(400).json({ success: false });
        }

        // Update Rippon collection
        await Rippon.updateMany(
            { ribbons: oldRibbon },
            { $set: { 'ribbons.$[elem]': newRibbon } },
            { arrayFilters: [{ elem: oldRibbon }] }
        );

        // Update Product ribbon
        await Product.updateMany(
            { ribbon: oldRibbon },
            { $set: { ribbon: newRibbon } }
        );

        // Update PageHeader ribbons
        await PageHeader.updateMany({}, {
            $set: {
                "pages.page1.sections.$[sec].ribbonPrimary": newRibbon
            }
        }, {
            arrayFilters: [{ "sec.ribbonPrimary": oldRibbon }]
        });

        await PageHeader.updateMany({}, {
            $set: {
                "pages.page1.sections.$[sec].ribbonSecondary": newRibbon
            }
        }, {
            arrayFilters: [{ "sec.ribbonSecondary": oldRibbon }]
        });

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});


/* ================== RIPBON DELETE ================== */
ripponrouter.post('/api/ribbon/delete', async (req, res) => {
  try {
    const { ribbon } = req.body;
    if (!ribbon) return res.json({ success: false });

    // 1️⃣ Remove ribbon from Rippon collection
    await Rippon.updateMany({}, { $pull: { ribbons: ribbon } });

    // 2️⃣ Remove ribbon ONLY from products that use it
    await Product.updateMany(
      { ribbon: ribbon },
      { $unset: { ribbon: "" } }
    );

    // 3️⃣ Remove ribbon ONLY where it matches in PageHeader
    await PageHeader.updateMany(
      { "pages.page1.ribbonPrimary": ribbon },
      { $unset: { "pages.page1.ribbonPrimary": "" } }
    );

    await PageHeader.updateMany(
      { "pages.page1.ribbonSecondary": ribbon },
      { $unset: { "pages.page1.ribbonSecondary": "" } }
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

// GET home ribbons with products
ripponrouter.get('/api/home-ribbon-products', async (req, res) => {
  try {
    const page = await PageHeader.findOne().sort({ _id: -1 });

    if (!page) {
      return res.json({ primary: null, secondary: null });
    }

    const page1 = page.pages?.page1 || {};
    const ribbonsArr = Array.isArray(page1.ribbons) ? page1.ribbons : [];

    // Prefer explicit primary/secondary, otherwise fall back to first two from ribbons array
    const ribbonPrimary = page1.ribbonPrimary || ribbonsArr[0] || null;
    const ribbonSecondary = page1.ribbonSecondary || ribbonsArr[1] || null;

    const primaryProducts = ribbonPrimary
      ? await Product.find({ ribbon: new RegExp(`^${ribbonPrimary}$`, 'i') })
          .sort({ createdAt: -1 })
          .limit(8)
      : [];

    const secondaryProducts = ribbonSecondary
      ? await Product.find({ ribbon: new RegExp(`^${ribbonSecondary}$`, 'i') })
          .sort({ createdAt: -1 })
          .limit(8)
      : [];

    res.json({
      primary: {
        name: ribbonPrimary,
        products: primaryProducts
      },
      secondary: {
        name: ribbonSecondary,
        products: secondaryProducts
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load ribbon products' });
  }
});

module.exports = ripponrouter;
