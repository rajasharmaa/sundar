// components/account/ProfileCard.tsx
import { motion } from 'framer-motion';
import { UserCircle, Camera, Shield, User } from 'lucide-react';

interface ProfileCardProps {
  name: string;
  email: string;
  role: string;
  onEditProfile?: () => void;
  onUploadPhoto?: () => void;
}

const getRoleBadgeColor = (userRole: string) => {
  switch (userRole?.toLowerCase()) {
    case 'user': return 'bg-blue-100 text-blue-800 border-blue-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const ProfileCard = ({ name, email, role, onEditProfile, onUploadPhoto }: ProfileCardProps) => {

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* User Profile Card */}
      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-gray-100">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg border-4 border-white">
              <UserCircle className="w-12 h-12 text-white" />
            </div>
            <button 
              onClick={onUploadPhoto}
              className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full border-2 border-blue-200 flex items-center justify-center shadow-sm hover:bg-blue-50 transition-colors"
            >
              <Camera size={14} className="text-blue-600" />
            </button>
          </div>
          <h3 className="font-bold text-xl text-gray-900 mb-1">{name}</h3>
          <p className="text-sm text-gray-600 mb-3">{email}</p>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(role)}`}>
            <Shield size={12} className="mr-1" />
            {role?.charAt(0)?.toUpperCase() + role?.slice(1)}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <div className="p-4 border-t border-gray-100">
        <motion.button
          onClick={onEditProfile}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-all duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <User size={16} />
          Edit Profile
        </motion.button>
      </div>
    </div>
  );
};

export default ProfileCard;