import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`, { email, password });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            navigate('/dashboard');
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed. Please ensure the backend server is running on port 5000.' };
        }
    };

    const register = async (name, email, password, role = 'student') => {
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register`, { name, email, password, role });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            navigate('/dashboard');
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Registration failed. Please ensure the backend server is running on port 5000.' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
