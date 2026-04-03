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
    <div className="min-h-screen bg-muted/30 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome to MO Marketplace
          </h1>
          <p className="text-gray-600 mt-2">
            Hello,{" "}
            <span className="font-semibold">{user?.name || user?.email}</span>!
            👋
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Dashboard Card */}
          <Card>
            <CardHeader>
              <CardTitle>Dashboard</CardTitle>
              <CardDescription>View your activity</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Manage your account and view your marketplace activity.
              </p>
              <Button
                onClick={() => navigate("/profile")}
                variant="outline"
                className="w-full"
              >
                View Dashboard
              </Button>
            </CardContent>
          </Card>

          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
              <CardDescription>Update your information</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                View and update your profile information and preferences.
              </p>
              <Button
                onClick={() => navigate("/profile")}
                variant="outline"
                className="w-full"
              >
                Go to Profile
              </Button>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Learn how to use the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Get started with MO Marketplace and explore all the features
                available.
              </p>
              <Button variant="outline" className="w-full">
                Help Center
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* User Stats Section */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">0</div>
              <p className="text-gray-600">Active Listings</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">0</div>
              <p className="text-gray-600">Transactions</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">0</div>
              <p className="text-gray-600">Messages</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">0</div>
              <p className="text-gray-600">Reviews</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
