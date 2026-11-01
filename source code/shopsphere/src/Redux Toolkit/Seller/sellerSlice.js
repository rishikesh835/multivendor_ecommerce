import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { api } from "../../Config/Api";
// Define the initial state
const initialState = {
    sellers: [],
    selectedSeller: null,
    loading: false,
    error: null,
    profile: null,
    profileChecked: false,
    report: null,
    profileUpdated: false,
};
// Define the base URL for the API
const API_URL = "/sellers";
// Create async thunks for API calls
export const fetchSellerProfile = createAsyncThunk("sellers/fetchSellerProfile", async (jwt, { rejectWithValue }) => {
    try {
        const response = await api.get(`${API_URL}/profile`, {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        });
        return response.data || null;
    }
    catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return rejectWithValue(error.message);
        }
        else {
            return rejectWithValue("Failed to fetch sellers");
        }
    }
});
export const fetchSellers = createAsyncThunk("sellers/fetchSellers", async (status, { rejectWithValue }) => {
    try {
        const response = await api.get(API_URL, {
            params: {
                status,
            },
        });
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return rejectWithValue(error.message);
        }
        else {
            return rejectWithValue("Failed to fetch sellers");
        }
    }
});
export const fetchSellerReport = createAsyncThunk("sellers/fetchSellerReport", async (jwt, { rejectWithValue }) => {
    try {
        const response = await api.get(`${API_URL}/report`, {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        });
        return response.data;
    }
    catch (error) {
        if (error.response) {
            return rejectWithValue(error.response.data.message);
        }
        return rejectWithValue("Failed to fetch seller report");
    }
});
export const fetchSellerById = createAsyncThunk("sellers/fetchSellerById", async (id, { rejectWithValue }) => {
    try {
        const response = await api.get(`${API_URL}/${id}`);
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return rejectWithValue(error.message);
        }
        else {
            return rejectWithValue("Failed to fetch seller");
        }
    }
});
export const updateSeller = createAsyncThunk("sellers/updateSeller", async (seller, { rejectWithValue }) => {
    try {
        const response = await api.patch(`${API_URL}`, seller, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("jwt")}`,
            },
        });
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return rejectWithValue(error.message);
        }
        else {
            return rejectWithValue("Failed to update seller");
        }
    }
});
export const updateSellerAccountStatus = createAsyncThunk("sellers/updateSellerAccountStatus", async ({ id, status }, { rejectWithValue }) => {
    try {
        const response = await api.patch(`/admin/seller/${id}/status/${status}`);
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return rejectWithValue(error.message);
        }
        else {
            return rejectWithValue("Failed to update seller");
        }
    }
});
export const verifySellerEmail = createAsyncThunk("sellers/verifySellerEmail", async ({ otp, navigate }, { rejectWithValue }) => {
    try {
        const response = await api.patch(`${API_URL}/verify/${otp}`);
        navigate("/seller-account-verified");
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return rejectWithValue(error.message);
        }
        else {
            return rejectWithValue("Failed to update seller");
        }
    }
});
export const deleteSeller = createAsyncThunk("sellers/deleteSeller", async (id, { rejectWithValue }) => {
    try {
        await api.delete(`${API_URL}/${id}`);
    }
    catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return rejectWithValue(error.message);
        }
        else {
            return rejectWithValue("Failed to delete seller");
        }
    }
});
// Create the slice
const sellerSlice = createSlice({
    name: "sellers",
    initialState,
    reducers: {
        resetSellerState: (state) => {
            state.profile = null;
            state.profileChecked = false;
            state.loading = false;
            state.error = null;
            state.profileUpdated = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetch seller profile
            .addCase(fetchSellerProfile.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.profileUpdated = false;
        })
            .addCase(fetchSellerProfile.fulfilled, (state, action) => {
            state.profile = action.payload || null;
            state.profileChecked = true;
            state.loading = false;
        })
            .addCase(fetchSellerProfile.rejected, (state, action) => {
            state.loading = false;
            state.profile = null;
            state.profileChecked = true;
            state.error = action.payload || "Failed to fetch sellers";
        })
            // fetch sellers
            .addCase(fetchSellers.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchSellers.fulfilled, (state, action) => {
            state.sellers = action.payload;
            state.loading = false;
        })
            .addCase(fetchSellers.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to fetch sellers";
        })
            .addCase(fetchSellerById.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchSellerById.fulfilled, (state, action) => {
            state.selectedSeller = action.payload;
            state.loading = false;
        })
            .addCase(fetchSellerById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to fetch seller";
        })
            .addCase(updateSeller.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.profileUpdated = false;
        })
            .addCase(updateSeller.fulfilled, (state, action) => {
            const index = state.sellers.findIndex((seller) => seller.id === action.payload.id);
            if (index !== -1) {
                state.sellers[index] = action.payload;
            }
            state.profile = action.payload;
            state.loading = false;
            state.profileUpdated = true;
        })
            .addCase(updateSeller.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to update seller";
        })
            // update seller status
            .addCase(updateSellerAccountStatus.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(updateSellerAccountStatus.fulfilled, (state, action) => {
            const index = state.sellers.findIndex((seller) => seller.id === action.payload.id);
            if (index !== -1) {
                state.sellers[index] = action.payload;
            }
            state.loading = false;
        })
            .addCase(updateSellerAccountStatus.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to update seller";
        })
            .addCase(deleteSeller.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(deleteSeller.fulfilled, (state, action) => {
            state.sellers = state.sellers.filter((seller) => seller.id !== action.meta.arg);
            state.loading = false;
        })
            .addCase(deleteSeller.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to delete seller";
        })
            // seller report
            .addCase(fetchSellerReport.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchSellerReport.fulfilled, (state, action) => {
            state.loading = false;
            state.report = action.payload;
        })
            .addCase(fetchSellerReport.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});
export const { resetSellerState } = sellerSlice.actions;
export default sellerSlice.reducer;
// Define selector functions
export const selectSellers = (state) => state.sellers.sellers;
export const selectSelectedSeller = (state) => state.sellers.selectedSeller;
export const selectSellerLoading = (state) => state.sellers.loading;
export const selectSellerError = (state) => state.sellers.error;
