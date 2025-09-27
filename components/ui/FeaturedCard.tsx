import React from 'react';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  gradient?: string;
  index?: number;
  onClick?: () => void;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  gradient = 'from-orange-400 to-red-500',
  index = 0,
  onClick,
  className = ''
}) => {
  return (
    <div 
      className={`group relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-orange-200/40 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 cursor-pointer ${className}`}
      onClick={onClick}
      style={{
        animationDelay: `${index * 150}ms`,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2)'
      }}
    >
      {/* Gradient Border Effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-200/50 to-red-200/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>
      
      {/* Icon */}
      <div className="mb-6 relative">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 border border-orange-100">
          <span className="text-4xl">{icon}</span>
        </div>
        {/* Floating decoration */}
        <div className={`absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br ${gradient} rounded-full opacity-80 group-hover:scale-125 transition-transform duration-300`}></div>
      </div>
      
      {/* Content */}
      <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-orange-700 transition-colors duration-300" style={{fontFamily: 'Playfair Display, serif'}}>
        {title}
      </h3>
      <p className="text-gray-700 leading-relaxed">
        {description}
      </p>
      
      {/* Hover Effect Line */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} rounded-b-3xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
    </div>
  );
};