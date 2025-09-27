import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Routes, Route } from "react-router-dom";
import Add from "./pages/Add";
import List from "./pages/List";
import Orders from "./pages/Orders";
import Dashboard from "./pages/Dashboard";
import Login from "./components/Login";
import { ToastContainer } from 'react-toastify';
import { assets } from './assets/assets';

export const backendUrl = import.meta.env.VITE_BACKEND_URL; // Backend URL
export const currency = '₹';
export { assets };

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token')? localStorage.getItem('token'):""); // Get token from local storage
  useEffect(()=>{
    localStorage.setItem('token', token); // Save token to local storage 
    //this will help to keep the user logged in even after the page is refreshed
  },[token]);
  
  // const [token, setToken] = useState(""); // Token state

  return (
    <div className="bg-gray-50 min-h-screen">
        <ToastContainer />
      {token === "" ? (
        <Login setToken={setToken}/>
      ) : (
        <>
          <Navbar setToken={setToken}/>
          <hr />
          <div className="flex w-full">
            <Sidebar />
            <div className="w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base">
              <Routes>
                <Route path="/dashboard" element={<Dashboard token={token}/>} />
                <Route path="/add" element={<Add token={token}/>} />
                <Route path="/list" element={<List token={token}/>} />
                <Route path="/orders" element={<Orders token={token}/>} />
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
