"use client";

export default function AnimatedHero() {
  return (
    <div className="relative z-10 text-center py-12 sm:py-20 animate-fadeIn px-4">
      {/* Main title with scale-up animation */}
      <h1 className="text-5xl sm:text-7xl md:text-9xl font-bold mb-6 animate-scaleUp">
        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          42 Clubs
        </span>
      </h1>
      
      {/* Subtitle with slide-up animation */}
      <p className="text-xl sm:text-2xl md:text-3xl text-gray-700 mb-4 animate-slideUp animation-delay-200">
        Connect. Organize. Thrive.
      </p>
      
      {/* Description */}
      <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8 px-4 animate-slideUp animation-delay-400">
        The decentralized platform for 42 campus clubs and events, powered by blockchain technology
      </p>
      
      {/* Feature badges */}
      <div className="flex flex-wrap gap-4 justify-center mb-12 animate-slideUp animation-delay-600">
        <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-gray-200 hover-scale transition-all">
          <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Blockchain Verified
          </span>
        </div>
        <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-gray-200 hover-scale transition-all">
          <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Instant Access
          </span>
        </div>
        <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-gray-200 hover-scale transition-all">
          <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            Decentralized
          </span>
        </div>
      </div>
    </div>
  );
}

