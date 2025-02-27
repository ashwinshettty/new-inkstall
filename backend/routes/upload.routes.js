const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createClient } = require('webdav');
const { auth } = require('../middleware/auth.middleware');
require('dotenv').config();

// Configure multer for temporary file storage
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Normalize NextCloud URL by removing trailing slashes
const normalizeUrl = (url) => url.replace(/\/+$/, '');

// Basic auth credentials
const getBasicAuthHeader = () => {
    const credentials = `${process.env.NEXTCLOUD_USERNAME}:${process.env.NEXTCLOUD_PASSWORD}`;
    return 'Basic ' + Buffer.from(credentials).toString('base64');
};

// Configure WebDAV client
const createWebDAVClient = () => {
    const baseURL = normalizeUrl(process.env.NEXTCLOUD_URL);
    console.log('WebDAV Base URL:', baseURL); // For debugging

    return createClient(
        `${baseURL}/remote.php/dav/files/${encodeURIComponent(process.env.NEXTCLOUD_USERNAME)}/`,
        {
            headers: {
                'Authorization': getBasicAuthHeader(),
                'OCS-APIRequest': 'true'
            }
        }
    );
};

// Upload endpoint
router.post('/photo', auth, upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const file = req.file;
        const fileName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const remotePath = `Photos/${fileName}`;

        // Create a new client instance for this request
        const client = createWebDAVClient();

        // Test connection first
        try {
            const testResponse = await client.getDirectoryContents('/');
            console.log('Connection test successful');
        } catch (testError) {
            console.error('Connection test failed:', testError);
            throw new Error(`NextCloud connection failed: ${testError.message}`);
        }

        // First check if Photos directory exists
        try {
            const exists = await client.exists('Photos');
            if (!exists) {
                console.log('Creating Photos directory...');
                await client.createDirectory('Photos');
            }
        } catch (dirError) {
            console.error('Directory check/creation error:', dirError);
            // Continue anyway as the directory might exist
        }

        // Upload file to NextCloud
        try {
            console.log('Uploading to path:', remotePath);
            
            // Add explicit content type and length headers
            await client.putFileContents(remotePath, file.buffer, {
                contentLength: file.size,
                overwrite: true,
                headers: {
                    'Content-Type': file.mimetype,
                    'Content-Length': file.size.toString()
                }
            });

            // Generate public URL
            const publicUrl = `${normalizeUrl(process.env.NEXTCLOUD_URL)}/index.php/apps/files/?dir=/Photos`;

            res.status(200).json({
                success: true,
                message: 'File uploaded successfully',
                url: publicUrl,
                fileName: fileName
            });
        } catch (uploadError) {
            console.error('Upload error details:', uploadError);
            throw new Error(`Upload failed: ${uploadError.message}`);
        }

    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading file',
            error: error.message
        });
    }
});

module.exports = router;
