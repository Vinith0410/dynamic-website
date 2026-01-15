const express = require("express")
const pagerouter = express.Router()
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PageHeader = require("../model/PageHeader")
const DeletedField = require("../model/DeletedField")


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

/* ================== ADD ROUTE (UNCHANGED) ================== */
pagerouter.post(
    '/add',
    upload.fields([
        { name: 'page1img1' }, { name: 'page1img2' }, { name: 'page1img3' }, { name: 'page1img4' },
        { name: 'page1sec1_file' },
        { name: 'feature1img' },{ name: 'feature2img' },{ name: 'feature3img' },{ name: 'feature4img' },

        { name: 'page2img1' },
        { name: 'page2sec1_file' },
        { name: 'page2vision_file' },

        { name: 'page2sec2_icon1' },
        { name: 'page2sec2_icon2' },
        { name: 'page2sec2_icon3' },

        { name: 'page2sec3_file' },

        { name: 'page3img1' },
        { name: 'deliveryimg' },
        { name: 'page4img1' }

    ]),
    async (req, res) => {
        try {
            const ribbonKeys = Object.keys(req.body).filter(k => /^ribbon\d+$/.test(k));
            ribbonKeys.sort((a, b) => parseInt(a.replace('ribbon', '')) - parseInt(b.replace('ribbon', '')));
            const ribbons = ribbonKeys
                .map(k => req.body[k])
                .filter(r => r && r.trim() !== "");

            const categoryKeys = Object.keys(req.body).filter(k => /^category\d+$/.test(k));
            categoryKeys.sort((a, b) => parseInt(a.replace('category', '')) - parseInt(b.replace('category', '')));
            const categories = categoryKeys
                .map(k => req.body[k])
                .filter(c => c && c.trim() !== "");

            const data = new PageHeader({
                navigation_title: req.body.navigation_title,

                pages: {
                    page1: {
                        title: req.body.page_1,
                        images: [
                            {
                                file: req.files.page1img1?.[0]?.filename,
                                heading: req.body.page1img1_headings,
                                detail: req.body.page1img1_details,
                                button: req.body.page1img1_button
                            },
                            {
                                file: req.files.page1img2?.[0]?.filename,
                                heading: req.body.page1img2_headings,
                                detail: req.body.page1img2_details,
                                button: req.body.page1img2_button
                            },
                            {
                                file: req.files.page1img3?.[0]?.filename,
                                heading: req.body.page1img3_headings,
                                detail: req.body.page1img3_details,
                                button: req.body.page1img3_button
                            },
                            {
                                file: req.files.page1img4?.[0]?.filename,
                                heading: req.body.page1img4_headings,
                                detail: req.body.page1img4_details,
                                button: req.body.page1img4_button
                            }
                        ],
                        sections: [
                            {
                                name: req.body.page1sec1_name,
                                details: req.body.page1sec1_details,
                                file: req.files.page1sec1_file?.[0]?.filename,
                                button: req.body.page1sec1_button
                            },
                        ],
                        ribbons,
                        categories,
                        specialities: [
                            {
                                image: req.files.feature1img?.[0]?.filename,
                                title: req.body.feature1title,
                                subtitle: req.body.feature1subtitle
                            },
                            {
                                image: req.files.feature2img?.[0]?.filename,
                                title: req.body.feature2title,
                                subtitle: req.body.feature2subtitle
                            },
                            {
                                image: req.files.feature3img?.[0]?.filename,
                                title: req.body.feature3title,
                                subtitle: req.body.feature3subtitle
                            },
                            {
                                image: req.files.feature4img?.[0]?.filename,
                                title: req.body.feature4title,
                                subtitle: req.body.feature4subtitle
                            }
                        ]
                    },
                    page2: {
                        title: req.body.page_2,
                        header: {
                            image: req.files.page2img1?.[0]?.filename,
                            heading: req.body.page2img1_headings,
                            detail: req.body.page2img1_details
                        },

                        about: {
                            name: req.body.page2sec1_name,
                            subtitle: req.body.page2sec1_subtitle,
                            image: req.files.page2sec1_file?.[0]?.filename,
                            heading: req.body.page2sec1_heading,
                            details: req.body.page2sec1_details
                        },
                        // core: {
                        //     name: req.body.page2sec2_name,
                        //     subtitle: req.body.page2sec2_subtitle,
                        //     cards: [
                        //         {
                        //             icon: req.files.page2sec2_icon1?.[0]?.filename,
                        //             heading: req.body.page2sec2_heading1,
                        //             details: req.body.page2sec2_details1
                        //         },
                        //         {
                        //             icon: req.files.page2sec2_icon2?.[0]?.filename,
                        //             heading: req.body.page2sec2_heading2,
                        //             details: req.body.page2sec2_details2
                        //         },
                        //         {
                        //             icon: req.files.page2sec2_icon3?.[0]?.filename,
                        //             heading: req.body.page2sec2_heading3,
                        //             details: req.body.page2sec2_details3
                        //         }
                        //     ]
                        // },
                      mission: {
                        title: req.body.missiontitle,
                        description: req.body.missiondescription,
                        points: [
                            { title: req.body.mission1, description: req.body.mission1description },
                            { title: req.body.mission2, description: req.body.mission2description },
                            { title: req.body.mission3, description: req.body.mission3description },
                            { title: req.body.mission4, description: req.body.mission4description }
                        ].filter(p => p.title || p.description)
                        },

                       vision: {
                            title: req.body.visiontitle,                 // ✅ FIXED
                            description: req.body.visiondescription,     // ✅ FIXED
                            points: [
                                { title: req.body.vision1, description: req.body.vision1description },
                                { title: req.body.vision2, description: req.body.vision2description },
                                { title: req.body.vision3, description: req.body.vision3description },
                                { title: req.body.vision4, description: req.body.vision4description }
                            ].filter(p => p.title || p.description),
                            },

                        why_us: {
                            name: req.body.page2sec3_name,
                            subtitle: req.body.page2sec3_subtitle,
                        image: req.files.page2sec3_file?.[0]?.filename,
                            features: [
                                req.body.page2sec3_feature1,
                                req.body.page2sec3_feature2,
                                req.body.page2sec3_feature3,
                                req.body.page2sec3_feature4,
                                req.body.page2sec3_feature5
                            ],
                        },
                        feedbacks: [
                            {
                                name: req.body.feedback1name,
                                sub: req.body.feedback1sub,
                                message: req.body.feedback1message
                            },
                            {
                                name: req.body.feedback2name,
                                sub: req.body.feedback2sub,
                                message: req.body.feedback2message
                            },
                            {
                                name: req.body.feedback3name,
                                sub: req.body.feedback3sub,
                                message: req.body.feedback3message
                            },
                            {
                                name: req.body.feedback4name,
                                sub: req.body.feedback4sub,
                                message: req.body.feedback4message
                            }
                        ].filter(f => (f?.name && f.name.trim()) || (f?.sub && f.sub.trim()) || (f?.message && f.message.trim())),

                    },

                    page3: {
                        title: req.body.page_3,
                        image: req.files.page3img1?.[0]?.filename,
                        heading: req.body.page3img1_headings,
                        detail: req.body.page3img1_details,
                        imagedelivery: req.files.deliveryimg?.[0]?.filename,
                        points: [
                            req.body.points1,
                            req.body.points2,
                            req.body.points3,
                            req.body.points4,
                            req.body.points5
                        ]
                    },

                    page4: {
                        title: req.body.page_4,
                        image: req.files.page4img1?.[0]?.filename,
                        heading: req.body.page4img1_headings,
                        detail: req.body.page4img1_details,
                        contact: {
                            dnumber: req.body['footer.dnumber'] || req.body.dnumber,
                            streetname: req.body['footer.streetname'] || req.body.streetname,
                            city: req.body['footer.city'] || req.body.city,
                            district: req.body['footer.district'] || req.body.district,
                            state: req.body['footer.state'] || req.body.state,
                            zipcode: req.body['footer.zipcode'] || req.body.zipcode,
                            primaryphone: req.body['footer.primaryphone'] || req.body.primaryphone || req.body['footer.phone'],
                            secondaryphone: req.body['footer.secondaryphone'] || req.body.secondaryphone,
                            supportemail: req.body['footer.email'] || req.body.supportemail || req.body.email,
                            workinghours: req.body['footer.hours'] || req.body.workinghours || req.body.hours,
                            mapUrl: req.body['footer.mapUrl'] || req.body.mapUrl
                        }
                    },

                    footer: {
                        brand: req.body['footer.brand'],
                        tagline: req.body['footer.tagline'],
                        description: req.body['footer.description'],
                        social: {
                            facebook: req.body['footer.facebook'],
                            instagram: req.body['footer.instagram'],
                            twitter: req.body['footer.twitter'],
                            youtube: req.body['footer.youtube']
                        },
                        quickLinks: [
                            req.body.page_1,
                            req.body.page_2,
                            req.body.page_3,
                            req.body.page_4
                        ].filter(Boolean),
                        categories: [
                            req.body.category1,
                            req.body.category2,
                            req.body.category3,
                            req.body.category4,
                            req.body.category5,
                            req.body.category6,
                            req.body.category7,
                            req.body.category8
                        ].filter(c => c && c.trim() !== ""),
                        contact: {
                             dnumber: req.body['footer.dnumber'] || req.body.dnumber,
                            streetname: req.body['footer.streetname'] || req.body.streetname,
                            city: req.body['footer.city'] || req.body.city,
                            district: req.body['footer.district'] || req.body.district,
                            state: req.body['footer.state'] || req.body.state,
                            zipcode: req.body['footer.zipcode'] || req.body.zipcode,
                            primaryphone: req.body['footer.primaryphone'] || req.body.primaryphone || req.body['footer.phone'],
                            secondaryphone: req.body['footer.secondaryphone'] || req.body.secondaryphone,
                            supportemail: req.body['footer.email'] || req.body.supportemail || req.body.email,
                            workinghours: req.body['footer.hours'] || req.body.workinghours || req.body.hours,
                        }
                    }
                }
            });

            await data.save();
            res.send(`<script>
                alert('Data stored successfully ✅');
                window.location.href='/controls';
            </script>`);

        } catch (err) {
            console.error(err);
            res.status(500).send(`<script>
                alert('Upload failed: ${String(err.message || err)}');
                window.location.href='/add';
            </script>`);
        }
    }
);

