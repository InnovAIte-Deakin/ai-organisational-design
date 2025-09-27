import styles from './BasicElements.module.css';
import { cx } from '../../utils/helpers';

/**
 * Button component with multiple variants
 */
export function Button({ 
  children, 
  onClick, 
  variant = "primary", 
  size = "md", 
  className = "",
  disabled = false,
  type = "button"
}) {
  const variantStyles = {
    primary: styles.buttonPrimary,
    secondary: styles.buttonSecondary,
    outline: styles.buttonOutline,
    danger: styles.buttonDanger,
    ghost: styles.buttonGhost,
  };
  
  const sizeStyles = {
    sm: styles.buttonSm,
    md: styles.buttonMd,
    lg: styles.buttonLg,
  };
  
  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cx(
        styles.button,
        variantStyles[variant] || styles.buttonPrimary,
        sizeStyles[size] || styles.buttonMd,
        disabled && styles.buttonDisabled,
        className
      )}
    >
      {children}
    </button>
  );
}

/**
 * Badge component for status indicators
 */
export function Badge({ 
  children, 
  variant = "default", 
  className = "" 
}) {
  const variantStyles = {
    default: styles.badgeDefault,
    success: styles.badgeSuccess,
    warning: styles.badgeWarning,
    danger: styles.badgeDanger,
    neutral: styles.badgeNeutral,
  };
  
  return (
    <span className={cx(
      styles.badge,
      variantStyles[variant] || styles.badgeDefault,
      className
    )}>
      {children}
    </span>
  );
}

/**
 * Card component with title and optional actions
 */
export function Card({ 
  title, 
  subtitle, 
  actions, 
  children, 
  className = "",
  padding = "normal"
}) {
  const paddingStyles = {
    none: styles.cardNoPadding,
    small: styles.cardSmallPadding,
    normal: styles.cardNormalPadding,
    large: styles.cardLargePadding,
  };
  
  return (
    <div className={cx(
      styles.card,
      paddingStyles[padding] || styles.cardNormalPadding,
      className
    )}>
      {(title || subtitle || actions) && (
        <div className={styles.cardHeader}>
          <div>
            {title && <h3 className={styles.cardTitle}>{title}</h3>}
            {subtitle && <p className={styles.cardSubtitle}>{subtitle}</p>}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}

/**
 * Input component for text input
 */
export function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
  disabled = false,
  onKeyDown,
  name,
  id
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      onKeyDown={onKeyDown}
      name={name}
      id={id}
      className={cx(
        styles.input,
        disabled && styles.inputDisabled,
        className
      )}
    />
  );
}