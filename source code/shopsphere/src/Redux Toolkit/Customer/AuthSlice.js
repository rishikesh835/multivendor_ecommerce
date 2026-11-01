// src/slices/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../Config/Api';
import { resetUserState } from './UserSlice';
import { resetCartState } from './CartSlice';
import { fetchSellerProfile, resetSellerState } from '../Seller/sellerSlice';

const finishLogin = async (data, navigate, dispatch) => {
    localStorage.setItem("jwt", data.jwt);
    if (data.role === "ROLE_ADMIN") {
        navigate("/admin");
        return;
    }
    if (data.role === "ROLE_SELLER") {
        dispatch(resetSellerState());
        const profileResult = await dispatch(fetchSellerProfile(data.jwt));
        if (fetchSellerProfile.fulfilled.match(profileResult)) {
            navigate("/seller");
            return;
        }
    }
    navigate("/");
};
const initialState = {
    jwt: null,
    role: null,
    loading: false,
    error: null,
    otpSent: false
};
// Define the base URL for the API
const API_URL = '/auth';
export const sendLoginSignupOtp = createAsyncThunk('auth/sendLoginSignupOtp', async ({ email }, { rejectWithValue }) => {
    try {
        const response = await api.post(`${API_URL}/sent/login-signup-otp`, { email });
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response.data.error || 'Failed to send OTP');
    }
});
export const signup = createAsyncThunk('auth/signup', async ({ fullName, email, otp, password, navigate }, { rejectWithValue }) => {
    try {
        const response = await api.post(`${API_URL}/signup`, { fullName, email, otp, password });
        localStorage.setItem("jwt", response.data.jwt);
        navigate("/");
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.error || 'Signup failed');
    }
});
export const signin = createAsyncThunk('auth/signin', async ({ email, otp, password, navigate }, { dispatch, rejectWithValue }) => {
    try {
        const response = await api.post(`${API_URL}/signin`, { email, otp, password });
        await finishLogin(response.data, navigate, dispatch);
        return response.data;
    }
    catch (error) {
        const data = error.response?.data;
        const message = typeof data === 'string' ? data : data?.error;
        return rejectWithValue(message || 'Signin failed');
    }
});
export const signinWithGoogle = createAsyncThunk('auth/signinWithGoogle', async ({ credential, navigate }, { dispatch, rejectWithValue }) => {
    try {
        const response = await api.post(`${API_URL}/google`, { credential });
        await finishLogin(response.data, navigate, dispatch);
        return response.data;
    }
    catch (error) {
        const data = error.response?.data;
        const message = typeof data === 'string' ? data : data?.error;
        return rejectWithValue(message || 'Google sign-in failed');
    }
});
export const resetPassword = createAsyncThunk('auth/resetPassword', async (resetPasswordRequest, { rejectWithValue }) => {
    try {
        const response = await api.post(`${API_URL}/reset-password`, resetPasswordRequest);
        return response.data;
    }
    catch (error) {
        return rejectWithValue('Reset password failed');
    }
});
export const resetPasswordRequest = createAsyncThunk('auth/resetPasswordRequest', async ({ email }, { rejectWithValue }) => {
    try {
        const response = await api.post(`${API_URL}/reset-password-request`, { email });
        return response.data;
    }
    catch (error) {
        return rejectWithValue('Reset password request failed');
    }
});
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.jwt = null;
            state.role = null;
            localStorage.clear();
        },
        clearAuthStatus: (state) => {
            state.otpSent = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(sendLoginSignupOtp.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(sendLoginSignupOtp.fulfilled, (state) => {
            state.loading = false;
            state.otpSent = true;
        })
            .addCase(sendLoginSignupOtp.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            .addCase(signup.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(signup.fulfilled, (state, action) => {
            state.jwt = action.payload.jwt;
            state.role = action.payload.role;
            state.loading = false;
        })
            .addCase(signup.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            .addCase(signin.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(signin.fulfilled, (state, action) => {
            state.jwt = action.payload.jwt;
            state.role = action.payload.role;
            state.loading = false;
        })
            .addCase(signin.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            .addCase(signinWithGoogle.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(signinWithGoogle.fulfilled, (state, action) => {
            state.jwt = action.payload.jwt;
            state.role = action.payload.role;
            state.loading = false;
        })
            .addCase(signinWithGoogle.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            .addCase(resetPassword.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(resetPassword.fulfilled, (state) => {
            state.loading = false;
        })
            .addCase(resetPassword.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            .addCase(resetPasswordRequest.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(resetPasswordRequest.fulfilled, (state) => {
            state.loading = false;
        })
            .addCase(resetPasswordRequest.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});
export const { logout, clearAuthStatus } = authSlice.actions;
export default authSlice.reducer;
export const performLogout = () => async (dispatch) => {
    dispatch(logout());
    dispatch(resetUserState());
    dispatch(resetCartState());
    dispatch(resetSellerState());
};
export const selectAuth = (state) => state.auth;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
