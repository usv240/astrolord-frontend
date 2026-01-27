import React, { useState } from 'react';
import { promoAPI } from '@/lib/api';
import { Ticket, Gift, MessageCircle, Loader2, Check, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { trackPromoCodeRedeemed } from '@/lib/analytics';

interface PromoCodeInputProps {
    onRedeemSuccess?: () => void;
    variant?: 'inline' | 'card';
    className?: string;
}

interface ValidationResult {
    valid: boolean;
    code?: string;
    reward_type?: string;
    description?: string;
    message?: string;
}

export function PromoCodeInput({ onRedeemSuccess, variant = 'card', className = '' }: PromoCodeInputProps) {
    const { user } = useAuth();
    const [code, setCode] = useState('');
    const [validating, setValidating] = useState(false);
    const [redeeming, setRedeeming] = useState(false);
    const [validation, setValidation] = useState<ValidationResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleValidate = async (inputCode: string) => {
        const trimmedCode = inputCode.trim().toUpperCase();
        if (!trimmedCode || trimmedCode.length < 3) {
            setValidation(null);
            setError(null);
            return;
        }

        try {
            setValidating(true);
            setError(null);
            const res = await promoAPI.validate(trimmedCode);
            setValidation(res.data);
        } catch (err: any) {
            setValidation(null);
            const detail = err.response?.data?.detail;
            const errMsg = typeof detail === 'string' ? detail : detail?.error || err.message || 'Invalid code';
            setError(errMsg);
        } finally {
            setValidating(false);
        }
    };

    const handleRedeem = async () => {
        if (!validation?.valid) return;

        try {
            setRedeeming(true);
            setError(null);
            const res = await promoAPI.redeem(code.trim().toUpperCase());

            toast.success('🎉 Promo code redeemed!', {
                description: res.data?.message || 'Your reward has been applied.',
            });

            setCode('');
            setValidation(null);

            // Trigger subscription update event to refresh any quota widgets
            window.dispatchEvent(new Event('subscription-updated'));

            // Track promo code redemption
            trackPromoCodeRedeemed(validation?.reward_type || 'unknown');

            if (onRedeemSuccess) {
                onRedeemSuccess();
            }
        } catch (err: any) {
            const detail = err.response?.data?.detail;
            const errMsg = typeof detail === 'string' ? detail : detail?.error || err.message || 'Failed to redeem';
            setError(errMsg);
            toast.error('Redemption failed', { description: errMsg });
        } finally {
            setRedeeming(false);
        }
    };

    const isInline = variant === 'inline';

    if (!user) {
        return (
            <div className={`text-sm text-muted-foreground ${className}`}>
                <a href="/login" className="text-primary hover:underline">Log in</a> to redeem promo codes
            </div>
        );
    }

    return (
        <div className={`${isInline ? '' : 'bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4'} ${className}`}>
            {!isInline && (
                <div className="flex items-center gap-2 mb-3">
                    <Ticket className="w-5 h-5 text-primary" />
                    <span className="font-medium">Have a promo code?</span>
                </div>
            )}

            <div className={`flex gap-2 ${isInline ? '' : 'mb-2'}`}>
                <Input
                    type="text"
                    value={code}
                    onChange={(e) => {
                        const newCode = e.target.value.toUpperCase();
                        setCode(newCode);
                        // Debounce validation
                        if (newCode.length >= 3) {
                            setTimeout(() => handleValidate(newCode), 300);
                        } else {
                            setValidation(null);
                            setError(null);
                        }
                    }}
                    placeholder="Enter code"
                    className="flex-1 uppercase font-mono"
                    maxLength={20}
                    disabled={redeeming}
                />
                <Button
                    onClick={handleRedeem}
                    disabled={!validation?.valid || redeeming || validating}
                    className="bg-gradient-to-r from-primary to-secondary"
                >
                    {validating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : redeeming ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                            Redeeming...
                        </>
                    ) : (
                        'Redeem'
                    )}
                </Button>
            </div>

            {/* Validation feedback */}
            {validation?.valid && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950/30 p-2 rounded mt-2">
                    {validation.reward_type === 'subscription' ? (
                        <Gift className="w-4 h-4" />
                    ) : (
                        <MessageCircle className="w-4 h-4" />
                    )}
                    <span>
                        <strong>{validation.code}</strong>: {validation.description || 'Valid code!'}
                    </span>
                    <Check className="w-4 h-4 ml-auto" />
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 p-2 rounded mt-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}

export default PromoCodeInput;
