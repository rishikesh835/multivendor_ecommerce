import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from './LoginForm';
import { Alert, Button, Snackbar } from '@mui/material';
import SignupForm from './SignupForm';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import { clearAuthStatus, signinWithGoogle } from '../../../Redux Toolkit/Customer/AuthSlice';
import GoogleSignIn from './GoogleSignIn';
const Auth = () => {
    const [isLoginPage, setIsLoginPage] = useState(true);
    const handleCloseSnackbar = () => setSnackbarOpen(false);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { auth } = useAppSelector(store => store);
    const handleGoogle = useCallback((credential) => {
        dispatch(signinWithGoogle({ credential, navigate }));
    }, [dispatch, navigate]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    useEffect(() => {
        if (auth.otpSent || auth.error) {
            setSnackbarOpen(true);
        }
    }, [auth.otpSent, auth.error]);
    return (<div className='flex justify-center h-[90vh] items-center'>
            <div className='max-w-md max-h-[90vh] overflow-y-auto rounded-md border shadow-lg '>
                <img className='w-full rounded-t-md' src="/login_banner.png" alt=""/>
                <div className='mt-8 px-10 pb-8'>
                    {isLoginPage ? <LoginForm /> : <SignupForm />}
                    <GoogleSignIn loading={auth.loading} onCredential={handleGoogle}/>

                    <div className='flex items-center gap-1 justify-center mt-5'>
                        <p>{isLoginPage && "Don't"} have Account ?</p>
                        <Button onClick={() => { dispatch(clearAuthStatus()); setIsLoginPage(!isLoginPage); }} size='small'>{isLoginPage ? "create customer account" : "login"}</Button>
                    </div>
                </div>


            </div>
            <Snackbar anchorOrigin={{ vertical: "top", horizontal: "right" }} open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={auth.error ? "error" : "success"} variant="filled" sx={{ width: '100%' }}>
                    {auth.error ? auth.error : " otp sent to your email!"}
                </Alert>
            </Snackbar>
        </div>);
};
export default Auth;
