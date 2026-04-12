import React from 'react';

/**
 * Input optimizado siguiendo principios GOMS-KLM
 * - Reduce operadores M (Mental) con labels claros
 * - Reduce operadores P (Point) con navegación por teclado
 * - Soporta auto-focus y referencias
 */
const OptimizedInput = ({
  label,
  name,
  value,
  onChange,
  onKeyDown,
  inputRef,
  type = 'text',
  placeholder,
  required = false,
  maxLength,
  helpText,
  icon: Icon,
  className = '',
  disabled = false,
}) => {
  return (
    <div className="space-y-1">
      <label 
        htmlFor={name}
        className="paragraph flex items-center gap-2 text-sm font-semibold"
      >
        {Icon && <Icon size={14} className="opacity-70" />}
        {label}
        {required && <span style={{ color: 'var(--color-accent-light)' }}>*</span>}
      </label>
      <input
        id={name}
        ref={inputRef}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        maxLength={maxLength}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`
          paragraph w-full px-3 py-2.5 border rounded-lg
          focus:ring-2 transition-all outline-none text-sm
          disabled:cursor-not-allowed
          ${className}
        `}
        style={{
          borderColor: 'var(--color-accent-light)',
          backgroundColor: disabled ? 'var(--color-primary-light)' : 'var(--color-bg-light)',
          color: 'var(--color-text-light)'
        }}
      />
      {helpText && (
        <p className="paragraph text-xs opacity-70">{helpText}</p>
      )}
    </div>
  );
};

export default OptimizedInput;