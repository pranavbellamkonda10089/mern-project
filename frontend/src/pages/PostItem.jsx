import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Sparkles, MapPin, Calendar, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';

const PostItem = ({ type }) => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'electronics',
        color: '',
        tags: '',
        location: '',
        date: new Date().toISOString().split('T')[0],
        image: null,
        claimQuestion: ''
    });

    const [suggestedMatches, setSuggestedMatches] = useState([]);
    const [loadingMatches, setLoadingMatches] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Real-time auto-check for opposite type items as the user types title/category
    useEffect(() => {
        if (!user) return;
        const queryTerm = formData.title.trim();
        if (queryTerm.length < 3) {
            setSuggestedMatches([]);
            return;
        }

        const debounceTimer = setTimeout(async () => {
            try {
                setLoadingMatches(true);
                const oppositeType = type === 'lost' ? 'found' : 'lost';
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items?type=${oppositeType}&search=${encodeURIComponent(queryTerm)}&status=active`
                );
                setSuggestedMatches(res.data.slice(0, 3));
            } catch (err) {
                console.error('Error fetching suggestions:', err);
            } finally {
                setLoadingMatches(false);
            }
        }, 400);

        return () => clearTimeout(debounceTimer);
    }, [formData.title, formData.category, type, user]);

    if (!user) return <Navigate to="/login" />;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            const formDataSend = new FormData();
            formDataSend.append('type', type);
            formDataSend.append('title', formData.title);
            formDataSend.append('description', formData.description);
            formDataSend.append('category', formData.category);
            formDataSend.append('color', formData.color);
            formDataSend.append('location', formData.location);
            formDataSend.append('date', formData.date);
            if (formData.tags) formDataSend.append('tags', formData.tags);
            if (formData.claimQuestion) formDataSend.append('claimQuestion', formData.claimQuestion);
            if (formData.image) formDataSend.append('image', formData.image);

            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items`,
                formDataSend,
                config
            );
            navigate(`/item/${data._id}`);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Error creating item post. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container animate-fade-in" style={{ maxWidth: '800px' }}>
            <div className="glass-card form-container" style={{ maxWidth: '100%' }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '2.2rem', textAlign: 'center' }}>
                    Post a <span className="gradient-text">{type === 'lost' ? 'Lost' : 'Found'}</span> Item
                </h2>

                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.9rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertCircle size={18} /> {error}
                    </div>
                )}

                {/* Auto-check / Smart Matching Live Suggestions */}
                {formData.title.trim().length >= 3 && (
                    <div className="match-preview-box animate-fade-in">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)' }}>
                                <Sparkles size={16} />
                                {type === 'lost' ? 'Potential Matching "Found" Posts' : 'Potential Matching "Lost" Reports'}
                            </span>
                            {loadingMatches && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Checking...</span>}
                        </div>

                        {suggestedMatches.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>
                                    {type === 'lost'
                                        ? 'Someone might have already reported finding this item! Check these before posting:'
                                        : 'A student has reported losing a similar item! You can match directly:'}
                                </p>
                                {suggestedMatches.map(match => (
                                    <Link
                                        key={match._id}
                                        to={`/item/${match._id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="match-item-card"
                                    >
                                        {match.photoUrl && (
                                            <img
                                                src={match.photoUrl}
                                                alt={match.title}
                                                style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px' }}
                                            />
                                        )}
                                        <div style={{ flex: 1 }}>
                                            <strong style={{ fontSize: '0.9rem', color: 'var(--text-color)' }}>{match.title}</strong>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', marginTop: '0.2rem' }}>
                                                <span><MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {match.location}</span>
                                                <span><Calendar size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {new Date(match.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <ExternalLink size={16} color="var(--accent-primary)" />
                                    </Link>
                                ))}
                            </div>
                        ) : !loadingMatches && (
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <CheckCircle2 size={14} color="var(--success)" /> No immediate active matches found for "{formData.title}". Proceeding to create your post.
                            </p>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Item Title * (e.g. Blue Milton Water Bottle / Student ID Card)</label>
                        <input
                            type="text"
                            placeholder="e.g. Black Dell Laptop Charger / Silver Hydro Flask"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Detailed Description *</label>
                        <textarea
                            rows="4"
                            placeholder="Describe distinguishing marks, brand, condition, stickers, contents, or circumstances..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Category *</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="electronics">Electronics (Laptops, Chargers, Earbuds)</option>
                                <option value="id_cards">ID Cards & Documents</option>
                                <option value="stationery">Stationery & Books</option>
                                <option value="accessories">Bottles, Flasks & Accessories</option>
                                <option value="keys_wallets">Keys & Wallets</option>
                                <option value="clothing">Clothing & Bags</option>
                                <option value="other">Other Campus Items</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Color / Shade</label>
                            <input
                                type="text"
                                placeholder="e.g. Navy Blue / Matte Black"
                                value={formData.color}
                                onChange={e => setFormData({ ...formData, color: e.target.value })}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Date {type === 'lost' ? 'Lost' : 'Found'} *</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Campus Location *</label>
                            <input
                                type="text"
                                placeholder="e.g. Library 2nd Floor / Main Canteen / Hall 4"
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Tags (Comma-separated for quick search)</label>
                        <input
                            type="text"
                            placeholder="e.g. bottle, milton, blue, library, hall2"
                            value={formData.tags}
                            onChange={e => setFormData({ ...formData, tags: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Upload Item Photo {type === 'lost' ? '(Optional)' : '(Recommended)'}</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={e => setFormData({ ...formData, image: e.target.files[0] })}
                        />
                    </div>

                    {type === 'found' && (
                        <div className="form-group" style={{ background: 'rgba(99, 102, 241, 0.08)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                            <label style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                                Security Verification Question *
                            </label>
                            <p style={{ margin: '0.2rem 0 0.6rem 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                To ensure the rightful owner claims this item, specify a question only they would know (e.g. "What sticker is on the back?", "What is written on the first page?").
                            </p>
                            <input
                                type="text"
                                placeholder="e.g. What is the lock screen wallpaper or laptop serial ending?"
                                value={formData.claimQuestion}
                                onChange={e => setFormData({ ...formData, claimQuestion: e.target.value })}
                                required
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="btn-primary"
                        style={{
                            width: '100%',
                            marginTop: '1rem',
                            padding: '1rem',
                            background: type === 'lost' ? 'var(--danger)' : 'var(--success)'
                        }}
                    >
                        {submitting ? 'Submitting...' : `Submit ${type === 'lost' ? 'Lost' : 'Found'} Item`}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PostItem;