/* ================== GENERIC FIELD UPDATE/DELETE ================== */
function setDeep(obj, path, value){
    const parts = path.split('.').filter(Boolean);
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i];
        const idx = Number.isInteger(+key) ? +key : key;
        if (cur[idx] === undefined || cur[idx] === null) cur[idx] = {};
        cur = cur[idx];
    }
    const last = parts[parts.length - 1];
    const lastIdx = Number.isInteger(+last) ? +last : last;
    cur[lastIdx] = value;
}

function deleteDeep(obj, path){
    const parts = path.split('.').filter(Boolean);
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i];
        const idx = Number.isInteger(+key) ? +key : key;
        if (cur[idx] === undefined || cur[idx] === null) return;
        cur = cur[idx];
    }
    const last = parts[parts.length - 1];
    const lastIdx = Number.isInteger(+last) ? +last : last;
    if (Array.isArray(cur) && typeof lastIdx === 'number') {
        cur.splice(lastIdx, 1);
    } else {
        delete cur[lastIdx];
    }
}

function restoreDeep(obj, path, value){
    const parts = path.split('.').filter(Boolean);
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i];
        const idx = Number.isInteger(+key) ? +key : key;
        if (cur[idx] === undefined || cur[idx] === null) {
            cur[idx] = Number.isInteger(+parts[i + 1]) ? [] : {};
        }
        cur = cur[idx];
    }
    const last = parts[parts.length - 1];
    const lastIdx = Number.isInteger(+last) ? +last : last;
    if (Array.isArray(cur) && typeof lastIdx === 'number') {
        if (cur[lastIdx] === undefined || cur[lastIdx] === null) {
            cur[lastIdx] = value;
        } else {
            cur.splice(lastIdx, 0, value);
        }
    } else {
        cur[lastIdx] = value;
    }
}

