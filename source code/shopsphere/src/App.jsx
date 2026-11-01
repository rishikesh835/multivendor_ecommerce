import './App.css';
import { ThemeProvider } from '@emotion/react';
import customeTheme from './Theme/customeTheme';
import { Route, Routes, useNavigate } from 'react-router-dom';
import SellerDashboard from './seller/pages/SellerDashboard/SellerDashboard';
import CustomerRoutes from './routes/CustomerRoutes';
import AdminDashboard from './admin/pages/Dashboard/Dashboard';
import SellerAccountVerification from './seller/pages/SellerAccountVerification';
import SellerAccountVerified from './seller/pages/SellerAccountVerified';
import { useAppDispatch, useAppSelector } from './Redux Toolkit/Store';
import { useEffect } from 'react';
import { fetchSellerProfile } from './Redux Toolkit/Seller/sellerSlice';
import BecomeSeller from './customer/pages/BecomeSeller/BecomeSeller';
import AdminAuth from './admin/pages/Auth/AdminAuth';
import { fetchUserProfile } from './Redux Toolkit/Customer/UserSlice';
import { createHomeCategories } from './Redux Toolkit/Customer/Customer/AsyncThunk';
import { homeCategories } from './data/homeCategories';
import Mobile from './data/Products/mobile';
import RequireSeller from './routes/RequireSeller';
function App() {
    const dispatch = useAppDispatch();
    const { auth, sellerAuth, sellers } = useAppSelector(store => store);
    const navigate = useNavigate();
    useEffect(() => {
        const jwt = localStorage.getItem("jwt");
        if (!jwt) {
            return;
        }
        dispatch(fetchUserProfile({ jwt, navigate }));
        dispatch(fetchSellerProfile(jwt));
    }, [auth.jwt, sellerAuth.jwt]);
    useEffect(() => {
        dispatch(createHomeCategories(homeCategories));
        // dispatch(fetchHomePageData())
    }, [dispatch]);
    return (<ThemeProvider theme={customeTheme}>
      <div className='App'>


        <Routes>
          {sellers.profile && <Route path='/seller/*' element={<SellerDashboard />}/>}
          <Route path='/admin/*' element={<RequireSeller><AdminDashboard /></RequireSeller>}/>
          <Route path='/verify-seller/:otp' element={<SellerAccountVerification />}/>
          <Route path='/seller-account-verified' element={<SellerAccountVerified />}/>
          <Route path='/become-seller' element={<BecomeSeller />}/>
          <Route path='/admin-login' element={<AdminAuth />}/>

          <Route path='/dummy' element={<Mobile />}/>

          <Route path='*' element={<CustomerRoutes />}/>

        </Routes>
        {/* <Footer/> */}
      </div>



    </ThemeProvider>);
}
export default App;
