import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Admin from "./components/Admin";
import Attendance from "./components/AttendanceList";
import DailyUpdates from "./components/DailyUpdates";
import Layout from "./components/layout/Layout";
import Login from "./components/Login";
import MyAttendance from "./components/MyAttendance";
import NotFound from "./components/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Signup from "./components/Signup";
import Teachers from "./components/Teachers";
import Settings from "./components/Settings";
import StudentForm from "./components/Students";
import TodaysAttendance from "./components/TodaysAttendance";
import TestSubmission from "./components/TestSubmission";
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<TodaysAttendance />} />
            {/* <Route path="/dashboard" element={<MyAttendance />} /> */}
            <Route path="/my-attendance" element={<MyAttendance/>}/>
            {/* <Route path="/today-attendance" element={<TodaysAttendance/>}/> */}
            <Route path="/settings" element={<Settings/>}/>
            <Route path="/teachers" element={<Teachers/>}/>
            <Route path="/admin" element={<Admin/>}/>
            <Route path="/daily-updates" element={<DailyUpdates/>}/>
            <Route path="/test-submission" element={<TestSubmission/>}/>
            <Route path="/students" element={<StudentForm/>} />
            <Route path="*" element={<NotFound />}/>
            <Route path="*" element={<NotFound />}/>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
