import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Search, PlusCircle, MapPin, Calendar } from 'lucide-react';
import axios from 'axios';

const Home = () => {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetchItems();
    }, [filter, search]);

    const fetchItems = async () => {
        try {
            let url = 'http://localhost:5000/api/items';
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (filter) params.append('type', filter);
            if (params.toString()) url += `?${params.toString()}`;

            const { data } = await axios.get(url);
            setItems(data);
        } catch (error) {
            console.error('Error fetching items', error);
        }
    };

    return (
        <div className="container animate-fade-in">
            <div className="hero">
                <div className="hero-bg-blob"></div>
                <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>
                    Find what you <span className="gradient-text">Lost</span>.<br />Return what you <span className="gradient-text">Found</span>.
                </h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
                    The centralized lost and found platform for our college campus.
                    Stop relying on chaotic WhatsApp groups and easily recover your belongings.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <Link to="/post-lost" className="btn-primary" style={{ background: 'var(--danger)', boxShadow: '0 4px 14px 0 rgba(239, 68, 68, 0.39)' }}>
                        <PlusCircle size={20} /> I Lost Something
                    </Link>
                    <Link to="/post-found" className="btn-primary" style={{ background: 'var(--success)', boxShadow: '0 4px 14px 0 rgba(34, 197, 94, 0.39)' }}>
                        <PlusCircle size={20} /> I Found Something
                    </Link>
                </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2>Recent Activity</h2>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ paddingLeft: '2.5rem' }}
                            />
                            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        </div>
                        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                            <option value="">All Items</option>
                            <option value="lost">Lost</option>
                            <option value="found">Found</option>
                        </select>
                    </div>
                </div>

                <div className="items-grid">
                    {items.map((item, index) => (
                        <Link to={`/item/${item._id}`} key={item._id} className={`item-card glass-card delay-${(index % 3 + 1) * 100}`}>
                            <div
                                className="item-card-image"
                                style={{ backgroundImage: `url(${item.photoUrl || 'https://images.unsplash.com/photo-1614728447814-74971c24ed6a'})` }}
                            ></div>
                            <div className="item-card-content">
                                <div className="item-card-header">
                                    <span className={`badge badge-${item.type}`}>{item.type}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>{item.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', flex: 1 }}>
                                    {item.description.substring(0, 80)}...
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <MapPin size={14} /> {item.location}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;
