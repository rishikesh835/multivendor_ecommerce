import React from 'react';
import { Navigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { useAppSelector } from '../Redux Toolkit/Store';

const RequireAdmin = ({ children }) => {
    const { user, sellers } = useAppSelector(store => store);
    const jwt = localStorage.getItem("jwt");

    if (!jwt) {
        return <Navigate to="/login" replace/>;
    }

    if (!user.profileChecked || !sellers.profileChecked) {
        return <div className="flex min-h-screen items-center justify-center">
            <CircularProgress/>
        </div>;
    }

    if (user.user?.role === "ROLE_ADMIN" || sellers.profile) {
        return children;
    }

    return <Navigate to="/" replace/>;
};

export default RequireAdmin;
