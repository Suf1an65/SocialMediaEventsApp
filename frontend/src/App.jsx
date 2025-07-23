import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import MyEvents from "./pages/myEvents";
import ViewEvents from "./pages/ViewEvents";
import GroupChatPage from "./pages/GroupchatPage";
import FriendsPage from "./pages/FriendsPage";

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

function RegisterAndLogout() {
  localStorage.clear();
  return <Register />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/myevents"
          element={
            <ProtectedRoute>
              <MyEvents/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/viewevents"
          element={
            <ProtectedRoute>
              <ViewEvents/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/myChats"
          element={
            <ProtectedRoute>
              <GroupChatPage/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/friends"
          element={
            <ProtectedRoute>
              <FriendsPage/>
            </ProtectedRoute>
          }
        />
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

