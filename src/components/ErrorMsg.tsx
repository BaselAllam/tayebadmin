import { AlertCircle } from "lucide-react";

const ErrorMessage = ({ message = "Something went wrong." }) => {

  return (
    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-md px-3 py-2 text-sm shadow-sm">
      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
      <span className="text-red-800 font-medium">{message}</span>
    </div>
  );
};

export default ErrorMessage;