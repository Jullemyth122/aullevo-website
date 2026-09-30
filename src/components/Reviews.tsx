import React, { useState, useEffect } from 'react';
import { db, auth } from '../config/firebase';
import {
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    setDoc,
    doc,
    serverTimestamp
} from 'firebase/firestore';
import { signInAnonymously, signOut } from 'firebase/auth';

interface Review {
    id: string;
    username: string;
    rating: number;
    feedback: string;
    createdAt: any;
}

const REVIEWS_PER_PAGE = 6;

const RATING_LABELS: Record<number, string> = {
    5: "5.0 - Exceptional",
    4: "4.0 - Very Good",
    3: "3.0 - Average",
    2: "2.0 - Needs Work",
    1: "1.0 - Issues"
};

const StarIcon = ({ filled, onClick, onMouseEnter, onMouseLeave }: { filled: boolean; onClick?: () => void; onMouseEnter?: () => void; onMouseLeave?: () => void }) => (
    <button
        type="button"
        className={`star-icon-btn ${filled ? 'filled' : ''}`}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        aria-label="Star rating"
    >
        <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            className="star-svg-icon"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    </button>
);

const Reviews: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    // Form state
    const [username, setUsername] = useState('');
    const [feedback, setFeedback] = useState('');
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<{ type: string; text: string }>({ type: '', text: '' });
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const q = query(
                collection(db, 'reviews'),
                orderBy('createdAt', 'desc'),
                limit(60)
            );

            const snapshot = await getDocs(q);
            const fetchedReviews: Review[] = [];
            snapshot.forEach((docSnap) => {
                fetchedReviews.push({ id: docSnap.id, ...docSnap.data() } as Review);
            });

            setReviews(fetchedReviews);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const cleanName = username.trim();
        const cleanFeedback = feedback.trim();

        if (!cleanName || !cleanFeedback) {
            setSubmitMessage({ type: 'error', text: 'Please enter your name and review.' });
            return;
        }

        // Anti-spam cooldown check (5-minute rate limit per device)
        const COOLDOWN_MS = 5 * 60 * 1000;
        const lastSubTime = localStorage.getItem('aullevo_review_cooldown');
        if (lastSubTime) {
            const timePassed = Date.now() - parseInt(lastSubTime, 10);
            if (timePassed < COOLDOWN_MS) {
                const waitSeconds = Math.ceil((COOLDOWN_MS - timePassed) / 1000);
                setSubmitMessage({
                    type: 'error',
                    text: `Please wait ${waitSeconds}s before submitting another review.`
                });
                return;
            }
        }

        setSubmitting(true);
        setSubmitMessage({ type: '', text: '' });

        let currentUser = auth.currentUser;
        let didSignInAnonymously = false;

        if (!currentUser) {
            try {
                const cred = await signInAnonymously(auth);
                currentUser = cred.user;
                didSignInAnonymously = true;
            } catch (err) {
                console.error("Anonymous authentication failed:", err);
                setSubmitMessage({ type: 'error', text: 'Submission failed. Please check your connection.' });
                setSubmitting(false);
                return;
            }
        }

        try {
            const reviewId = currentUser.uid || `review_${Date.now()}`;
            await setDoc(doc(db, 'reviews', reviewId), {
                username: cleanName.substring(0, 50),
                rating,
                feedback: cleanFeedback.substring(0, 1000),
                createdAt: serverTimestamp()
            });

            // Set rate limit timestamp in localStorage
            localStorage.setItem('aullevo_review_cooldown', Date.now().toString());

            setSubmitMessage({ type: 'success', text: 'Thank you! Your review has been added.' });

            const newReview: Review = {
                id: reviewId,
                username: cleanName,
                rating,
                feedback: cleanFeedback,
                createdAt: new Date()
            };

            setReviews(prev => {
                const filtered = prev.filter(r => r.id !== reviewId);
                return [newReview, ...filtered];
            });

            setFeedback('');
            setCurrentPage(1);
            setTimeout(() => {
                setShowForm(false);
                setSubmitMessage({ type: '', text: '' });
            }, 3000);
        } catch (error) {
            console.error("Error submitting review:", error);
            setSubmitMessage({ type: 'error', text: 'Failed to submit review. Please try again.' });
        } finally {
            if (didSignInAnonymously || (currentUser && currentUser.isAnonymous)) {
                try {
                    await signOut(auth);
                } catch (signOutErr) {
                    console.error("Anonymous sign out error:", signOutErr);
                }
            }
            setSubmitting(false);
        }
    };

    const renderStars = (ratingValue: number) => {
        return (
            <div className="review-stars-display" aria-label={`${ratingValue} out of 5 stars`}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                        key={star}
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        className={`star-svg ${star <= ratingValue ? 'star-filled' : 'star-empty'}`}
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                ))}
            </div>
        );
    };

    // Calculate real score and pagination
    const reviewCount = reviews.length;
    const avgScore = reviewCount > 0
        ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / reviewCount).toFixed(1)
        : '5.0';

    const totalPages = Math.max(1, Math.ceil(reviewCount / REVIEWS_PER_PAGE));
    const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE;
    const paginatedReviews = reviews.slice(startIndex, startIndex + REVIEWS_PER_PAGE);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            const element = document.getElementById('reviews-wall');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    };

    const activeRating = hoverRating || rating;

    return (
        <section className="section reviews-section" id="reviews">
            <div className="container">
                {/* ── Clean Section Header ── */}
                <div className="reviews-header-block">
                    <div className="section-title" style={{ marginBottom: '0.4rem' }}>User Reviews</div>
                    <p className="section-description" style={{ marginBottom: '1.25rem' }}>
                        Honest feedback from people using Aullevo on everyday forms.
                    </p>

                    {/* Calculated Rating & Review Count Bar */}
                    <div className="community-score-summary">
                        <span className="summary-avg">{avgScore}</span>
                        {renderStars(Math.round(Number(avgScore)))}
                        <span className="summary-count">({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</span>
                    </div>

                    <div style={{ marginTop: '1.25rem' }}>
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm write-review-toggle-btn"
                            onClick={() => setShowForm(!showForm)}
                        >
                            {showForm ? 'Close Review Form' : '✍️ Write a Review'}
                        </button>
                    </div>
                </div>

                {/* ── Clean Write a Review Form ── */}
                {showForm && (
                    <div className="feedback-cta-wrapper animate-fade-in">
                        <div className="feedback-card-centered">
                            <div className="feedback-card-header">
                                <h3>Leave a Review</h3>
                                <p>Rate your experience with Aullevo</p>
                            </div>

                            <form onSubmit={handleSubmit} className="feedback-centered-form">
                                <div className="feedback-form-row">
                                    <div className="form-field-group">
                                        <label>Rating</label>
                                        <div className="star-picker-wrapper">
                                            <div className="star-rating-input">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <StarIcon
                                                        key={star}
                                                        filled={star <= activeRating}
                                                        onClick={() => setRating(star)}
                                                        onMouseEnter={() => setHoverRating(star)}
                                                        onMouseLeave={() => setHoverRating(0)}
                                                    />
                                                ))}
                                            </div>
                                            <span className="rating-preview-tag">{RATING_LABELS[activeRating]}</span>
                                        </div>
                                    </div>

                                    <div className="form-field-group">
                                        <label htmlFor="username">Name</label>
                                        <input
                                            type="text"
                                            id="username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="Your name or handle"
                                            maxLength={50}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-field-group">
                                    <div className="textarea-header-row">
                                        <label htmlFor="feedback">Feedback</label>
                                        <span className="char-count">{feedback.length}/1000</span>
                                    </div>
                                    <textarea
                                        id="feedback"
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="What did you like or think could be improved?"
                                        maxLength={1000}
                                        rows={3}
                                        required
                                    />
                                </div>

                                {submitMessage.text && (
                                    <div className={`submit-message ${submitMessage.type}`} role="alert">
                                        {submitMessage.text}
                                    </div>
                                )}

                                <div className="feedback-submit-row">
                                    <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                                        {submitting ? 'Submitting...' : 'Post Review'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ── Reviews Grid with Compact Cards ── */}
                <div className="reviews-wall-wrapper" id="reviews-wall">
                    {loading && reviews.length === 0 ? (
                        <div className="reviews-loading">
                            <div className="spinner"></div>
                            <p>Loading reviews...</p>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="reviews-empty">
                            <p>No reviews yet. Be the first to leave one!</p>
                        </div>
                    ) : (
                        <>
                            <div className="reviews-grid">
                                {paginatedReviews.map((review) => {
                                    const initial = review.username?.charAt(0).toUpperCase() || 'U';
                                    return (
                                        <div key={review.id} className="review-card">
                                            <div className="review-card-top">
                                                <div className="review-avatar">
                                                    {initial}
                                                </div>
                                                <div className="review-user-info">
                                                    <div className="review-name-row">
                                                        <span className="reviewer-name">{review.username}</span>
                                                        <span className="verified-badge">Verified User</span>
                                                    </div>
                                                    <div className="review-meta-row">
                                                        {renderStars(review.rating)}
                                                        <span className="review-rating-label">{review.rating}.0</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="review-body">
                                                <p className="review-text">
                                                    "{review.feedback}"
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* ── Numbered Pagination Controls ── */}
                            {totalPages > 1 && (
                                <div className="reviews-pagination-bar">
                                    <button
                                        type="button"
                                        className="pagination-nav-btn"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        aria-label="Previous page"
                                    >
                                        ← Prev
                                    </button>

                                    <div className="pagination-pages-group">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                            <button
                                                key={pageNum}
                                                type="button"
                                                className={`pagination-page-pill ${pageNum === currentPage ? 'active' : ''}`}
                                                onClick={() => handlePageChange(pageNum)}
                                                aria-label={`Page ${pageNum}`}
                                            >
                                                {pageNum}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        className="pagination-nav-btn"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        aria-label="Next page"
                                    >
                                        Next →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Reviews;
