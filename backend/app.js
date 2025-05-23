const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'uploads')));

app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
