import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "../../../features/store";
import { userSlice } from "../../../features/user/userSlice";

type ProtectedRouteProps = {
  children: ReactNode;
  forUnAuth?: boolean;
};

export const ProtectedRoute = ({
  children,
  forUnAuth = false,
}: ProtectedRouteProps) => {
  const currentUser = useSelector(userSlice.selectors.selectCurrentUser);
  const location = useLocation();

  // Если страница для неавторизованных пользователей
  if (forUnAuth) {
    // Если пользователь авторизован, редиректим на предыдущую страницу или главную
    if (currentUser) {
      const { from } = location.state || { from: { pathname: "/" } };
      return <Navigate to={from} replace />;
    }
    // Если не авторизован, показываем страницу
    return <>{children}</>;
  }

  // Если страница для авторизованных пользователей
  // Если пользователь не авторизован, редиректим на логин
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Если авторизован, показываем страницу
  return <>{children}</>;
};
