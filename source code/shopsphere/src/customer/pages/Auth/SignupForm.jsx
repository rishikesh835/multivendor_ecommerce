import { Button, CircularProgress, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import OTPInput from '../../components/OtpFild/OTPInput';
import { useFormik } from 'formik';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import { useNavigate } from 'react-router-dom';
import { sendLoginSignupOtp, signup } from '../../../Redux Toolkit/Customer/AuthSlice';
const SignupForm = () => {
    const navigate = useNavigate();
    const [otp, setOtp] = useState("");
    const [timer, setTimer] = useState(30);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [formError, setFormError] = useState("");
    const dispatch = useAppDispatch();
    const { auth } = useAppSelector(store => store);
    const formik = useFormik({
        initialValues: {
            email: '',
            name: "",
            password: "",
            confirmPassword: ""
        },
        onSubmit: (values) => {
            if (!values.name.trim()) {
                setFormError("Enter your name");
                return;
            }
            if (!values.password || values.password.length < 6) {
                setFormError("Password must be at least 6 characters");
                return;
            }
            if (values.password !== values.confirmPassword) {
                setFormError("Passwords do not match");
                return;
            }
            if (otp.length < 6) {
                setFormError("Enter the 6 digit OTP");
                return;
            }
            setFormError("");
            dispatch(signup({
                fullName: values.name,
                email: values.email,
                otp,
                password: values.password,
                navigate
            }));
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
        dispatch(sendLoginSignupOtp({ email: formik.values.email }));
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
            <h1 className='text-center font-bold text-xl text-primary-color pb-5'>Signup</h1>
            <form className="space-y-5" onSubmit={formik.handleSubmit}>

                <TextField fullWidth name="email" label="Enter Your Email" value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur}/>

                {auth.otpSent && <div className="space-y-5">
                    <div className="space-y-2">
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
                    </div>
                    <TextField fullWidth name="name" label="Enter Your Name" value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
                    <TextField fullWidth name="password" type="password" label="Create Password" value={formik.values.password} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
                    <TextField fullWidth name="confirmPassword" type="password" label="Confirm Password" value={formik.values.confirmPassword} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
                </div>}

                {formError && <p className="text-sm text-red-600">{formError}</p>}

                {auth.otpSent && <div>
                    <Button disabled={auth.loading} type="submit" fullWidth variant='contained' sx={{ py: "11px" }}> {auth.loading ? <CircularProgress size="small"/> : "Signup"}  </Button>
                </div>}

                {!auth.otpSent && <Button fullWidth variant='contained' onClick={handleResendOTP} disabled={auth.loading} sx={{ py: "11px" }}>
                    {auth.loading ? <CircularProgress size="small"/> : "Send OTP"}

                </Button>}



            </form>


        </div>);
};
export default SignupForm;
