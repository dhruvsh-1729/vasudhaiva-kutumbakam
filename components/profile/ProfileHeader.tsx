// components/profile/ProfileHeader.tsx
import * as React from 'react';
import type { User } from '@/pages/competition/profile';

interface Props {
  user: User | null;
}

const ProfileHeader: React.FC<Props> = ({ user }) => {
  if (!user) return null;

  const joinDate = new Date(user.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <section className="relative">
      {/* Main profile card */}
      <div className="rounded-3xl backdrop-blur-lg bg-white/90 border border-orange-100 shadow-2xl overflow-hidden">
        {/* Gradient header background */}
        <div className="h-32 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/20 rounded-full blur-2xl" />
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl" />
        </div>

        <div className="relative px-8 pb-8">
          {/* Avatar positioned on the edge */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16">
            <div className="relative group">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-32 w-32 rounded-2xl border-4 border-white shadow-xl object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="h-32 w-32 rounded-2xl border-4 border-white shadow-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-4xl font-bold text-white group-hover:scale-105 transition-transform duration-300">
                  {user.name?.[0]?.toUpperCase() ?? 'U'}
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 border-3 border-white flex items-center justify-center shadow-lg">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-3xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600 mt-1 flex items-center justify-center sm:justify-start gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {user.email}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3 justify-center sm:justify-start">
                {user.isEmailVerified && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-1.5 text-xs font-semibold text-white shadow-lg">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Verified
                  </span>
                )}

                {user.isActive && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 px-4 py-1.5 text-xs font-semibold text-white shadow-lg">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    Active
                  </span>
                )}

                {user.isAdmin && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-1.5 text-xs font-semibold text-white shadow-lg">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 p-5 hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-20 w-20 rounded-full bg-gradient-to-br from-orange-200 to-red-200 opacity-20 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Institution</div>
                </div>
                <div className="text-sm font-semibold text-gray-900">{user.institution || 'Not specified'}</div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50 p-5 hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-20 w-20 rounded-full bg-gradient-to-br from-yellow-200 to-orange-200 opacity-20 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Phone</div>
                </div>
                <div className="text-sm font-semibold text-gray-900">{user.phone || 'Not provided'}</div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50 to-pink-50 p-5 hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-20 w-20 rounded-full bg-gradient-to-br from-red-200 to-pink-200 opacity-20 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Member Since</div>
                </div>
                <div className="text-sm font-semibold text-gray-900">{joinDate}</div>
              </div>
            </div>

            {/* <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 p-5 hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-20 w-20 rounded-full bg-gradient-to-br from-purple-200 to-indigo-200 opacity-20 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500">User ID</div>
                </div>
                <div className="text-xs font-mono text-gray-900 break-all">{user.id}</div>
              </div>
            </div> */}
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button className="flex-1 group relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4 text-white font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200">
              <span className="relative z-10 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </button>
            
            <button className="flex-1 group relative overflow-hidden rounded-2xl border-2 border-orange-200 bg-white px-6 py-4 text-gray-800 font-semibold hover:border-orange-300 hover:shadow-xl transform hover:scale-105 transition-all duration-200">
              <span className="relative z-10 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Change Password
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileHeader;