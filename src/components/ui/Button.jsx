import LoadingSpinner from "../ui/LoadingSpinner"

export const Button = ({ 
    children, 
    onClick, 
    type = 'button', 
    variant = 'primary', 
    size = 'medium',
    disabled = false,
    loading = false,
    className = ''
}) => {
    const baseStyles = 'font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const variants = {
        primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 focus:ring-primary-500',
        secondary: 'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white hover:from-secondary-600 hover:to-secondary-700 focus:ring-secondary-500',
        outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
        ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500'
    };
    
    const sizes = {
        small: 'px-3 py-2 text-sm',
        medium: 'px-4 py-2',
        large: 'px-6 py-3 text-lg'
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`
                ${baseStyles}
                ${variants[variant]}
                ${sizes[size]}
                ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
                ${className}
            `}
        >
            {loading && <LoadingSpinner size="small" />}
            {children}
        </button>
    );
};