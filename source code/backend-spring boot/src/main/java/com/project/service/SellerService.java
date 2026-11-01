package com.project.service;

import com.project.domain.AccountStatus;
import com.project.exception.SellerException;
import com.project.model.Seller;
import com.project.response.AuthResponse;
import java.util.List;

public interface SellerService {
    Seller getSellerProfile(String jwt) throws SellerException;
    Seller createSeller(Seller seller) throws SellerException;
    Seller getSellerById(Long id) throws SellerException;
    Seller getSellerByEmail(String email) throws SellerException;
    List<Seller> getAllSellers(AccountStatus status);
    Seller updateSeller(Long id, Seller seller) throws SellerException;
    void deleteSeller(Long id) throws SellerException;
    Seller verifyEmail(String email,String otp) throws SellerException;

    Seller updateSellerAccountStatus(Long sellerId, AccountStatus status) throws SellerException;
    AuthResponse signinWithGoogle(String credential, String mode) throws SellerException;
}
