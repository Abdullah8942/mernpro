import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineExclamationCircle, HiOutlineHome, HiOutlineRefresh } from 'react-icons/hi';

const ErrorMessage = ({ 
  title = 'Something went wrong', 
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  showHomeLink = true
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <HiOutlineExclamationCircle className="w-10 h-10 text-red-500" />
      </div>
      <h2 className="text-2xl font-display font-semibold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-600 text-center max-w-md mb-6">{message}</p>
      <div className="flex items-center gap-4">
        {onRetry && (
          <button onClick={onRetry} className="btn-primary flex items-center gap-2">
            <HiOutlineRefresh className="w-5 h-5" />
            Try Again
          </button>
        )}
        {showHomeLink && (
          <Link to="/" className="btn-outline flex items-center gap-2">
            <HiOutlineHome className="w-5 h-5" />
            Go Home
          </Link>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
