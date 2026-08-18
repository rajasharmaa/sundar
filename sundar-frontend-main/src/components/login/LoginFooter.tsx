import React from 'react';
import { Link } from 'react-router-dom';

export const LoginFooter: React.FC = () => {
  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
        <Link to="/terms-conditions" className="hover:text-green-600 transition-colors text-center">
          Terms of Service
        </Link>
        <Link to="/privacy-policy" className="hover:text-green-600 transition-colors text-center">
          Privacy Policy
        </Link>
      </div>
      <p className="text-xs text-gray-400 text-center mt-4">
        © {new Date().getFullYear()} Sundar Corporation. All rights reserved.
      </p>
    </div>
  );
};

export default LoginFooter;
