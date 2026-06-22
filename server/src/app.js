require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const router = require('./routes/index');
const cookieParser = require("cookie-parser");
const cors = require("cors");

const allowedOrigins = [
    'http://localhost:5173',
    'https://vel.up.railway.app',
];

app.use(
    cors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
    }),
);

app.use(express.json());
app.use(cookieParser());

app.use('/api', router);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});