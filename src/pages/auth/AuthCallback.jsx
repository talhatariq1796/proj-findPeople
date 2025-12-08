import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { storeSessionTokens } from "../../utils/auth";

const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const hash = window.location.hash.replace("#", "");
        const params = new URLSearchParams(hash);

        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const expiresAt = params.get("expires_at");

        if (accessToken || refreshToken || expiresAt) {
            storeSessionTokens({
                access_token: accessToken,
                refresh_token: refreshToken,
                expires_at: expiresAt ? Number(expiresAt) : undefined,
            });
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
