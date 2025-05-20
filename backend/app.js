const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
require('dotenv').config(); // add this at the top

const studentRoutes = require('./routes/studentRoutes');
app.use('/api/students', studentRoutes);


require('dotenv').config();
connectDB();

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));

module.exports = app;
