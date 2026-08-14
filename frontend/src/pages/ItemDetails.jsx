import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
    MapPin,
    Calendar,
    User,
    Info,
    MessageSquare,
    QrCode,
    Flag,
    Trash2,
    CheckCircle,
    CheckCircle2,
    Copy,
    Printer,
    X,
    Palette,
    Tag,
    ShieldCheck,
    Image as ImageIcon,
    Send,
    AlertCircle,
    Sparkles
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const ItemDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [item, setItem] = useState(null);
    const [messages, setMessages] = useState([]);
    const [claims, setClaims] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    // Response / Claim modal & form states
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [finderLocation, setFinderLocation] = useState('');
    const [finderMessage, setFinderMessage] = useState('');
    const [finderImage, setFinderImage] = useState(null);
    const [claimProofAnswer, setClaimProofAnswer] = useState('');
    const [submittingResponse, setSubmittingResponse] = useState(false);

    // QR & Report Modals
    const [showQrModal, setShowQrModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('Spam / Misleading');
    const [reportDetails, setReportDetails] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [reportSuccess, setReportSuccess] = useState('');
    const [copied, setCopied] = useState(false);

    const printRef = useRef(null);
    const chatSectionRef = useRef(null);

    useEffect(() => {
        fetchItemAndMessages();
    }, [id, user]);

    const fetchItemAndMessages = async () => {
        try {
            const [itemRes, msgRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items/${id}`),
                axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items/${id}/messages`)
            ]);
            setItem(itemRes.data);
            setMessages(msgRes.data);

            const posterId = itemRes.data.postedBy?._id || itemRes.data.postedBy;
            if (user && (user._id === posterId || user.role === 'admin')) {
                const claimsRes = await axios.get(
                    `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items/${id}/claim`,
                    { headers: { Authorization: `Bearer ${user.token}` } }
                );
                setClaims(claimsRes.data || []);
            } else if (user) {
                // Fetch claims so regular user can see if they already submitted
                try {
                    const claimsRes = await axios.get(
                        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items/${id}/claim`,
                        { headers: { Authorization: `Bearer ${user.token}` } }
                    );
                    setClaims(claimsRes.data || []);
                } catch {
                    // Ignore if restricted
                }
            }
        } catch (err) {
            console.error('Error fetching item details:', err);
        }
    };

    // Handle Form Submit: "I Found This Item" (Lost Item) OR "Claim This Item" (Found Item)
    const handleResponseSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmittingResponse(true);

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            const formData = new FormData();
            if (item.type === 'lost') {
                formData.append('responseType', 'finder_response');
                formData.append('dropLocation', finderLocation);
                formData.append('message', finderMessage);
                if (finderImage) formData.append('image', finderImage);
            } else {
                formData.append('responseType', 'claim_request');
                formData.append('message', claimProofAnswer);
            }

            await axios.post(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items/${id}/claim`,
                formData,
                config
            );

            setSuccess(
                item.type === 'lost'
                    ? 'Thank you! Your response with drop-off details has been sent to the owner.'
                    : 'Claim verification submitted successfully. The poster will review your answer.'
            );
            setShowResponseModal(false);
            setFinderLocation('');
            setFinderMessage('');
            setFinderImage(null);
            setClaimProofAnswer('');
            fetchItemAndMessages();
        } catch (err) {
            setError(err.response?.data?.message || 'Error submitting response. Please try again.');
        } finally {
            setSubmittingResponse(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items/${id}/messages`,
                { text: newMessage },
                config
            );
            setMessages([...messages, data]);
            setNewMessage('');
        } catch (err) {
            console.error('Failed to send message', err);
        }
    };

    const handleUpdateClaim = async (claimId, newStatus) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.patch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items/claim/${claimId}`,
                { status: newStatus },
                config
            );
            fetchItemAndMessages();
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const handleMarkReturned = async () => {
        if (!window.confirm('Mark this item as successfully returned? This will finalize the exchange.')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.patch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items/${id}/status`,
                { status: 'returned' },
                config
            );
            fetchItemAndMessages();
        } catch (err) {
            console.error('Failed to mark as returned:', err);
        }
    };

    const handleDeleteItem = async () => {
        if (!window.confirm('Are you sure you want to delete this listing permanently?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items/${id}`,
                config
            );
            navigate('/dashboard');
        } catch (err) {
            alert('Failed to delete item: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const fullReason = reportDetails ? `${reportReason}: ${reportDetails}` : reportReason;
            await axios.post(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reports`,
                { itemId: id, reason: fullReason },
                config
            );
            setReportSuccess('Report submitted for admin review. Thank you for keeping our campus safe.');
            setTimeout(() => {
                setShowReportModal(false);
                setReportSuccess('');
                setReportDetails('');
            }, 2000);
        } catch (err) {
            alert(err.response?.data?.message || 'Error submitting report');
        }
    };

    const itemUrl = window.location.href;

    const copyItemUrl = () => {
        navigator.clipboard.writeText(itemUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePrintTag = () => {
        window.print();
    };

    const scrollToChat = () => {
        if (chatSectionRef.current) {
            chatSectionRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    if (!item) return <div className="container" style={{ textAlign: 'center', marginTop: '10vh' }}>Loading item details...</div>;

    const isOwner = user && (user._id === (item.postedBy?._id || item.postedBy));
    const isAdmin = user && user.role === 'admin';

    // Check if the current logged in user has already submitted a response/claim
    const userClaim = user ? claims.find(c => (c.claimantId?._id || c.claimantId) === user._id) : null;
    const hasAlreadyResponded = Boolean(userClaim);

    return (
        <div className="container animate-fade-in" style={{ maxWidth: '960px' }}>
            {/* Modal: "I Found This Item" (Lost Item) OR "Claim This Item" (Found Item) */}
            {showResponseModal && (
                <div className="modal-backdrop" onClick={() => setShowResponseModal(false)}>
                    <div className="modal-card animate-fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: item.type === 'lost' ? 'var(--success)' : 'var(--accent-primary)' }}>
                                {item.type === 'lost' ? (
                                    <>
                                        <Sparkles size={20} /> I Found This Item
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck size={20} /> Claim Ownership Verification
                                    </>
                                )}
                            </h3>
                            <button onClick={() => setShowResponseModal(false)} style={{ color: 'var(--text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {item.type === 'lost' ? (
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                                Let <strong>{item.postedBy?.name || 'the owner'}</strong> know where you found their item and how they can collect it.
                            </p>
                        ) : (
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                                Answer the poster's security question and describe distinguishing details to prove this found item belongs to you.
                            </p>
                        )}

                        {error && (
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}

                        <form onSubmit={handleResponseSubmit}>
                            {/* FLOW FOR 'LOST' ITEMS: Simplified drop-off location, message, optional image */}
                            {item.type === 'lost' ? (
                                <>
                                    <div className="form-group">
                                        <label>Current Item Location / Drop-off Point *</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Left at Security Desk, With me at ECE Lab 3, Library Counter"
                                            value={finderLocation}
                                            onChange={e => setFinderLocation(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Contact / Handover Instructions *</label>
                                        <textarea
                                            rows="3"
                                            placeholder="e.g. I picked it up near the stairs. You can message me here or collect it from the counter."
                                            value={finderMessage}
                                            onChange={e => setFinderMessage(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <ImageIcon size={16} /> Optional Photo of Found Item
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => setFinderImage(e.target.files[0])}
                                        />
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                                            Upload a clear photo so the owner can confirm it is theirs immediately.
                                        </span>
                                    </div>
                                </>
                            ) : (
                                /* FLOW FOR 'FOUND' ITEMS: Security proof verification */
                                <>
                                    {item.claimQuestion && (
                                        <div style={{ background: 'rgba(99, 102, 241, 0.08)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--accent-primary)', marginBottom: '1.25rem' }}>
                                            <strong style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', display: 'block', marginBottom: '0.25rem' }}>
                                                Poster's Verification Question:
                                            </strong>
                                            <p style={{ margin: 0, color: 'var(--text-color)', fontWeight: '500', fontSize: '0.9rem' }}>
                                                {item.claimQuestion}
                                            </p>
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label>Your Answer / Proof of Ownership *</label>
                                        <textarea
                                            rows="4"
                                            placeholder="Describe identifying marks, wallpaper, specific contents, or answers to the question above..."
                                            value={claimProofAnswer}
                                            onChange={e => setClaimProofAnswer(e.target.value)}
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button
                                    type="submit"
                                    disabled={submittingResponse}
                                    className="btn-primary"
                                    style={{
                                        flex: 1,
                                        background: item.type === 'lost' ? 'var(--success)' : 'var(--accent-primary)'
                                    }}
                                >
                                    {submittingResponse ? 'Submitting...' : item.type === 'lost' ? 'Send Finder Details' : 'Submit Claim'}
                                </button>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setShowResponseModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* QR Tag Modal */}
            {showQrModal && (
                <div className="modal-backdrop" onClick={() => setShowQrModal(false)}>
                    <div className="modal-card animate-fade-in" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <QrCode size={20} color="var(--accent-primary)" /> Campus Return QR Tag
                            </h3>
                            <button onClick={() => setShowQrModal(false)} style={{ color: 'var(--text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            Print or attach this QR tag to your belongings (ID card, laptop, bottle, keys). Anyone who scans it will directly open this item page to contact you or return it!
                        </p>

                        <div ref={printRef} className="printable-tag">
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.25rem', color: '#1e293b' }}>
                                Campus<span style={{ color: '#6366f1' }}>Crate</span> Return Tag
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 1rem 0' }}>
                                If found, scan QR code to notify owner
                            </p>

                            <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', display: 'inline-block', border: '1px solid #e2e8f0' }}>
                                <QRCodeSVG value={itemUrl} size={180} level="H" includeMargin={true} />
                            </div>

                            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                                <strong style={{ display: 'block', fontSize: '1rem', color: '#0f172a' }}>{item.title}</strong>
                                <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'capitalize' }}>Category: {item.category.replace('_', ' ')}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <button onClick={copyItemUrl} className="btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                {copied ? <CheckCircle size={16} color="var(--success)" /> : <Copy size={16} />}
                                {copied ? 'Link Copied!' : 'Copy Item Link'}
                            </button>
                            <button onClick={handlePrintTag} className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <Printer size={16} /> Print Tag
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Report Abuse Modal */}
            {showReportModal && (
                <div className="modal-backdrop" onClick={() => setShowReportModal(false)}>
                    <div className="modal-card animate-fade-in" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
                                <Flag size={20} /> Report Listing to Admin
                            </h3>
                            <button onClick={() => setShowReportModal(false)} style={{ color: 'var(--text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {reportSuccess ? (
                            <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                                {reportSuccess}
                            </div>
                        ) : (
                            <form onSubmit={handleReportSubmit}>
                                <div className="form-group">
                                    <label>Reason for Report *</label>
                                    <select value={reportReason} onChange={e => setReportReason(e.target.value)}>
                                        <option value="Spam / Misleading">Spam / Misleading / Duplicate</option>
                                        <option value="Fake / Fraudulent Item">Fake / Fraudulent Item</option>
                                        <option value="Inappropriate / Abusive Content">Inappropriate / Abusive Content</option>
                                        <option value="Harassment / Impersonation">Harassment / Impersonation</option>
                                        <option value="Already Returned">Already Returned / Expired</option>
                                        <option value="Other Policy Violation">Other Policy Violation</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Additional Details (Optional)</label>
                                    <textarea
                                        rows="3"
                                        placeholder="Explain why this post violates guidelines..."
                                        value={reportDetails}
                                        onChange={e => setReportDetails(e.target.value)}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                    <button type="submit" className="btn-primary" style={{ flex: 1, background: 'var(--danger)' }}>
                                        Submit Report
                                    </button>
                                    <button type="button" className="btn-secondary" onClick={() => setShowReportModal(false)}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Main Item View */}
            <div className="glass-card" style={{ overflow: 'hidden' }}>
                <div
                    style={{
                        height: '350px',
                        background: `url(${item.photoUrl || 'https://images.unsplash.com/photo-1614728447814-74971c24ed6a?auto=format&fit=crop&w=1200&q=80'}) center/cover`,
                        position: 'relative'
                    }}
                >
                    <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                        <button
                            onClick={() => setShowQrModal(true)}
                            className="btn-secondary"
                            style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem' }}
                            title="Generate QR Tag"
                        >
                            <QrCode size={16} /> QR Tag
                        </button>
                        {user && !isOwner && (
                            <button
                                onClick={() => setShowReportModal(true)}
                                className="btn-secondary"
                                style={{ background: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.4)', color: 'var(--danger)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem' }}
                                title="Report Abuse"
                            >
                                <Flag size={16} /> Report
                            </button>
                        )}
                        {(isOwner || isAdmin) && (
                            <button
                                onClick={handleDeleteItem}
                                className="btn-secondary"
                                style={{ background: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.4)', color: 'var(--danger)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem' }}
                                title="Delete Item"
                            >
                                <Trash2 size={16} /> Delete
                            </button>
                        )}
                    </div>
                </div>

                <div style={{ padding: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <span className={`badge badge-${item.type}`}>{item.type}</span>
                                <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)' }}>
                                    {item.category.replace('_', ' ')}
                                </span>
                            </div>
                            <h1 style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>{item.title}</h1>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span
                                className="badge"
                                style={{
                                    padding: '0.5rem 1rem',
                                    fontSize: '0.85rem',
                                    background: item.status === 'returned'
                                        ? 'rgba(34, 197, 94, 0.15)'
                                        : item.status === 'claimed'
                                        ? 'rgba(234, 179, 8, 0.15)'
                                        : 'rgba(99, 102, 241, 0.15)',
                                    color: item.status === 'returned'
                                        ? 'var(--success)'
                                        : item.status === 'claimed'
                                        ? 'var(--warning)'
                                        : 'var(--accent-primary)',
                                    border: `1px solid ${item.status === 'returned' ? 'rgba(34, 197, 94, 0.3)' : item.status === 'claimed' ? 'rgba(234, 179, 8, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`
                                }}
                            >
                                STATUS: {item.status.toUpperCase()}
                            </span>

                            {(isOwner || isAdmin) && item.status !== 'returned' && (
                                <button
                                    onClick={handleMarkReturned}
                                    className="btn-primary"
                                    style={{ background: 'var(--success)', padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                >
                                    <CheckCircle size={16} /> Mark Returned
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Notification Banner for Success / Alerts */}
                    {success && (
                        <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle2 size={18} /> {success}
                        </div>
                    )}

                    {/* Metadata Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginBottom: '2rem', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius-sm)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ padding: '0.6rem', background: 'var(--bg-primary)', borderRadius: '50%' }}>
                                <Calendar size={18} color="var(--accent-primary)" />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Date</p>
                                <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{new Date(item.date).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ padding: '0.6rem', background: 'var(--bg-primary)', borderRadius: '50%' }}>
                                <MapPin size={18} color="var(--accent-primary)" />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Location</p>
                                <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{item.location}</p>
                            </div>
                        </div>

                        {item.color && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ padding: '0.6rem', background: 'var(--bg-primary)', borderRadius: '50%' }}>
                                    <Palette size={18} color="var(--accent-primary)" />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Color</p>
                                    <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{item.color}</p>
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ padding: '0.6rem', background: 'var(--bg-primary)', borderRadius: '50%' }}>
                                <User size={18} color="var(--accent-primary)" />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Posted By</p>
                                <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{item.postedBy?.name || 'Unknown'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                            {item.tags.map((tag, idx) => (
                                <span key={idx} className="tag-chip">
                                    <Tag size={12} /> #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Description */}
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <Info size={18} /> Description
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '1rem', whiteSpace: 'pre-line' }}>
                            {item.description}
                        </p>
                    </div>

                    {/* Security Question for Found Item */}
                    {item.type === 'found' && item.claimQuestion && (
                        <div style={{ marginBottom: '2.5rem', padding: '1.25rem', background: 'rgba(99, 102, 241, 0.08)', borderRadius: '8px', borderLeft: '4px solid var(--accent-primary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', fontWeight: 'bold', marginBottom: '0.4rem' }}>
                                <ShieldCheck size={18} /> Poster's Verification Question:
                            </div>
                            <p style={{ margin: 0, color: 'var(--text-color)', fontWeight: '500' }}>{item.claimQuestion}</p>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.4rem' }}>
                                (Claimants must provide an accurate answer to this question to verify ownership)
                            </span>
                        </div>
                    )}

                    {/* CTA Section for Responders / Claimants (Non-Owners) */}
                    {user && !isOwner && item.status === 'active' && (
                        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                            {hasAlreadyResponded ? (
                                <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <CheckCircle size={24} color="var(--success)" />
                                        <div>
                                            <strong>
                                                {item.type === 'lost' ? 'Finder response submitted!' : 'Ownership claim submitted!'}
                                            </strong>
                                            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                Status: <span style={{ fontWeight: 'bold', textTransform: 'uppercase', color: userClaim?.status === 'approved' ? 'var(--success)' : userClaim?.status === 'rejected' ? 'var(--danger)' : 'var(--accent-primary)' }}>{userClaim?.status}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={scrollToChat} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
                                        Open Discussion
                                    </button>
                                </div>
                            ) : (
                                <button
                                    className="btn-primary"
                                    onClick={() => setShowResponseModal(true)}
                                    style={{
                                        width: '100%',
                                        padding: '1.1rem',
                                        fontSize: '1.05rem',
                                        background: item.type === 'lost' ? 'var(--success)' : 'var(--accent-primary)',
                                        boxShadow: item.type === 'lost' ? '0 4px 14px rgba(34, 197, 94, 0.39)' : '0 4px 14px rgba(99, 102, 241, 0.39)'
                                    }}
                                >
                                    {item.type === 'lost' ? (
                                        <>
                                            <Sparkles size={20} /> I Found This Item
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck size={20} /> Claim this item
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Manage Responses / Claims for Post Author or Admin */}
                    {(isOwner || isAdmin) && (
                        <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                            <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <User size={18} color="var(--accent-primary)" />
                                {item.type === 'lost'
                                    ? `Finder Responses & Matches (${claims.length})`
                                    : `Manage Claims (${claims.length})`}
                            </h3>

                            {claims.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    {item.type === 'lost'
                                        ? 'No finder responses submitted yet. We will notify you when a student reports finding your item.'
                                        : 'No ownership claims submitted yet.'}
                                </p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {claims.map((claim) => (
                                        <div
                                            key={claim._id}
                                            className="animate-fade-in"
                                            style={{
                                                padding: '1.5rem',
                                                borderRadius: 'var(--border-radius-sm)',
                                                background: 'var(--bg-secondary)',
                                                border: '1px solid var(--border-color)',
                                                borderLeft: `4px solid ${claim.status === 'approved' ? 'var(--success)' : claim.status === 'rejected' ? 'var(--danger)' : 'var(--accent-primary)'}`
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                <div>
                                                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>{claim.claimantId?.name}</h4>
                                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Email: {claim.claimantId?.email}</p>
                                                </div>
                                                <span
                                                    className="badge"
                                                    style={{
                                                        background: claim.status === 'approved' ? 'rgba(34, 197, 94, 0.15)' : claim.status === 'rejected' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                                                        color: claim.status === 'approved' ? 'var(--success)' : claim.status === 'rejected' ? 'var(--danger)' : 'var(--accent-primary)'
                                                    }}
                                                >
                                                    {claim.status.toUpperCase()}
                                                </span>
                                            </div>

                                            {/* Details section based on item type */}
                                            {item.type === 'lost' ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: '0.75rem 0' }}>
                                                    {claim.dropLocation && (
                                                        <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-primary)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <MapPin size={16} color="var(--accent-primary)" />
                                                            <span style={{ fontSize: '0.9rem' }}><strong>Item Location / Drop-off:</strong> {claim.dropLocation}</span>
                                                        </div>
                                                    )}

                                                    <div style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: '6px' }}>
                                                        <strong style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Finder's Handover Message:</strong>
                                                        <p style={{ margin: 0, color: 'var(--text-color)', lineHeight: '1.4' }}>"{claim.message}"</p>
                                                    </div>

                                                    {claim.photoUrl && (
                                                        <div style={{ marginTop: '0.5rem' }}>
                                                            <strong style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Found Item Photo:</strong>
                                                            <a href={claim.photoUrl} target="_blank" rel="noopener noreferrer">
                                                                <img
                                                                    src={claim.photoUrl}
                                                                    alt="Found Item Proof"
                                                                    style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                                                                />
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: '6px', margin: '0.75rem 0' }}>
                                                    <strong style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Claimant's Verification Answer:</strong>
                                                    <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--text-color)' }}>"{claim.message}"</p>
                                                </div>
                                            )}

                                            {/* Action Buttons for Pending Responses */}
                                            {claim.status === 'pending' && (
                                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                                                    <button
                                                        onClick={() => handleUpdateClaim(claim._id, 'approved')}
                                                        className="btn-primary"
                                                        style={{ padding: '0.55rem 1.25rem', flex: 1, background: 'var(--success)' }}
                                                    >
                                                        {item.type === 'lost' ? 'Approve & Confirm Handover' : 'Approve & Verify Ownership'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateClaim(claim._id, 'rejected')}
                                                        className="btn-secondary"
                                                        style={{ padding: '0.55rem 1.25rem', flex: 1, color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                                                    >
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={scrollToChat}
                                                        className="btn-secondary"
                                                        style={{ padding: '0.55rem 1rem' }}
                                                    >
                                                        Message in Chat
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Clarifications & Chat Thread */}
                    <div ref={chatSectionRef} style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                            <MessageSquare size={18} color="var(--accent-primary)" /> Public Clarifications & Discussion
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                            {messages.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No messages yet. Ask a clarifying question about this item!</p>
                            ) : (
                                messages.map(msg => (
                                    <div
                                        key={msg._id}
                                        style={{
                                            padding: '1rem',
                                            borderRadius: 'var(--border-radius-sm)',
                                            background: user?._id === (msg.sender?._id || msg.sender) ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-secondary)',
                                            border: `1px solid ${user?._id === (msg.sender?._id || msg.sender) ? 'rgba(99, 102, 241, 0.25)' : 'var(--border-color)'}`,
                                            alignSelf: user?._id === (msg.sender?._id || msg.sender) ? 'flex-end' : 'flex-start',
                                            minWidth: '240px',
                                            maxWidth: '80%'
                                        }}
                                    >
                                        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', fontWeight: 'bold', color: user?._id === (msg.sender?._id || msg.sender) ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                                            {msg.sender?.name || 'User'} {user?._id === (msg.sender?._id || msg.sender) && '(You)'}
                                        </p>
                                        <p style={{ margin: 0, lineHeight: '1.4', color: 'var(--text-color)' }}>{msg.text}</p>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem', textAlign: 'right' }}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>

                        {user ? (
                            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    placeholder="Type a message or question..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}
                                />
                                <button type="submit" className="btn-primary" disabled={!newMessage.trim()} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <Send size={15} /> Send
                                </button>
                            </form>
                        ) : (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                <Link to="/login" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>Log in</Link> to ask a question or leave a message.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemDetails;
