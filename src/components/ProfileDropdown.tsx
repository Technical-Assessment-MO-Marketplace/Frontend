import { User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ProfileDropdownProps {
  onClose: () => void;
}

const ProfileDropdown = ({ onClose }: ProfileDropdownProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/login");
  };

  const handleProfile = () => {
    navigate("/profile");
    onClose();
  };

  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      {/* User Info */}
      <div className="px-4 py-3 border-b border-gray-200">
        <p className="text-sm font-semibold text-gray-900">
          {user?.name || user?.email || "User"}
        </p>
        <p className="text-xs text-gray-600">{user?.email}</p>
      </div>

      {/* Dropdown Actions */}
      <div className="px-2 py-2 space-y-1">
        <button
          onClick={handleProfile}
          className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors flex items-center gap-2"
        >
          <User className="w-4 h-4" />
          Go to Profile
        </button>
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded transition-colors flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;
