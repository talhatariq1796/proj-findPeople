import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const hash = window.location.hash.replace("#", "");
        const params = new URLSearchParams(hash);

        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const expiresAt = params.get("expires_at");

        if (accessToken) {
            localStorage.setItem("auth_token", accessToken);
        }
        if (refreshToken) {
            localStorage.setItem("refresh_token", refreshToken);
        }
        if (expiresAt) {
            localStorage.setItem("expires_at", expiresAt);
        }

        navigate("/home"); 
    }, []);

    return (
        <div className="flex h-screen items-center justify-center">
            <h1 className="text-xl font-semibold text-gray-700">
                Verifying your email...
            </h1>
        </div>
    );
};

export default AuthCallback;
