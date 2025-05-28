export const Input = ({ 
    label, 
    type = 'text', 
    value, 
    onChange, 
    placeholder, 
    required = false,
    error = '',
    className = '',
    disabled = false
}) => {
    return (
        <div className={`space-y-1 ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                className={`
                    input-field
                    ${error ? 'border-red-500 focus:ring-red-500' : ''}
                `}
            />
            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};