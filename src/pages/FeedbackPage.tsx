import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star, Send, Sparkles, Heart, Check, ArrowLeft, MessageSquare, Zap, Target } from 'lucide-react';
import { feedbackAPI, api } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const CATEGORIES = [
    { id: 'general', label: 'General', icon: MessageSquare, color: 'text-blue-500' },
    { id: 'feature', label: 'Feature Request', icon: Zap, color: 'text-purple-500' },
    { id: 'bug', label: 'Bug Report', icon: Target, color: 'text-red-500' },
    { id: 'love', label: 'Appreciation', icon: Heart, color: 'text-pink-500' },
];

const FeedbackPage = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('t');

    const [tokenUser, setTokenUser] = useState<{ id: string; name: string; email: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [category, setCategory] = useState('general');
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Validate token on mount
    useEffect(() => {
        const validateToken = async () => {
            if (token) {
                try {
                    const response = await api.get(`/feedback/validate-token?t=${encodeURIComponent(token)}`);
                    if (response.data.valid && response.data.user) {
                        setTokenUser(response.data.user);
                    }
                } catch (error) {
                    console.error('Token validation failed:', error);
                }
            }
            setLoading(false);
        };
        validateToken();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        setIsSubmitting(true);
        try {
            await feedbackAPI.submit({
                rating,
                category,
                comment: comment || undefined,
                ...(token ? { token } : {})
            } as any);

            setIsSubmitted(true);
            toast.success('Thank you for your feedback!');
        } catch (error) {
            toast.error('Failed to submit feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const displayName = user?.name || tokenUser?.name || 'Cosmic Traveler';

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-cosmic-darker via-background to-cosmic-dark flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-cosmic-darker via-background to-cosmic-dark flex items-center justify-center p-4">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" />
                </div>

                <Card className="w-full max-w-md border-primary/30 bg-card/90 backdrop-blur-xl text-center">
                    <CardContent className="pt-12 pb-8">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                            <Check className="w-10 h-10 text-green-500" />
                        </div>
                        <h1 className="text-2xl font-bold mb-3">Thank You! ✨</h1>
                        <p className="text-muted-foreground mb-8">
                            Your feedback helps us align the stars better. We truly appreciate you taking the time to share your thoughts.
                        </p>
                        <div className="space-y-3">
                            <Button asChild className="w-full cosmic-glow">
                                <Link to="/dashboard">
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Return to Dashboard
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full">
                                <Link to="/">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Go to Homepage
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-cosmic-darker via-background to-cosmic-dark py-12 px-4">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
            </div>

            <div className="max-w-2xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block mb-6">
                        <img src="/logo.png" alt="AstroLord" className="h-12 mx-auto" />
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold mb-3">
                        Share Your <span className="text-primary">Cosmic Experience</span>
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        {displayName !== 'Cosmic Traveler' ? (
                            <>Hey <span className="text-primary font-medium">{displayName}</span>! </>
                        ) : null}
                        Your feedback helps us create a better astrological journey for everyone.
                    </p>
                </div>

                {/* Feedback Form Card */}
                <Card className="border-border/50 bg-card/80 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Heart className="w-5 h-5 text-primary" />
                            How was your experience?
                        </CardTitle>
                        <CardDescription>
                            Rate your overall experience with AstroLord
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Star Rating */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="focus:outline-none transition-all duration-200 hover:scale-125 active:scale-95"
                                        >
                                            <Star
                                                className={`h-10 w-10 md:h-12 md:w-12 transition-colors ${star <= (hoverRating || rating)
                                                        ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]'
                                                        : 'text-muted-foreground/30 hover:text-muted-foreground/50'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {rating === 0 && 'Click to rate'}
                                    {rating === 1 && '😔 We can do better'}
                                    {rating === 2 && '😐 Room for improvement'}
                                    {rating === 3 && '🙂 Decent experience'}
                                    {rating === 4 && '😊 Great experience!'}
                                    {rating === 5 && '🌟 Absolutely stellar!'}
                                </p>
                            </div>

                            {/* Category Selection */}
                            <div className="space-y-3">
                                <Label>What's this about?</Label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {CATEGORIES.map((cat) => {
                                        const Icon = cat.icon;
                                        return (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => setCategory(cat.id)}
                                                className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${category === cat.id
                                                        ? 'border-primary bg-primary/10 scale-[1.02]'
                                                        : 'border-border/50 hover:border-primary/30 hover:bg-primary/5'
                                                    }`}
                                            >
                                                <Icon className={`w-6 h-6 ${cat.color}`} />
                                                <span className="text-sm font-medium">{cat.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Comment */}
                            <div className="space-y-3">
                                <Label htmlFor="comment">Tell us more (optional)</Label>
                                <Textarea
                                    id="comment"
                                    placeholder="What did you like? What can we improve? Share your cosmic insights..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="min-h-[150px] resize-none bg-background/50"
                                />
                            </div>

                            {/* User identification info */}
                            {(user || tokenUser) && (
                                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                                    <p className="text-sm text-muted-foreground">
                                        <span className="text-primary font-medium">✓</span> Submitting as{' '}
                                        <span className="font-medium text-foreground">
                                            {user?.email || tokenUser?.email}
                                        </span>
                                    </p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isSubmitting || rating === 0}
                                className="w-full h-14 text-lg cosmic-glow"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Sending to the cosmos...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Send className="w-5 h-5" />
                                        Submit Feedback
                                    </span>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Footer */}
                <p className="text-center text-muted-foreground text-sm mt-8">
                    Your feedback is encrypted and private. We never share your information.
                </p>
            </div>
        </div>
    );
};

export default FeedbackPage;
