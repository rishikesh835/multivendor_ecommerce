import { Button, CircularProgress, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import OTPInput from '../../components/OtpFild/OTPInput';
import { useFormik } from 'formik';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import { useNavigate } from 'react-router-dom';
import { sendLoginSignupOtp, signin } from '../../../Redux Toolkit/Customer/AuthSlice';
const LoginForm = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState('password');
    const [otp, setOtp] = useState("");
    const [timer, setTimer] = useState(30);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [formError, setFormError] = useState("");
    const dispatch = useAppDispatch();
    const { auth } = useAppSelector(store => store);
    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        onSubmit: (values) => {
            if (!values.email) {
                setFormError("Enter your email");
                return;
            }
            if (mode === 'password') {
                if (!values.password) {
                    setFormError("Enter your password");
                    return;
                }
                setFormError("");
                dispatch(signin({ email: values.email, password: values.password, navigate }));
                return;
            }
            if (otp.length < 6) {
                setFormError("Enter the 6 digit OTP");
                return;
            }
            setFormError("");
            dispatch(signin({ email: values.email, otp, navigate }));
        }
    });
    const handleOtpChange = (value) => {
        setOtp(value);
    };
    const handleResendOTP = () => {
        if (!formik.values.email) {
            setFormError("Enter your email");
            return;
        }
        setFormError("");
        dispatch(sendLoginSignupOtp({ email: "signing_" + formik.values.email }));
        setTimer(30);
        setIsTimerActive(true);
    };
    useEffect(() => {
        let interval;
        if (isTimerActive) {
            interval = setInterval(() => {
                setTimer(prev => {
                    if (prev === 1) {
                        clearInterval(interval);
                        setIsTimerActive(false);
                        return 30;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (interval)
                clearInterval(interval);
        };
    }, [isTimerActive]);
    return (<div>
            <h1 className='text-center font-bold text-xl text-primary-color pb-4'>Login</h1>
            <div className="flex justify-center gap-2 pb-5">
                <Button size="small" variant={mode === 'password' ? 'contained' : 'outlined'} onClick={() => { setMode('password'); setFormError(""); }}>Password</Button>
                <Button size="small" variant={mode === 'otp' ? 'contained' : 'outlined'} onClick={() => { setMode('otp'); setFormError(""); }}>OTP</Button>
            </div>
            <form className="space-y-5" onSubmit={formik.handleSubmit}>

                <TextField fullWidth name="email" label="Enter Your Email" value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur}/>

                {mode === 'password' && <TextField fullWidth name="password" type="password" label="Enter Your Password" value={formik.values.password} onChange={formik.handleChange} onBlur={formik.handleBlur}/>}

                {mode === 'otp' && auth.otpSent && <div className="space-y-2">
                    <p className="font-medium text-sm">
                        * Enter OTP sent to your email
                    </p>
                    <OTPInput length={6} onChange={handleOtpChange} error={false}/>
                    <p className="text-xs space-x-2">
                        {isTimerActive ? (<span>Resend OTP in {timer} seconds</span>) : (<>
                                Didn’t receive OTP?{" "}
                                <span onClick={handleResendOTP} className="text-teal-600 cursor-pointer hover:text-teal-800 font-semibold">
                                    Resend OTP
                                </span>
                            </>)}
                    </p>
                </div>}

                {formError && <p className="text-sm text-red-600">{formError}</p>}

                {mode === 'password' && <Button disabled={auth.loading} type="submit" fullWidth variant='contained' sx={{ py: "11px" }}>{auth.loading ? <CircularProgress size="small"/> : "Login"}</Button>}

                {mode === 'otp' && auth.otpSent && <Button disabled={auth.loading} type="submit" fullWidth variant='contained' sx={{ py: "11px" }}>{auth.loading ? <CircularProgress size="small"/> : "Login"}</Button>}

                {mode === 'otp' && !auth.otpSent && <Button disabled={auth.loading} fullWidth variant='contained' onClick={handleResendOTP} sx={{ py: "11px" }}>{auth.loading ? <CircularProgress size="small"/> : "Send OTP"}</Button>}


            </form>

         
        </div>);
};
export default LoginForm;
