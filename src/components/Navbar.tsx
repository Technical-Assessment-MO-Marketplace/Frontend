import { useState, useRef, useEffect } from "react";
import { CircleUserRound, Plus, Menu, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ProfileDropdown from "./ProfileDropdown.tsx";
import CreateAdminModal from "./CreateAdminModal.tsx";

const Navbar = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigation = (path: string) => {
    navigate(path);
    setShowMobileMenu(false);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <button
              onClick={() => navigate("/home")}
              className="text-lg md:text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
            >
              MO Marketplace
            </button>
          </div>

          {/* Desktop Navigation Items */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {isAuthenticated && isAdmin && (
              <>
                <Button
                  onClick={() => setShowCreateAdminModal(true)}
                  size="sm"
                  className="flex items-center gap-1 text-xs"
                >
                  <Plus className="w-3 h-3" />
                  Create Admin
                </Button>

                <Button
                  onClick={() => navigate("/attributes")}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  Attributes
                </Button>

                <Button
                  onClick={() => navigate("/orders")}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  Orders
                </Button>
              </>
            )}

            {/* Products Button - Always Visible */}
            <Button
              onClick={() => navigate("/products")}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              Products
            </Button>

            {!isAuthenticated ? (
              <Button onClick={() => navigate("/login")}>Login</Button>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-300 hover:bg-gray-400 transition-colors"
                  title="Profile Menu"
                >
                  <CircleUserRound className="w-6 h-6 text-gray-700" />
                </button>

                {showDropdown && (
                  <ProfileDropdown onClose={() => setShowDropdown(false)} />
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button & Profile */}
          <div className="flex items-center space-x-2 md:hidden">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-300 hover:bg-gray-400 transition-colors"
                  title="Profile Menu"
                >
                  <CircleUserRound className="w-6 h-6 text-gray-700" />
                </button>

                {showDropdown && (
                  <ProfileDropdown onClose={() => setShowDropdown(false)} />
                )}
              </div>
            ) : (
              <Button onClick={() => navigate("/login")} size="sm">
                Login
              </Button>
            )}

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {showMobileMenu ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {showMobileMenu && (
          <div className="md:hidden pb-4 space-y-2">
            <Button
              onClick={() => handleNavigation("/products")}
              variant="ghost"
              className="w-full justify-start text-sm"
            >
              Products
            </Button>

            {isAuthenticated && isAdmin && (
              <>
                <Button
                  onClick={() => {
                    setShowCreateAdminModal(true);
                    setShowMobileMenu(false);
                  }}
                  variant="ghost"
                  className="w-full justify-start text-sm flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Admin
                </Button>

                <Button
                  onClick={() => handleNavigation("/attributes")}
                  variant="ghost"
                  className="w-full justify-start text-sm"
                >
                  Attributes
                </Button>

                <Button
                  onClick={() => handleNavigation("/orders")}
                  variant="ghost"
                  className="w-full justify-start text-sm"
                >
                  Orders
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      <CreateAdminModal
        isOpen={showCreateAdminModal}
        onClose={() => setShowCreateAdminModal(false)}
        onSuccess={() => {
          toast.success("Admin user created successfully!");
        }}
      />
    </nav>
  );
};

export default Navbar;
