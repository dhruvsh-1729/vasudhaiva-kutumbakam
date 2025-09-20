import React from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  institution?: string;
  avatarUrl?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProfileHeaderProps {
  user: User | null;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  if (!user) return null;

  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-orange-200/30 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 p-8">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center border-4 border-white shadow-lg">
              <span className="text-3xl font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-white mb-2" style={{fontFamily: 'Playfair Display, serif'}}>
              {user.name}
            </h2>
            <p className="text-orange-100 text-lg">{user.email}</p>
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 mt-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                user.isEmailVerified 
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
              }`}>
                {user.isEmailVerified ? 'Email Verified' : 'Email Not Verified'}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                user.isActive 
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Institution</label>
              <p className="text-gray-900 bg-gray-50 rounded-lg px-4 py-3 border">
                {user.institution || 'Not specified'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
              <p className="text-gray-900 bg-gray-50 rounded-lg px-4 py-3 border">
                {user.phone || 'Not provided'}
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Member Since</label>
              <p className="text-gray-900 bg-gray-50 rounded-lg px-4 py-3 border">
                {joinDate}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">User ID</label>
              <p className="text-gray-900 bg-gray-50 rounded-lg px-4 py-3 border font-mono text-sm">
                {user.id}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-200 transform hover:scale-105">
            Edit Profile
          </button>
          <button className="flex-1 px-6 py-3 border border-orange-300 text-orange-700 font-semibold rounded-xl hover:bg-orange-50 transition-all duration-200">
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;