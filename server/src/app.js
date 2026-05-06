require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const router = require('./routes/index');
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser());

app.use('/api', router);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});