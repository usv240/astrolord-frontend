import { useMemo } from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
}

export const PasswordStrengthIndicator = ({
  password,
  showRequirements = true,
}: PasswordStrengthIndicatorProps) => {
  const analysis = useMemo(() => {
    const requirements: PasswordRequirement[] = [
      { label: 'At least 6 characters', met: password.length >= 6 },
      { label: 'Contains a number', met: /\d/.test(password) },
      { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
      { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    ];

    const metCount = requirements.filter((r) => r.met).length;
    
    let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
    let color = 'bg-red-500';
    let label = 'Weak';
    
    if (metCount >= 4) {
      strength = 'strong';
      color = 'bg-green-500';
      label = 'Strong';
    } else if (metCount >= 3) {
      strength = 'good';
      color = 'bg-blue-500';
      label = 'Good';
    } else if (metCount >= 2) {
      strength = 'fair';
      color = 'bg-yellow-500';
      label = 'Fair';
    }

    const percentage = (metCount / requirements.length) * 100;

    return { requirements, strength, color, label, percentage, metCount };
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Password strength</span>
          <span className={`text-xs font-medium ${
            analysis.strength === 'strong' ? 'text-green-500' :
            analysis.strength === 'good' ? 'text-blue-500' :
            analysis.strength === 'fair' ? 'text-yellow-500' :
            'text-red-500'
          }`}>
            {analysis.label}
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ease-out rounded-full ${analysis.color}`}
            style={{ width: `${analysis.percentage}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <div className="grid grid-cols-2 gap-1.5">
          {analysis.requirements.map((req, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${
                req.met ? 'text-green-500' : 'text-muted-foreground'
              }`}
            >
              {req.met ? (
                <Check className="h-3 w-3 shrink-0" />
              ) : (
                <X className="h-3 w-3 shrink-0 opacity-50" />
              )}
              <span className={req.met ? '' : 'opacity-70'}>{req.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
