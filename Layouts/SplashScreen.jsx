export default function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center">
      <div className="text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="bg-primary rounded-full p-8 shadow-2xl animate-pulse">
            <img 
              src="/Icons/plogo.png" 
              alt="Plantify Logo" 
              className="w-20 h-20 object-contain"
            />
          </div>
        </div>
        
        {/* Brand Name */}
        <h1 className="text-5xl font-black text-gray-800 mb-2">
          Plant<span className="text-primary">ify</span>
        </h1>
        
        {/* Tagline */}
        <p className="text-xl text-gray-600 font-medium">
          Your Garden Marketplace
        </p>
        
        {/* Loading Indicator */}
        <div className="mt-8 flex justify-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}