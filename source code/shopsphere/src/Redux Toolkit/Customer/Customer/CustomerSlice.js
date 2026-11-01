// homeSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import { createHomeCategories, fetchHomePageData } from './AsyncThunk';
import { homeCategories } from '../../../data/homeCategories';

const bySection = (section) => homeCategories.filter((item) => item.section === section);

const localHomePageData = {
    electricCategories: bySection('ELECTRIC_CATEGORIES'),
    grid: bySection('GRID'),
    shopByCategories: bySection('SHOP_BY_CATEGORIES'),
    dealCategories: bySection('DEALS'),
    deals: bySection('DEALS').map((category) => ({ discount: 10, category })),
};

const hasImages = (data) => [data?.electricCategories, data?.grid, data?.shopByCategories]
    .some((list) => Array.isArray(list) && list.some((item) => item?.image));

const initialState = {
    homePageData: localHomePageData,
    homeCategories: [],
    loading: false,
    error: null,
};
const homeSlice = createSlice({
    name: 'home',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Handle fetchHomePageData lifecycle
        builder.addCase(fetchHomePageData.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchHomePageData.fulfilled, (state, action) => {
            state.loading = false;
            if (hasImages(action.payload)) {
                state.homePageData = action.payload;
            }
        });
        builder.addCase(fetchHomePageData.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || 'Failed to load home page data';
        });
        // Handle createHomeCategories lifecycle
        builder.addCase(createHomeCategories.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(createHomeCategories.fulfilled, (state, action) => {
            state.loading = false;
            if (hasImages(action.payload)) {
                state.homePageData = action.payload;
            }
        });
        builder.addCase(createHomeCategories.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || 'Failed to create home categories';
        });
    },
});
export default homeSlice.reducer;
