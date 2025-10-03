// components/ui/PrizeCard.tsx
import React from 'react';

interface PrizeCardProps {
  amount: string;
  title: string;
  description: string;
  features?: string[];
  highlighted?: boolean;
  className?: string;
}

const PrizeCard: React.FC<PrizeCardProps> = ({
  amount,
  title,
  description,
  features = [],
  highlighted = false,
  className = ''
}) => {
  return (
    <div className={`relative ${className}`}>
      {highlighted && (
        <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-3xl blur-lg opacity-60 animate-pulse"></div>
      )}
      
      <div className={`relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border transition-all duration-500 hover:shadow-3xl hover:-translate-y-2 ${
        highlighted 
          ? 'border-yellow-300/60 ring-4 ring-yellow-200/50' 
          : 'border-orange-200/40'
      }`}>
        
        {highlighted && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
              🏆 Grand Prize
            </span>
          </div>
        )}
        
        {/* Amount */}
        <div className="text-center mb-6">
          <div className={`text-5xl md:text-6xl font-bold mb-2 ${
            highlighted ? 'text-transparent bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text' : 'text-orange-700'
          }`} style={{fontFamily: 'Playfair Display, serif'}}>
            {amount}
          </div>
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        </div>
        
        {/* Description */}
        <p className="text-gray-700 text-center mb-6 leading-relaxed">
          {description}
        </p>
        
        {/* Features */}
        {features.length > 0 && (
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex-shrink-0"></div>
                <span className="text-gray-600 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};