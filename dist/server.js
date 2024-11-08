const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const JSZip = require('jszip');

const app = express();

const upload = multer({
    dest: path.join(__dirname, 'uploads'),
    limits: {
        fileSize: 100 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|bmp|mp4|webm|ogg/;
        const mimetype = filetypes.test(file.mimetype.toLowerCase());
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image and video files are allowed!'));
    },
});

app.use(express.static(__dirname));

app.use(express.json());

app.get(['/scenelist', '/scenelist/'], (req, res) => {
    const assetsDir = path.join(__dirname, 'assets');

    fs.readdir(assetsDir, (err, files) => {
        if (err) {
            console.error('Error reading assets directory:', err);
            return res.status(500).json({ error: 'Failed to read assets directory' });
        }

        const sceneFiles = files.filter((file) => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.mp4', '.webm', '.ogg'].includes(ext);
        });

        res.json(sceneFiles);
    });
});

app.get(['/medialist', '/medialist/'], (req, res) => {
    const assetsDir = path.join(__dirname, 'assets');

    fs.readdir(assetsDir, (err, files) => {
        if (err) {
            console.error('Error reading assets directory:', err);
            return res.status(500).json({ error: 'Failed to read assets directory' });
        }

        const mediaFiles = files.filter((file) => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.mp4', '.webm', '.ogg'].includes(ext);
        });

        res.json(mediaFiles);
    });
});

app.post('/upload', upload.array('scenes', 20), (req, res) => {
    const assetsDir = path.join(__dirname, 'assets');

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files were uploaded.' });
    }

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

app.post('/uploadmedia', upload.array('media', 20), (req, res) => {
    const assetsDir = path.join(__dirname, 'assets');

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files were uploaded.' });
    }

    req.files.forEach((file) => {
        const tempPath = file.path;
        const targetPath = path.join(assetsDir, file.originalname);

        fs.rename(tempPath, targetPath, (err) => {
            if (err) {
                console.error('Error saving uploaded file:', err);
            }
        });
    });

    res.json({ message: 'Media uploaded successfully.' });
});

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

app.delete('/deletemedia', (req, res) => {
    const mediaName = req.body.mediaName;
    if (!mediaName) {
        return res.status(400).json({ error: 'No media name provided.' });
    }

    const mediaPath = path.join(__dirname, 'assets', mediaName);

    fs.unlink(mediaPath, (err) => {
        if (err) {
            console.error('Error deleting media:', err);
            return res.status(500).json({ error: 'Failed to delete media.' });
        }

        res.json({ message: 'Media deleted successfully.' });
    });
});

app.get('/export-project', async (req, res) => {
    try {
        const zip = new JSZip();
        const assetsDir = path.join(__dirname, 'assets');

        // Lire tous les fichiers du dossier assets
        const files = await fs.promises.readdir(assetsDir);

        // Ajouter chaque fichier au zip
        for (const file of files) {
            const filePath = path.join(assetsDir, file);
            // Vérifier si c'est un fichier (pas un répertoire)
            const stat = await fs.promises.stat(filePath);
            if (stat.isFile()) {
                const fileData = await fs.promises.readFile(filePath);
                zip.file(`assets/${file}`, fileData);
            }
        }

        // Ajouter le project.json dans le dossier assets
        const projectData = req.query.projectData;
        if (projectData) {
            zip.file('assets/project.json', decodeURIComponent(projectData));
        }

        // Générer le zip
        const zipContent = await zip.generateAsync({ type: 'nodebuffer' });

        // Envoyer le zip
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename=virtual-tour-project.zip');
        res.send(zipContent);
    } catch (error) {
        console.error('Error creating zip:', error);
        res.status(500).json({ error: 'Failed to create project archive' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
