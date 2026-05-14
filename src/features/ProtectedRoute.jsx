import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children, adminOnly = false, sellerOnly = false, userOnly = false }) => {

    const loggedIn = useSelector(state => state.auth.loggedIn);
    const isSeller = useSelector(state => state.auth.isSeller || state.auth.isAdmin);

    if (!loggedIn) {
        return <Navigate to="/login" />;
    }

    if ((adminOnly || sellerOnly) && !isSeller) {
        return <Navigate to="/" />;
    }

    if (userOnly && isSeller) {
        return <Navigate to="/seller" />;
    }

    return children;
};
