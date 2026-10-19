import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../store/useAuth";

/** Full-screen spinner shown while the Supabase session is being restored. */
function RouteSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-base">
      <div className="size-10 animate-spin rounded-full border-[3px] border-outline-subtle border-t-accent" />
    </div>
  );
}

/** Only lets signed-in users through; otherwise sends them to /login */
export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Wait for the initial Supabase session restore before deciding,
  // so a valid session isn't bounced to /login on first load.
  if (loading) return <RouteSpinner />;
  if (!isAuthenticated)
    return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}
