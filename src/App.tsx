import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AttendanceProvider } from './context/AttendanceContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RegisterStudent from './pages/RegisterStudent';
import TakeAttendance from './pages/TakeAttendance';
import ViewRecords from './pages/ViewRecords';
import ManageStudents from './pages/ManageStudents';
import NotFound from './pages/NotFound';
import StudentRecord from './pages/StudentRecord';

function App() {
  return (
    <ThemeProvider>
      <AttendanceProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/register" element={<RegisterStudent />} />
              <Route path="/attendance" element={<TakeAttendance />} />
              <Route path="/records" element={<ViewRecords />} />
              <Route path="/manage-students" element={<ManageStudents />} />
              <Route path="/student-record" element={<StudentRecord />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AttendanceProvider>
    </ThemeProvider>
  );
}

export default App;
