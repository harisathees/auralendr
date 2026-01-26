import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../context/Auth/AuthContext";
import GoldCoinSpinner from "../../../components/Shared/LoadingGoldCoinSpinner/GoldCoinSpinner";

interface RoleGuardProps {
    children: ReactNode;
    allowedRoles: string[];
}

const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
    const { user, booting } = useAuth();

    if (booting) {
        return <div className="flex justify-center items-center h-screen"><GoldCoinSpinner /></div>;
    }

    if (!user || !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

export default RoleGuard;
