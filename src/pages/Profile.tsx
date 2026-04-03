import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api";
import { LoadingSpinner } from "@/components/Loading";
import { ErrorCard } from "@/components/Error";

interface ProfileData {
  id?: number;
  userId?: number;
  name?: string;
  email: string;
  role_id?: number;
  roleId?: number;
  [key: string]: any;
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
      <div className="max-w-4xl mx-auto px-4 py-12 flex items-center justify-center h-96">
        <LoadingSpinner size="md" text="Loading profile..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorCard
        message={error}
        onRetry={() => window.location.reload()}
        containerClass="max-w-4xl mx-auto px-4 py-12"
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile</h1>

        {profileData ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <p className="mt-1 text-gray-900">{profileData.name || "N/A"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <p className="mt-1 text-gray-900">{profileData.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                User ID
              </label>
              <p className="mt-1 text-gray-900">
                {profileData.userId || profileData.id || "N/A"}
              </p>
            </div>
            {profileData.roleId && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role ID
                </label>
                <p className="mt-1 text-gray-900">{profileData.roleId}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-600">No profile data available</p>
        )}

        <div className="mt-8">
          <Button
            onClick={() => navigate("/")}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
