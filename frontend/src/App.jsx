import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PostItem from './pages/PostItem';
import ItemDetails from './pages/ItemDetails';
import Admin from './pages/Admin';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/post-lost" element={<PostItem type="lost" />} />
        <Route path="/post-found" element={<PostItem type="found" />} />
        <Route path="/item/:id" element={<ItemDetails />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </>
  );
}

export default App;
