// const express = require('express');
// const cors = require('cors');
// const fs = require('fs');
// const path = require('path');
// const app = express();
// const PORT = 5000;
// require('dotenv').config(); // add this at the top
// require('./config/db'); 
// require('./routes/studentRoutes');




// // Ensure data files exist
// const ensureFileExists = (file) => {
//   if (!fs.existsSync(file)) {
//     fs.writeFileSync(file, '[]');
//   }
// };

// ensureFileExists(path.join(__dirname, 'data/student.json'));
// ensureFileExists(path.join(__dirname, 'data/attendance.json'));

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Routes
// const studentRoutes = require('./routes/studentRoutes');
// const attendanceRoutes = require('./routes/attendanceRoutes');

// app.use('/api/students', require('./routes/studentRoutes')); 
// app.use('/api/students', studentRoutes);
// app.use('/api/attendance', attendanceRoutes);

// app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));








const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json()); // <-- critical to read JSON body

// Mount student routes
app.use('/api/students', require('./routes/studentRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
