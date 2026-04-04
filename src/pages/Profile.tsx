import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api";

interface ProfileData {
  email: string;
}

const Profile = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!isAuthenticated) {
          navigate("/login");
          return;
        }

        const response = await authApi.profile();
        setProfileData(
          response.data.user || response.data.data || response.data,
        );
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
        setProfileData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
              <span className="text-red-600 text-2xl font-bold">⚠️</span>
            </div>
          </div>
          <p className="text-red-600 mb-6 text-lg font-semibold">Error</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="w-full bg-black hover:bg-gray-800 text-white py-2 rounded-lg font-semibold"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12">
      <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full">
        <div className="text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full">
              <span className="text-white text-2xl font-bold">👤</span>
            </div>
          </div>

          {profileData ? (
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-black">Hello!</h1>
              <p className="text-gray-600 text-lg">
                Profile retrieved successfully
              </p>

              <div className="bg-gray-50 rounded-lg p-6 mt-8">
                <p className="text-sm text-gray-600 font-medium mb-2">
                  Email Address
                </p>
                <p className="text-2xl font-semibold text-gray-900 break-all">
                  {profileData.email}
                </p>
              </div>

              <Button
                onClick={() => navigate("/")}
                className="mt-8 w-full bg-black hover:bg-gray-800 text-white py-2 rounded-lg font-semibold"
              >
                Back
              </Button>
            </div>
          ) : (
            <p className="text-gray-600 text-lg">No profile data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
