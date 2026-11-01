package com.project.controller;


import com.project.domain.USER_ROLE;
import com.project.exception.SellerException;
import com.project.exception.UserException;
import com.project.model.*;
import com.project.request.SignupRequest;
import com.project.service.AuthService;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.request.GoogleLoginRequest;
import com.project.request.LoginRequest;
import com.project.response.ApiResponse;
import com.project.response.AuthResponse;


import jakarta.validation.Valid;

import java.util.Map;


@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;


    @PostMapping("/sent/login-signup-otp")
    public ResponseEntity<ApiResponse> sentLoginOtp(
            @RequestBody VerificationCode req) throws MessagingException, UserException {

        authService.sentLoginOtp(req.getEmail());

        ApiResponse res = new ApiResponse();
        res.setMessage("otp sent");
        return new ResponseEntity<>(res, HttpStatus.CREATED);
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> createUserHandler(
            @Valid
            @RequestBody SignupRequest req)
            throws SellerException {


        String token = authService.createUser(req);
        AuthResponse authResponse = new AuthResponse();
        authResponse.setJwt(token);
        authResponse.setMessage("Register Success");
        authResponse.setRole(USER_ROLE.ROLE_CUSTOMER);

        return new ResponseEntity<>(authResponse, HttpStatus.OK);

    }

    @PostMapping("/signin")
    public ResponseEntity<AuthResponse> signin(@RequestBody LoginRequest loginRequest) throws SellerException {

        AuthResponse authResponse = authService.signin(loginRequest);
        return new ResponseEntity<>(authResponse, HttpStatus.OK);
    }

    @GetMapping("/google/config")
    public ResponseEntity<Map<String, String>> googleConfig() {
        return ResponseEntity.ok(Map.of("clientId", authService.googleClientId()));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleSignIn(@RequestBody GoogleLoginRequest request) throws SellerException {
        String credential = request == null ? null : request.getCredential();
        return new ResponseEntity<>(authService.signinWithGoogle(credential), HttpStatus.OK);
    }




}
