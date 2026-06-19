import React, { useState, useEffect } from 'react';
import { db, auth } from '../config/firebase';
import {
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    startAfter,
    setDoc,
    doc,
    serverTimestamp,
    QueryDocumentSnapshot,
    type DocumentData
} from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

interface Review {
    id: string;
    username: string;
    rating: number;
    feedback: string;
    createdAt: any;
}

const REVIEWS_PER_PAGE = 10;

const StarIcon = ({ filled, onClick, onMouseEnter, onMouseLeave }: any) => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`star-icon ${filled ? 'filled' : ''}`}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
    >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

const Reviews: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // Form state
    const [username, setUsername] = useState('');
    const [feedback, setFeedback] = useState('');
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        // Track currentUser state (but don't auto-sign in anonymously on visit)
        const unsubscribe = onAuthStateChanged(auth, () => {
            // Unused state removed
        });

        fetchReviews();
        return () => unsubscribe();
    }, []);

    const fetchReviews = async (isLoadMore = false) => {
        try {
            if (isLoadMore) setLoadingMore(true);
            else setLoading(true);

            let q = query(
                collection(db, 'reviews'),
                orderBy('createdAt', 'desc'),
                limit(REVIEWS_PER_PAGE)
            );

            if (isLoadMore && lastDoc) {
                q = query(q, startAfter(lastDoc));
            }

            const snapshot = await getDocs(q);

            const fetchedReviews: Review[] = [];
            snapshot.forEach((doc) => {
                fetchedReviews.push({ id: doc.id, ...doc.data() } as Review);
            });

            if (snapshot.docs.length < REVIEWS_PER_PAGE) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

            if (snapshot.docs.length > 0) {
                setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
            }

            if (isLoadMore) {
                setReviews(prev => [...prev, ...fetchedReviews]);
            } else {
                setReviews(fetchedReviews);
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let currentUser = auth.currentUser;
        if (!currentUser) {
            setSubmitting(true);
            try {
                const cred = await signInAnonymously(auth);
                currentUser = cred.user;
            } catch (err) {
                console.error("Anonymous authentication failed:", err);
                setSubmitMessage({ type: 'error', text: 'Authentication failed. Please try again.' });
                setSubmitting(false);
                return;
            }
        }

        if (!username.trim() || !feedback.trim()) {
            setSubmitMessage({ type: 'error', text: 'Please fill in all fields.' });
            return;
        }

        setSubmitting(true);
        setSubmitMessage({ type: '', text: '' });

        try {
            // Using setDoc with user.uid ensures 1 review per user, serving as our anti-spam rate limiter
            await setDoc(doc(db, 'reviews', currentUser.uid), {
                username: username.trim().substring(0, 50),
                rating,
                feedback: feedback.trim().substring(0, 1000),
                createdAt: serverTimestamp()
            });

            setSubmitMessage({ type: 'success', text: 'Review submitted successfully! Thank you.' });

            // Format for immediate optimistic UI update
            const newReview: Review = {
                id: currentUser.uid,
                username: username.trim(),
                rating,
                feedback: feedback.trim(),
                createdAt: new Date()
            };

            // Replace existing review if they updated, or add to top
            setReviews(prev => {
                const filtered = prev.filter(r => r.id !== currentUser.uid);
                return [newReview, ...filtered];
            });

            setFeedback(''); // Clear feedback, leave username and rating
        } catch (error) {
            console.error("Error submitting review:", error);
            setSubmitMessage({ type: 'error', text: 'Failed to submit review. Please try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (ratingValue: number) => {
        return (
            <div className="review-stars-display">
                {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} width="16" height="16" viewBox="0 0 24 24" fill={star <= ratingValue ? "#FBBF24" : "none"} stroke={star <= ratingValue ? "#FBBF24" : "#475569"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                ))}
            </div>
        );
    };

    return (
        <section className="section reviews-section" id="reviews">
            <div className="container">
                <div className="section-title">Community Reviews</div>
                <p className="section-description">
                    See what our users are saying about Aullevo. Leave a review to let us know your thoughts!
                </p>

                <div className="reviews-layout">
                    {/* Submission Form */}
                    <div className="review-form-container glass-card">
                        <h3>Leave a Feedback</h3>
                        <p className="review-form-subtitle">Rate limit: 1 review per user. Updating overrides your prev review.</p>

                        <form onSubmit={handleSubmit} className="review-form">
                            <div className="form-group">
                                <label>Your Rating</label>
                                <div className="star-rating-input">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <StarIcon
                                            key={star}
                                            filled={star <= (hoverRating || rating)}
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="username">Name / Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter your name"
                                    maxLength={50}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="feedback">Your Review</label>
                                <textarea
                                    id="feedback"
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="How has Aullevo helped you?"
                                    maxLength={1000}
                                    rows={4}
                                    required
                                />
                            </div>

                            {submitMessage.text && (
                                <div className={`submit-message ${submitMessage.type}`}>
                                    {submitMessage.text}
                                </div>
                            )}

                            <button type="submit" className="btn btn-primary btn-submit-review" disabled={submitting}>
                                {submitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    </div>

                    {/* Reviews List */}
                    <div className="reviews-list-container">
                        {loading && reviews.length === 0 ? (
                            <div className="reviews-loading">Loading reviews...</div>
                        ) : reviews.length === 0 ? (
                            <div className="reviews-empty glass-card">
                                No reviews yet. Be the first to share your thoughts!
                            </div>
                        ) : (
                            <div className="reviews-grid">
                                {reviews.map((review) => (
                                    <div key={review.id} className="review-card">
                                        <div className="review-content-wrapper">
                                            <div className="review-card-header">
                                                <div className="review-avatar">
                                                    {review.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="review-meta">
                                                    <h4>{review.username}</h4>
                                                    {renderStars(review.rating)}
                                                </div>
                                            </div>
                                            <p className="review-body">
                                                {review.feedback}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {hasMore && reviews.length > 0 && (
                            <div className="reviews-pagination">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => fetchReviews(true)}
                                    disabled={loadingMore}
                                >
                                    {loadingMore ? 'Loading...' : 'Load More Reviews'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Reviews;
