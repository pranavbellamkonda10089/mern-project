import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Search,
    PlusCircle,
    MapPin,
    QrCode,
    Sparkles
} from 'lucide-react';
import axios from 'axios';

const categories = [
    { id: '', label: 'All Categories' },
    { id: 'electronics', label: 'Electronics' },
    { id: 'id_cards', label: 'ID Cards & Wallets' },
    { id: 'stationery', label: 'Books & Stationery' },
    { id: 'accessories', label: 'Bottles & Flasks' },
    { id: 'keys_wallets', label: 'Keys & Wallets' },
    { id: 'clothing', label: 'Clothing & Bags' },
    { id: 'other', label: 'Other' }
];

const Home = () => {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchItems();
    }, [filterType, selectedCategory, search]);

    const fetchItems = async () => {
        try {
            setLoading(true);
            let url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items`;
            const params = new URLSearchParams();
            if (search.trim()) params.append('search', search.trim());
            if (filterType) params.append('type', filterType);
            if (selectedCategory) params.append('category', selectedCategory);
            if (params.toString()) url += `?${params.toString()}`;

            const { data } = await axios.get(url);
            setItems(data);
        } catch (error) {
            console.error('Error fetching items', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container animate-fade-in">
            {/* Hero Section */}
            <div className="hero">
                <div className="hero-bg-blob"></div>
                <h1 style={{ fontSize: '3.8rem', marginBottom: '1.25rem', color: '#ffffff', letterSpacing: '-1px' }}>
                    Find what you <span className="gradient-text">Lost</span>.<br />Return what you <span className="gradient-text">Found</span>.
                </h1>
                <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: '650px', margin: '0 auto 2.5rem auto', lineHeight: '1.6' }}>
                    The centralized, secure lost & found system for college students.
                    Search campus listings, submit verification claims, or tag your ID cards and valuables with QR tags.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/post-lost" className="btn-primary" style={{ background: 'var(--danger)', boxShadow: '0 4px 14px 0 rgba(239, 68, 68, 0.39)', padding: '0.85rem 1.75rem' }}>
                        <PlusCircle size={20} /> I Lost Something
                    </Link>
                    <Link to="/post-found" className="btn-primary" style={{ background: 'var(--success)', boxShadow: '0 4px 14px 0 rgba(34, 197, 94, 0.39)', padding: '0.85rem 1.75rem' }}>
                        <PlusCircle size={20} /> I Found Something
                    </Link>
                </div>
            </div>

            {/* Listings Header & Search Bar */}
            <div style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Campus Activity Feed</h2>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Live active posts across all campus hostels, libraries, and canteens
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* Search Input */}
                        <div style={{ position: 'relative', minWidth: '240px' }}>
                            <input
                                type="text"
                                placeholder="Search by title, location, color..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ paddingLeft: '2.4rem', width: '100%' }}
                            />
                            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        </div>

                        {/* Type Toggle */}
                        <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '0.25rem', borderRadius: '50px', border: '1px solid var(--border-color)' }}>
                            <button
                                onClick={() => setFilterType('')}
                                style={{ background: filterType === '' ? 'var(--accent-primary)' : 'transparent', color: filterType === '' ? '#fff' : 'var(--text-secondary)', padding: '0.4rem 1.1rem', borderRadius: '50px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', transition: 'all 0.2s' }}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilterType('lost')}
                                style={{ background: filterType === 'lost' ? 'var(--danger)' : 'transparent', color: filterType === 'lost' ? '#fff' : 'var(--text-secondary)', padding: '0.4rem 1.1rem', borderRadius: '50px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', transition: 'all 0.2s' }}
                            >
                                Lost
                            </button>
                            <button
                                onClick={() => setFilterType('found')}
                                style={{ background: filterType === 'found' ? 'var(--success)' : 'transparent', color: filterType === 'found' ? '#fff' : 'var(--text-secondary)', padding: '0.4rem 1.1rem', borderRadius: '50px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', transition: 'all 0.2s' }}
                            >
                                Found
                            </button>
                        </div>
                    </div>
                </div>

                {/* Category Pills Bar */}
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '2rem' }}>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`filter-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Grid of Items */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                        Loading campus items...
                    </div>
                ) : items.length === 0 ? (
                    <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                        <Sparkles size={40} color="var(--accent-primary)" style={{ margin: '0 auto 1rem auto' }} />
                        <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>No listings found</h3>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
                            {search || selectedCategory || filterType
                                ? "No items match your active filters. Try clearing filters or searching for different keywords."
                                : "No active lost or found items right now. Be the first to report something!"}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <Link to="/post-lost" className="btn-secondary">Post Lost Item</Link>
                            <Link to="/post-found" className="btn-primary">Post Found Item</Link>
                        </div>
                    </div>
                ) : (
                    <div className="items-grid">
                        {items.map((item, index) => (
                            <Link to={`/item/${item._id}`} key={item._id} className={`item-card glass-card delay-${(index % 3 + 1) * 100}`}>
                                <div
                                    className="item-card-image"
                                    style={{
                                        backgroundImage: `url(${item.photoUrl || 'https://images.unsplash.com/photo-1614728447814-74971c24ed6a?auto=format&fit=crop&w=600&q=80'})`,
                                        position: 'relative'
                                    }}
                                >
                                    <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(6px)', padding: '0.25rem 0.6rem', borderRadius: '20px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#fff' }}>
                                        <QrCode size={12} /> QR Tag
                                    </div>
                                </div>

                                <div className="item-card-content">
                                    <div className="item-card-header">
                                        <span className={`badge badge-${item.type}`}>{item.type}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            {new Date(item.date || item.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem', color: 'var(--text-color)' }}>{item.title}</h3>

                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem', flex: 1, lineHeight: '1.5' }}>
                                        {item.description.length > 90 ? `${item.description.substring(0, 90)}...` : item.description}
                                    </p>

                                    {/* Tags Preview */}
                                    {item.tags && item.tags.length > 0 && (
                                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                                            {item.tags.slice(0, 2).map((t, idx) => (
                                                <span key={idx} className="tag-chip" style={{ fontSize: '0.7rem', padding: '0.1rem 0.45rem' }}>
                                                    #{t}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            <MapPin size={13} color="var(--accent-primary)" /> {item.location}
                                        </span>
                                        <span style={{ textTransform: 'capitalize' }}>
                                            {item.category?.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
