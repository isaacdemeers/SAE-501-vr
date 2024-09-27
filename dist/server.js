// server.js

const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer'); // Middleware for handling file uploads

const app = express();

// Configure multer for file uploads
const upload = multer({
    dest: path.join(__dirname, 'uploads'), // Temporary upload directory
    limits: {
        fileSize: 10 * 1024 * 1024, // Limit file size to 10MB
    },
    fileFilter: (req, file, cb) => {
        // Accept images only
        const filetypes = /jpeg|jpg|png|gif|bmp/;
        const mimetype = filetypes.test(file.mimetype.toLowerCase());
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    },
});

// Serve static files from the project root
app.use(express.static(__dirname));

// Middleware to parse JSON bodies
app.use(express.json());

// Endpoint to get the list of images in /assets
app.get('/imagelist', (req, res) => {
    const assetsDir = path.join(__dirname, 'assets');

    fs.readdir(assetsDir, (err, files) => {
        if (err) {
            console.error('Error reading assets directory:', err);
            return res.status(500).json({ error: 'Failed to read assets directory' });
        }

        // Filter out non-image files
        const imageFiles = files.filter((file) => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.gif', '.bmp'].includes(ext);
        });

        res.json(imageFiles);
    });
});

// Endpoint to handle image uploads
app.post('/upload', upload.array('images', 10), (req, res) => {
    const assetsDir = path.join(__dirname, 'assets');

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files were uploaded.' });
    }

    // Move uploaded files from temporary directory to /assets
    req.files.forEach((file) => {
        const tempPath = file.path;
        const targetPath = path.join(assetsDir, file.originalname);

        fs.rename(tempPath, targetPath, (err) => {
            if (err) {
                console.error('Error saving uploaded file:', err);
            }
        });
    });

    res.json({ message: 'Files uploaded successfully.' });
});

// Endpoint to delete an image
app.delete('/deleteimage', (req, res) => {
    const imageName = req.body.imageName;
    if (!imageName) {
        return res.status(400).json({ error: 'No image name provided.' });
    }

    const imagePath = path.join(__dirname, 'assets', imageName);

    fs.unlink(imagePath, (err) => {
        if (err) {
            console.error('Error deleting image:', err);
            return res.status(500).json({ error: 'Failed to delete image.' });
        }

        res.json({ message: 'Image deleted successfully.' });
    });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
