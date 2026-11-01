import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../../Config/Api';
// Async thunk to fetch home page data with try-catch for error handling
export const fetchHomePageData = createAsyncThunk('home/fetchHomePageData', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/home-page');
        return response.data;
    }
    catch (error) {
        // Handle the error and return it to be used in rejected action
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch home page data';
        return rejectWithValue(errorMessage);
    }
});
export const createHomeCategories = createAsyncThunk('home/createHomeCategories', async (homeCategories, { rejectWithValue }) => {
    try {
        const response = await api.post('/home/categories', homeCategories);
        return response.data;
    }
    catch (error) {
        // Handle the error and return it to be used in rejected action
        const errorMessage = error.response?.data?.message || error.message || 'Failed to create home categories';
        return rejectWithValue(errorMessage);
    }
});
