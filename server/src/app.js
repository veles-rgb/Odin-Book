require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const router = require('./routes/index');
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require('path');
const checkIpBan = require('./src/middleware/checkIpBan');

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3001',
    'https://vel.up.railway.app',
    'https://vel-server.up.railway.app',
    process.env.CLIENT_URL,
].filter(Boolean);

app.set('trust proxy', true);
app.use(checkIpBan);

app.use(
    cors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(null, false);
        },
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());

app.use('/api', router);

const clientDistPath = path.join(__dirname, '../../client/dist');

app.use(express.static(clientDistPath));

app.use((req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});