pagerouter.post('/api/pages/update-field', upload.single('file'), async (req, res) => {
    try {
        const { path: fieldPath, value } = req.body;
        if (!fieldPath) return res.status(400).json({ error: 'Missing path' });
        const pageDoc = await PageHeader.findOne().sort({ _id: -1 });
        if (!pageDoc) return res.status(404).json({ error: 'No PageHeader found' });
        const newVal = req.file ? req.file.filename : value;
        setDeep(pageDoc.pages, fieldPath, newVal);
        pageDoc.markModified('pages');
        await pageDoc.save();
        res.json({ success: true, value: newVal });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Update failed' });
    }
});

/* ================= ADD ARRAY ITEM ================= */
pagerouter.post('/api/pages/add-array-item', express.json(), async (req, res) => {
    try {
        const { path, value } = req.body;
        if (!path) return res.status(400).json({ error: 'Missing path' });

        const pageDoc = await PageHeader.findOne().sort({ _id: -1 });
        if (!pageDoc) return res.status(404).json({ error: 'No PageHeader found' });

        // Navigate to the array
        const parts = path.split('.').filter(Boolean);
        let cur = pageDoc.pages;
        for (let i = 0; i < parts.length; i++) {
            if (!cur[parts[i]]) cur[parts[i]] = [];
            cur = cur[parts[i]];
        }

        if (!Array.isArray(cur)) {
            return res.status(400).json({ error: 'Target is not an array' });
        }

        cur.push(value);
        pageDoc.markModified('pages');
        await pageDoc.save();

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Add failed' });
    }
});

