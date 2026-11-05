import { Loader } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className={`flex items-center justify-center`}>
      <Loader className="animate-spin text-agency-green"/>
    </div>
  );
};

export default LoadingSpinner;