const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="flex space-x-2">
        <div 
          className="w-4 h-4 bg-[var(--barva-primarni)] rounded-full animate-pulse" 
          style={{ animationDelay: '0s' }}
        ></div>
        <div 
          className="w-4 h-4 bg-[var(--barva-primarni)] rounded-full animate-pulse" 
          style={{ animationDelay: '0.2s' }}
        ></div>
        <div 
          className="w-4 h-4 bg-[var(--barva-primarni)] rounded-full animate-pulse" 
          style={{ animationDelay: '0.4s' }}
        ></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;