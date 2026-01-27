/**
 * MobileOptimizedForm - Centralized form component with mobile optimization
 * 
 * Features:
 * - Keyboard-aware scrolling
 * - Proper spacing for mobile keyboards
 * - Touch-friendly input sizing
 * - Responsive label sizing
 * - Safe area support
 * 
 * Usage:
 * <MobileOptimizedForm onSubmit={handleSubmit}>
 *   <FormField name="email" label="Email" type="email" />
 *   <FormField name="message" label="Message" as="textarea" />
 * </MobileOptimizedForm>
 */

import React from 'react';
import { cn } from '@/lib/utils';
import {
  useKeyboardAware,
  useScrollLock,
  useSafeAreaInsets,
} from '@/hooks/useMobileOptimized';
import {
  getMobileClasses,
  RESPONSIVE_CLASSES,
  combineMobileClasses,
} from '@/utils/mobile';

interface MobileOptimizedFormProps
  extends React.FormHTMLAttributes<HTMLFormElement> {
  /**
   * Prevent scroll when keyboard appears
   */
  lockScroll?: boolean;
  
  /**
   * Add safe area padding
   */
  useSafeArea?: boolean;
}

export const MobileOptimizedForm = React.forwardRef<
  HTMLFormElement,
  MobileOptimizedFormProps
>(
  (
    { lockScroll = true, useSafeArea = true, className, children, ...props },
    ref
  ) => {
    const { shouldAdjust, bottomOffset } = useKeyboardAware();
    useScrollLock(lockScroll && shouldAdjust);
    const safeArea = useSafeAreaInsets();

    const formClass = cn(
      // Responsive spacing
      'space-y-4 md:space-y-5 lg:space-y-6',
      
      // Padding with keyboard awareness
      'p-4 md:p-6 lg:p-8',
      
      // Safe area support
      useSafeArea && `pb-[calc(1rem+${safeArea.bottom}px)]`,
      
      className
    );

    return (
      <form
        ref={ref}
        className={formClass}
        style={{
          paddingBottom: shouldAdjust
            ? `calc(1rem + ${bottomOffset}px)`
            : undefined,
        }}
        {...props}
      >
        {children}
      </form>
    );
  }
);

MobileOptimizedForm.displayName = 'MobileOptimizedForm';

// ============================================================================
// FormField Component
// ============================================================================

interface FormFieldProps {
  /**
   * Input name and id
   */
  name: string;
  
  /**
   * Label text
   */
  label?: string;
  
  /**
   * Input type or element type
   */
  type?: string;
  as?: 'input' | 'textarea' | 'select';
  
  /**
   * Error message
   */
  error?: string;
  
  /**
   * Helper text
   */
  helperText?: string;
  
  /**
   * Required asterisk
   */
  required?: boolean;
  
  /**
   * Options for select field
   */
  options?: Array<{ label: string; value: string }>;
  
  /**
   * Standard input/textarea props
   */
  placeholder?: string;
  disabled?: boolean;
  value?: string | number;
  onChange?: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >;
  
  /**
   * Children (for custom content)
   */
  children?: React.ReactNode;
}

export const FormField = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  FormFieldProps
>(
  (
    {
      name,
      label,
      type = 'text',
      as = 'input',
      error,
      helperText,
      required = false,
      options = [],
      placeholder,
      disabled,
      value,
      onChange,
      children,
      ...props
    },
    ref
  ) => {
    const fieldId = `field-${name}`;
    const inputClass = cn(
      // Responsive sizing
      RESPONSIVE_CLASSES.input.field,
      
      // Base styling
      'w-full rounded-md border',
      error
        ? 'border-destructive focus:ring-destructive'
        : 'border-input focus:ring-primary',
      'bg-background text-foreground',
      'transition-colors duration-200',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      
      // Error state
      error && 'bg-destructive/10'
    );

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={fieldId}
            className={cn(
              RESPONSIVE_CLASSES.input.label,
              'text-foreground'
            )}
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}

        {as === 'textarea' && (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            id={fieldId}
            name={name}
            placeholder={placeholder}
            disabled={disabled}
            value={value}
            onChange={onChange}
            className={inputClass}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        )}

        {as === 'select' && (
          <select
            ref={ref as React.Ref<HTMLSelectElement>}
            id={fieldId}
            name={name}
            disabled={disabled}
            value={value}
            onChange={onChange}
            className={inputClass}
            {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
          >
            {children || (
              <>
                <option value="">Select an option...</option>
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </>
            )}
          </select>
        )}

        {as === 'input' && (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            id={fieldId}
            type={type}
            name={name}
            placeholder={placeholder}
            disabled={disabled}
            value={value}
            onChange={onChange}
            className={inputClass}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}

        {error && (
          <p className="text-sm text-destructive font-medium">{error}</p>
        )}

        {helperText && !error && (
          <p className="text-xs text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

// ============================================================================
// FormGroup Component - For radio/checkbox groups
// ============================================================================

interface FormGroupProps {
  /**
   * Group label
   */
  label: string;
  
  /**
   * Options for the group
   */
  options: Array<{ label: string; value: string }>;
  
  /**
   * Group type
   */
  type: 'radio' | 'checkbox';
  
  /**
   * Name for the group
   */
  name: string;
  
  /**
   * Selected values
   */
  value?: string | string[];
  
  /**
   * Change handler
   */
  onChange?: (value: string | string[]) => void;
  
  /**
   * Stack direction
   */
  direction?: 'vertical' | 'horizontal';
}

export const FormGroup: React.FC<FormGroupProps> = ({
  label,
  options,
  type,
  name,
  value,
  onChange,
  direction = 'vertical',
}) => {
  const handleChange = (optionValue: string) => {
    if (type === 'radio') {
      onChange?.(optionValue);
    } else {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter((v) => v !== optionValue)
        : [...currentValues, optionValue];
      onChange?.(newValues);
    }
  };

  return (
    <fieldset className="space-y-3">
      <legend className={cn(RESPONSIVE_CLASSES.input.label, 'text-foreground')}>
        {label}
      </legend>

      <div
        className={cn(
          'space-y-2 md:space-y-1',
          direction === 'horizontal' && 'md:flex md:flex-wrap md:gap-4'
        )}
      >
        {options.map((option) => {
          const isChecked =
            type === 'radio'
              ? value === option.value
              : Array.isArray(value)
                ? value.includes(option.value)
                : false;

          return (
            <label
              key={option.value}
              className={cn(
                'flex items-center gap-3 cursor-pointer py-2 px-1',
                'touch-target md:py-0'
              )}
            >
              <input
                type={type}
                name={name}
                value={option.value}
                checked={isChecked}
                onChange={() => handleChange(option.value)}
                className="h-4 w-4 cursor-pointer accent-primary"
              />
              <span className="text-sm md:text-xs text-foreground">
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
};

FormGroup.displayName = 'FormGroup';