/* ================= DELETE FIELD ================= */
pagerouter.delete('/api/pages/delete', async (req, res) => {
  try {
    const { path, value, type } = req.body;
    if (!path) return res.status(400).json({ success: false, error: 'Missing path' });

    const pageDoc = await PageHeader.findOne().sort({ _id: -1 });
    if (!pageDoc) return res.status(404).json({ success: false, error: 'No PageHeader found' });

    await DeletedField.create({ path, value, type });

    deleteDeep(pageDoc.pages, path);
    pageDoc.markModified('pages');
    await pageDoc.save();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

/* ================= LIST DELETED ================= */
pagerouter.get('/api/pages/deleted', async (req, res) => {
  const data = await DeletedField.find().sort({ deletedAt: -1 });
  res.json(data);
});

/* ================= RESTORE ================= */
pagerouter.post('/api/pages/restore', express.json(), async (req, res) => {
    try {
        const { id } = req.body;
        const item = await DeletedField.findById(id);
        if (!item) return res.status(404).json({ success: false, error: 'Not found' });

        const pageDoc = await PageHeader.findOne().sort({ _id: -1 });
        if (!pageDoc) return res.status(404).json({ success: false, error: 'No PageHeader found' });

        restoreDeep(pageDoc.pages, item.path, item.value);
        pageDoc.markModified('pages');
        await pageDoc.save();

        await DeletedField.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});


/* ================== READ API ================== */
pagerouter.get('/api/pages', async (req, res) => {
    try {
        const data = await PageHeader.findOne().sort({ _id: -1 });
        res.json(data);
    } catch {
        res.status(500).json({ error: 'Fetch failed' });
    }
});


module.exports = pagerouter;
