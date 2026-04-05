import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You need to be logged in to view this page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/login")}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-3 sm:p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
            Welcome to MO Marketplace
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Hello,{" "}
            <span className="font-semibold">{user?.name || user?.email}</span>!
            👋
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Dashboard Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">Dashboard</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                View your activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-gray-600 mb-4">
                Manage your account and view your marketplace activity.
              </p>
              <Button
                onClick={() => navigate("/home")}
                variant="outline"
                className="w-full text-xs sm:text-sm"
              >
                View Dashboard
              </Button>
            </CardContent>
          </Card>

          {/* Profile Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">My Profile</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Update your information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-gray-600 mb-4">
                View and update your profile information and preferences.
              </p>
              <Button
                onClick={() => navigate("/profile")}
                variant="outline"
                className="w-full text-xs sm:text-sm"
              >
                Go to Profile
              </Button>
            </CardContent>
          </Card>

          {/* Products Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">Products</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Browse all products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-gray-600 mb-4">
                View all available products and their variants on the
                marketplace.
              </p>
              <Button
                onClick={() => navigate("/products")}
                variant="outline"
                className="w-full text-xs sm:text-sm"
              >
                Browse Products
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* User Stats Section */}
        <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Quick Stats
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                0
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Active Listings
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">
                0
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Transactions
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                0
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Messages</p>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-orange-600">
                0
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Reviews</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
