import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRefreshTokenMutation } from "../redux/api/authApi"; // مسار الـ RTK
import { logout } from "../redux/slices/authSlice";

const TokenRefresher = () => {
  const dispatch = useDispatch();
  const [refreshTokenApi] = useRefreshTokenMutation();

  const token = useSelector((state) => state.auth.token);
  const refreshToken = useSelector((state) => state.auth.refreshToken);

  useEffect(() => {
    if (!token || !refreshToken) return;

    const interval = setInterval(async () => {
      try {
        await refreshTokenApi({
          refreshToken,
          token,
        }).unwrap();
      } catch (err) {
        console.error("Refresh token failed", err);
        dispatch(logout());
      }
    }, 25 * 60 * 1000); // كل 25 دقيقة

    return () => clearInterval(interval);
  }, [token, refreshToken, refreshTokenApi, dispatch]);

  return null;
};

export default TokenRefresher;
