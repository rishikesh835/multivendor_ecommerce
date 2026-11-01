package com.project.service;

import com.project.exception.SellerException;
import com.project.exception.UserException;
import com.project.request.LoginRequest;
import com.project.request.SignupRequest;
import com.project.response.AuthResponse;
import jakarta.mail.MessagingException;

public interface AuthService {

    void sentLoginOtp(String email) throws UserException, MessagingException;
    String createUser(SignupRequest req) throws SellerException;
    AuthResponse signin(LoginRequest req) throws SellerException;
    String googleClientId();
    AuthResponse signinWithGoogle(String credential) throws SellerException;

}
