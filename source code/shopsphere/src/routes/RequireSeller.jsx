import React from 'react';
import { Navigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { useAppSelector } from '../Redux Toolkit/Store';

const RequireSeller = ({ children }) => {
    const { sellers } = useAppSelector(store => store);
    const jwt = localStorage.getItem("jwt");

    if (!jwt && !sellers.loading) {
        return <Navigate to="/login" replace/>;
    }

    if (!sellers.profileChecked || sellers.loading) {
        return <div className="flex min-h-screen items-center justify-center">
            <CircularProgress/>
        </div>;
    }

    if (!sellers.profile) {
        return <Navigate to="/become-seller" replace/>;
    }

    return children;
};

export default RequireSeller;
