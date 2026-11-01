import { Button, CircularProgress } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import React, { useEffect, useRef, useState } from 'react';
import { api } from '../../../Config/Api';
const GoogleSignIn = ({ onCredential, loading = false }) => {
    const buttonRef = useRef(null);
    const [clientId, setClientId] = useState("");
    const [ready, setReady] = useState(false);
    const [setupError, setSetupError] = useState("");

    useEffect(() => {
        let cancelled = false;
        api.get('/auth/google/config')
            .then((response) => {
                if (!cancelled) {
                    setClientId(response.data?.clientId || "");
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setClientId("");
                }
            });
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!clientId || !buttonRef.current) {
            return undefined;
        }

        const render = () => {
            if (!window.google?.accounts?.id || !buttonRef.current) {
                return;
            }
            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: (response) => {
                    if (!response?.credential) {
                        return;
                    }
                    onCredential(response.credential);
                },
            });
            buttonRef.current.innerHTML = "";
            window.google.accounts.id.renderButton(buttonRef.current, {
                theme: "outline",
                size: "large",
                text: "continue_with",
                shape: "rectangular",
                width: buttonRef.current.offsetWidth || 320,
            });
            setReady(true);
        };

        const existing = document.getElementById("google-gsi");
        if (existing) {
            if (window.google?.accounts?.id) {
                render();
            } else {
                existing.addEventListener("load", render, { once: true });
            }
            return undefined;
        }

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.id = "google-gsi";
        script.onload = render;
        script.onerror = () => setSetupError("Google sign-in could not be loaded");
        document.body.appendChild(script);
        return undefined;
    }, [clientId, onCredential]);

    return (<div className="mt-5">
            <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-gray-200"/>
                <span className="text-xs text-gray-500">or</span>
                <div className="h-px flex-1 bg-gray-200"/>
            </div>
            {clientId ? (<div className="relative">
                    <div ref={buttonRef} className="flex justify-center min-h-[40px]"/>
                    {loading && <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                        <CircularProgress size={22}/>
                    </div>}
                </div>) : (<Button fullWidth variant="outlined" onClick={() => setSetupError("Add your Google client id in application.properties, then restart the server")} sx={{ py: "10px", textTransform: "none", color: "#3c4043", borderColor: "#dadce0" }}>
                    <GoogleIcon sx={{ mr: 1 }}/>
                    Continue with Google
                </Button>)}
            {setupError && !ready && <p className="text-sm text-red-600 text-center mt-2">{setupError}</p>}
        </div>);
};

export default GoogleSignIn;
