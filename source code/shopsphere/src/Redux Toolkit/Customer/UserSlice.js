// src/slices/userSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../Config/Api";
const initialState = {
    user: null,
    loading: false,
    profileChecked: false,
    error: null,
    profileUpdated: false,
};
// Define the base URL for the API
const API_URL = "/api/users";
export const fetchUserProfile = createAsyncThunk("user/fetchUserProfile", async ({ jwt, navigate }, { rejectWithValue }) => {
    try {
        const response = await api.get(`${API_URL}/profile`, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
        return response.data;
    }
    catch (error) {
        return rejectWithValue("Failed to fetch user profile");
    }
});
const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        resetUserState: (state) => {
            state.user = null;
            state.loading = false;
            state.profileChecked = false;
            state.error = null;
            state.profileUpdated = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserProfile.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
            state.user = action.payload;
            state.profileChecked = true;
            state.loading = false;
        })
            .addCase(fetchUserProfile.rejected, (state, action) => {
            state.loading = false;
            state.profileChecked = true;
            state.error = action.payload;
        });
    },
});
export const { resetUserState } = userSlice.actions;
export default userSlice.reducer;
export const selectUser = (state) => state.user.user;
export const selectUserLoading = (state) => state.user.loading;
export const selectUserError = (state) => state.user.error;
