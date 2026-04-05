import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api";
import { LoadingSpinner } from "@/components/Loading";
import { ErrorDisplay } from "@/components/Error";
import type { ProfileData } from "@/types";

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
    return <LoadingSpinner message="Loading profile..." variant="profile" />;
  }

  if (error) {
    return (
      <ErrorDisplay
        message={error}
        variant="profile"
        onRetry={() => window.location.reload()}
      />
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
