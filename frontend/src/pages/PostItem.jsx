import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PostItem = ({ type }) => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'electronics',
        location: '',
        date: '',
        image: null,
        claimQuestion: ''
    });

    if (!user) return <Navigate to="/login" />;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' } };

            const formDataSend = new FormData();
            formDataSend.append('type', type);
            formDataSend.append('title', formData.title);
            formDataSend.append('description', formData.description);
            formDataSend.append('category', formData.category);
            formDataSend.append('location', formData.location);
            formDataSend.append('date', formData.date);
            if (formData.claimQuestion) formDataSend.append('claimQuestion', formData.claimQuestion);
            if (formData.image) formDataSend.append('image', formData.image);

            await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items`, formDataSend, config);
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            alert('Error creating post');
        }
    };

    return (
        <div className="container animate-fade-in">
            <div className="glass-card form-container">
                <h2 style={{ marginBottom: '1.5rem', fontSize: '2rem', textAlign: 'center' }}>
                    Post a <span className={`gradient-text`}>{type === 'lost' ? 'Lost' : 'Found'}</span> Item
                </h2>
                {type === 'lost' && (
                    <div style={{ background: 'rgba(234, 179, 8, 0.1)', borderLeft: '4px solid #eab308', padding: '1rem', marginBottom: '2rem', borderRadius: '4px' }}>
                        <p style={{ margin: 0, color: 'var(--text-color)', fontSize: '0.95rem' }}>
                            <strong>Wait!</strong> Before you post this, did you search the <a href="/" style={{ color: '#eab308', textDecoration: 'underline' }}>Found items dashboard</a> to see if someone already turned your item in?
                        </p>
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Item Title (e.g. Blue Water Bottle)</label>
                        <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea rows="4" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Category</label>
                            <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                <option value="electronics">Electronics</option>
                                <option value="id_cards">ID Cards & Wallets</option>
                                <option value="stationery">Stationery & Books</option>
                                <option value="accessories">Accessories/Bottles</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Date {type === 'lost' ? 'Lost' : 'Found'}</label>
                            <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Location</label>
                        <input type="text" placeholder="e.g. Library 2nd Floor" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Upload Photo</label>
                        <input type="file" accept="image/*" onChange={e => setFormData({ ...formData, image: e.target.files[0] })} />
                    </div>
                    {type === 'found' && (
                        <div className="form-group">
                            <label>Security Question (To verify claimant)</label>
                            <input type="text" placeholder="e.g. What is the wallpaper on the phone?" value={formData.claimQuestion} onChange={e => setFormData({ ...formData, claimQuestion: e.target.value })} required />
                        </div>
                    )}
                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>
                        Submit {type === 'lost' ? 'Lost' : 'Found'} Item
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PostItem;
