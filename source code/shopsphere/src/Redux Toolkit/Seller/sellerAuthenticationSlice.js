import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../Config/Api';
import axios from 'axios';
import { fetchSellerProfile, resetSellerState } from './sellerSlice';
const initialState = {
    otpSent: false,
    error: null,
    loading: false,
    jwt: null,
    sellerCreated: "",
    needsOnboarding: false
};
const API_URL = '/sellers';
// Define async thunks for sending and verifying OTP
export const sendLoginOtp = createAsyncThunk('otp/sendLoginOtp', async (email, { rejectWithValue }) => {
    try {
        const { data } = await api.post('/sellers/sent/login-top', { email });
        return { email };
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to send OTP');
    }
});
const openSellerAdmin = async (jwt, navigate, dispatch) => {
    dispatch(resetSellerState());
    localStorage.setItem("jwt", jwt);
    const profileResult = await dispatch(fetchSellerProfile(jwt));
    if (fetchSellerProfile.rejected.match(profileResult) || !profileResult.payload) {
        localStorage.removeItem("jwt");
        dispatch(resetSellerState());
        return "This account is not a seller";
    }
    navigate("/seller");
    return null;
};
export const verifyLoginOtp = createAsyncThunk('otp/verifyLoginOtp', async (data, { dispatch, rejectWithValue }) => {
    try {
        const response = await api.post('/sellers/verify/login-top', data);
        const failure = await openSellerAdmin(response.data.jwt, data.navigate, dispatch);
        if (failure) {
            return rejectWithValue(failure);
        }
        return response.data;
    }
    catch (error) {
        const body = error.response?.data;
        const message = typeof body === 'string' ? body : body?.error || body?.message;
        return rejectWithValue(message || 'Failed to verify OTP');
    }
});
export const signinSeller = createAsyncThunk('sellers/signin', async ({ email, password, navigate }, { dispatch, rejectWithValue }) => {
    try {
        const response = await api.post(`${API_URL}/login`, { email, password });
        const failure = await openSellerAdmin(response.data.jwt, navigate, dispatch);
        if (failure) {
            return rejectWithValue(failure);
        }
        return response.data;
    }
    catch (error) {
        const data = error.response?.data;
        const message = typeof data === 'string' ? data : data?.error || data?.message;
        return rejectWithValue(message || 'Signin failed');
    }
});
export const googleSeller = createAsyncThunk('sellers/google', async ({ credential, mode, navigate }, { dispatch, rejectWithValue }) => {
    try {
        const response = await api.post(`${API_URL}/google`, { credential, mode });
        localStorage.setItem("jwt", response.data.jwt);
        dispatch(resetSellerState());
        const profileResult = await dispatch(fetchSellerProfile(response.data.jwt));
        if (fetchSellerProfile.rejected.match(profileResult) || !profileResult.payload) {
            localStorage.removeItem("jwt");
            dispatch(resetSellerState());
            return rejectWithValue("This account is not a seller");
        }
        const needsOnboarding = mode === "register" || !response.data.profileComplete;
        if (!needsOnboarding) {
            navigate("/seller");
        }
        return { ...response.data, needsOnboarding };
    }
    catch (error) {
        const data = error.response?.data;
        const message = typeof data === 'string' ? data : data?.error || data?.message;
        return rejectWithValue(message || 'Google sign-in failed');
    }
});
export const createSeller = createAsyncThunk('sellers/createSeller', async (seller, { rejectWithValue }) => {
    try {
        const response = await api.post(API_URL, seller);
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return rejectWithValue(error.message);
        }
        else {
            return rejectWithValue('Failed to create seller');
        }
    }
});
// Create the slice
const sellerAuthSlice = createSlice({
    name: 'sellerAuth',
    initialState,
    reducers: {
        resetSellerAuthState: (state) => {
            state.otpSent = false;
            state.error = null;
            state.loading = false;
            state.jwt = null;
            state.needsOnboarding = false;
        },
    },
    extraReducers: (builder) => {
        // Handle sendLoginOtp actions
        builder
            .addCase(sendLoginOtp.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(sendLoginOtp.fulfilled, (state) => {
            state.loading = false;
            state.otpSent = true;
            state.error = null;
        })
            .addCase(sendLoginOtp.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
        // Handle verifyLoginOtp actions
        builder
            .addCase(verifyLoginOtp.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(verifyLoginOtp.fulfilled, (state, action) => {
            state.loading = false;
            state.jwt = action.payload.jwt;
            state.error = null;
        })
            .addCase(verifyLoginOtp.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            .addCase(signinSeller.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(signinSeller.fulfilled, (state, action) => {
            state.loading = false;
            state.jwt = action.payload.jwt;
            state.error = null;
        })
            .addCase(signinSeller.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            .addCase(googleSeller.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.needsOnboarding = false;
        })
            .addCase(googleSeller.fulfilled, (state, action) => {
            state.loading = false;
            state.jwt = action.payload.jwt;
            state.needsOnboarding = action.payload.needsOnboarding;
            state.error = null;
        })
            .addCase(googleSeller.rejected, (state, action) => {
            state.loading = false;
            state.needsOnboarding = false;
            state.error = action.payload;
        })
            // create new seller
            .addCase(createSeller.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(createSeller.fulfilled, (state, action) => {
            // state.sellers.push(action.payload);
            state.sellerCreated = "verification email sent to you";
            state.loading = false;
        })
            .addCase(createSeller.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || 'Failed to create seller';
        });
    },
});
// Export actions and reducer
export const { resetSellerAuthState } = sellerAuthSlice.actions;
export default sellerAuthSlice.reducer;
