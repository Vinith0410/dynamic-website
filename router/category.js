const express = require("express")
const categoryrouter = express.Router()
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Category = require("../model/Category")
const Product = require("../model/Product")
const PageHeader = require("../model/PageHeader")

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

// add category
categoryrouter.post('/add',upload.single('categoryImage'), async (req, res) => {
    try {
        const { category, subcategory, categoryImage } = req.body;

        if (!category || !subcategory) {
            return res.send(`<script>
                alert('Category and sub-categories are required');
                window.location.href='/controls';
            </script>`);
        }

        // ALWAYS convert to array
        const subCategoryArray = Array.isArray(subcategory)
            ? subcategory
            : [subcategory];

        // Add categoryImage to the newCategory object
        const newCategory = new Category({
            categoryImage: req.file.path, // Store the path of the uploaded image
            category: category,
            subCategories: subCategoryArray
        });

        await newCategory.save();

        res.send(`<script>
            alert('Category stored successfully ✅');
            window.location.href='/controls';
        </script>`);

    } catch (error) {
        console.error(error);
        res.send(`<script>
            alert('Server Error ❌');
            window.location.href='/controls';
        </script>`);
    }
});

//category
categoryrouter.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.find({}, 'category subCategories categoryImage');
        res.json(categories);
    } catch {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

//subcategory
categoryrouter.get('/api/categories/:category', async (req, res) => {
    try {
        const category = await Category.findOne({ category: req.params.category });
        if (!category) return res.json([]);
        res.json(category.subCategories);
    } catch {
        res.status(500).json({ error: 'Failed to fetch sub-categories' });
    }
});

//read category content
categoryrouter.get('/categories-view', async (req, res) => {
    try {
        const categories = await Category.find();
        // Ensure we send only the filename, handling legacy full paths
        const data = categories.map(cat => {
            let image = cat.categoryImage;
            if (image) {
                // Split by both / and \ and take the last part
                image = image.split(/[\/\\]/).pop();
            }
            return {
                category: cat.category,
                categoryImage: image
            };
        });
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});


// Edit Category Name
categoryrouter.post('/api/edit-category', async (req, res) => {
    try {
        const { categoryId, newName } = req.body;
        if (!categoryId || !newName) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const cat = await Category.findById(categoryId);
        if (!cat) return res.status(404).json({ error: 'Category not found' });
        const oldName = cat.category;

        await Category.findByIdAndUpdate(categoryId, { category: newName });

        await PageHeader.updateMany(
            {},
            { $set: { "pages.page1.categories.$[elem]": newName } },
            { arrayFilters: [{ elem: oldName }] }
        );

        await Product.updateMany(
            { category: oldName },
            { $addToSet: { category: newName } }
        );
        await Product.updateMany(
            { category: oldName },
            { $pull: { category: oldName } }
        );

        res.json({ success: true, message: 'Category updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Edit Category Image
categoryrouter.post('/api/edit-category-image', upload.single('image'), async (req, res) => {
    try {
        const { categoryId } = req.body;
        if (!categoryId) return res.status(400).json({ error: 'Missing categoryId' });
        if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

        const cat = await Category.findById(categoryId);
        if (!cat) {
            try { fs.unlinkSync(path.join(uploadPath, req.file.filename)); } catch (e) {}
            return res.status(404).json({ error: 'Category not found' });
        }

        // delete old image if it exists
        try {
            if (cat.categoryImage) {
                fs.unlinkSync(path.join(uploadPath, path.basename(cat.categoryImage)));
            }
        } catch (e) {}

        cat.categoryImage = req.file.filename;
        await cat.save();

        res.json({ success: true, message: 'Category image updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete Category
categoryrouter.post('/api/delete-category', async (req, res) => {
    try {
        const { categoryId } = req.body;
        if (!categoryId) return res.status(400).json({ error: 'Missing categoryId' });
        const cat = await Category.findById(categoryId);
        if (!cat) return res.status(404).json({ error: 'Category not found' });
        const name = cat.category;

        await Category.findByIdAndDelete(categoryId);

        await PageHeader.updateMany({}, { $pull: { "pages.page1.categories": name } });

        await Product.updateMany({}, { $pull: { category: name } });
        try {
            await Product.updateMany(
                { category: { $size: 0 } },
                [{ $set: { category: ["Uncategorized"] } }]
            );
        } catch (e) {
            console.warn('Fallback: unable to set Uncategorized via pipeline', e.message);
        }
        res.json({ success: true, message: 'Category deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete Subcategory
categoryrouter.post('/api/delete-subcategory', async (req, res) => {
    try {
        const { categoryId, subCategory } = req.body;
        if (!categoryId || !subCategory) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        await Category.findByIdAndUpdate(categoryId, {
            $pull: { subCategories: subCategory }
        });
        await Product.updateMany({}, { $pull: { subCategory: subCategory } });
        res.json({ success: true, message: 'Subcategory deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Edit Subcategory
categoryrouter.post('/api/edit-subcategory', async (req, res) => {
    try {
        const { categoryId, oldSubCategory, newSubCategory } = req.body;
        if (!categoryId || !oldSubCategory || !newSubCategory) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        await Category.findByIdAndUpdate(
            categoryId,
            { $set: { 'subCategories.$[elem]': newSubCategory } },
            { arrayFilters: [{ elem: oldSubCategory }] }
        );
        await Product.updateMany(
            { subCategory: oldSubCategory },
            { $addToSet: { subCategory: newSubCategory } }
        );
        await Product.updateMany(
            { subCategory: oldSubCategory },
            { $pull: { subCategory: oldSubCategory } }
        );
        res.json({ success: true, message: 'Subcategory updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add Subcategory
categoryrouter.post('/api/add-subcategory', async (req, res) => {
    try {
        const { categoryId, subCategory } = req.body;
        if (!categoryId || !subCategory) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        await Category.findByIdAndUpdate(categoryId, {
            $addToSet: { subCategories: subCategory }
        });

        res.json({ success: true, message: 'Subcategory added' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});



module.exports = categoryrouter;
