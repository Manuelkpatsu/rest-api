const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');

const app = express();

require('dotenv').config();

const port = process.env.PORT || 8080;

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' || 
        file.mimetype === 'image/jpg' || 
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images')));

// Cross-Origin Resource Sharing (CORS)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Imported routes
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

// Routes
app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

// Error handler
app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});

mongoose
    .connect(process.env.DATABASE_URL, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    })
    .then(result => {
        app.listen(port, () => {
            console.log(`server is running on http://localhost:${port}`);
        });
    })
    .catch(err => {
        console.log(err);
    });
