
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { Navigate } from "react-router-dom";

const AuthRequired = ({ children, ...rest }: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) => {
  const { user, loading } = useAuthRBAC();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-therapy-purple"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <div {...rest}>{children}</div>;
};

export default AuthRequired;
