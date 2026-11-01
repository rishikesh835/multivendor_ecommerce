package com.project.controller;

import com.project.config.JwtProvider;
import com.project.domain.AccountStatus;
import com.project.domain.USER_ROLE;
import com.project.exception.SellerException;
import com.project.model.Seller;
import com.project.model.SellerReport;
import com.project.model.VerificationCode;
import com.project.request.LoginRequest;
import com.project.request.SellerGoogleRequest;
import com.project.repository.VerificationCodeRepository;
import com.project.response.ApiResponse;
import com.project.response.AuthResponse;
import com.project.service.*;
import com.project.service.impl.CustomeUserServiceImplementation;
import com.project.utils.OtpUtils;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.List;

@RestController
@RequestMapping("/sellers")
@RequiredArgsConstructor
public class SellerController {

    private final SellerService sellerService;
    private final SellerReportService sellerReportService;
    private final EmailService emailService;
    private final VerificationCodeRepository verificationCodeRepository;
    private final VerificationService verificationService;
    private final JwtProvider jwtProvider;
    private final CustomeUserServiceImplementation customeUserServiceImplementation;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.frontend.url}")
    private String frontendUrl;


    @PostMapping("/sent/login-top")
    public ResponseEntity<ApiResponse> sentLoginOtp(@RequestBody VerificationCode req) throws MessagingException, SellerException {
        sellerForLogin(req.getEmail());

        String otp = OtpUtils.generateOTP();
        VerificationCode verificationCode = verificationService.createVerificationCode(otp, req.getEmail());

        String subject = "ShopSphere Login Otp";
        String text = "your login otp is - ";
        emailService.sendVerificationOtpEmail(req.getEmail(), verificationCode.getOtp(), subject, text);

        ApiResponse res = new ApiResponse();
        res.setMessage("otp sent");
        return new ResponseEntity<>(res, HttpStatus.CREATED);
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> google(@RequestBody SellerGoogleRequest request) throws SellerException {
        String credential = request == null ? null : request.getCredential();
        String mode = request == null ? "login" : request.getMode();
        return new ResponseEntity<>(sellerService.signinWithGoogle(credential, mode), HttpStatus.OK);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) throws SellerException {
        Seller seller = sellerForLogin(req.getEmail());
        if (seller.getPassword() == null
                || req.getPassword() == null
                || req.getPassword().isBlank()
                || !passwordEncoder.matches(req.getPassword(), seller.getPassword())) {
            throw new SellerException("wrong email or password");
        }

        Authentication authentication = authenticate(req.getEmail());
        SecurityContextHolder.getContext().setAuthentication(authentication);
        return new ResponseEntity<>(buildAuthResponse(authentication), HttpStatus.OK);
    }

    @PostMapping("/verify/login-top")
    public ResponseEntity<AuthResponse> verifyLoginOtp(@RequestBody VerificationCode req) throws MessagingException, SellerException {
//        Seller savedSeller = sellerService.createSeller(seller);


        String otp = req.getOtp();
        String email = req.getEmail();
        sellerForLogin(email);
        VerificationCode verificationCode = verificationCodeRepository.findByEmail(email);

        if (verificationCode == null || !verificationCode.getOtp().equals(otp)) {
            throw new SellerException("wrong otp...");
        }

        Authentication authentication = authenticate(req.getEmail());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        return new ResponseEntity<>(buildAuthResponse(authentication), HttpStatus.OK);
    }

    private Seller sellerForLogin(String email) throws SellerException {
        try {
            Seller seller = sellerService.getSellerByEmail(email);
            if (seller.getRole() != USER_ROLE.ROLE_SELLER) {
                throw new SellerException("This account is not a seller");
            }
            return seller;
        } catch (SellerException ex) {
            if ("Seller not found".equals(ex.getMessage())) {
                throw new SellerException("This account is not a seller");
            }
            throw ex;
        }
    }

    private AuthResponse buildAuthResponse(Authentication authentication) {
        String token = jwtProvider.generateToken(authentication);
        AuthResponse authResponse = new AuthResponse();
        authResponse.setMessage("Login Success");
        authResponse.setJwt(token);
        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        String roleName = authorities.isEmpty() ? null : authorities.iterator().next().getAuthority();
        authResponse.setRole(USER_ROLE.valueOf(roleName));
        return authResponse;
    }

    private String frontendPath(String path) {
        String base = frontendUrl.endsWith("/")
                ? frontendUrl.substring(0, frontendUrl.length() - 1)
                : frontendUrl;
        return base + path;
    }

    private Authentication authenticate(String username) {
        UserDetails userDetails = customeUserServiceImplementation.loadUserByUsername("seller_" + username);

        System.out.println("sign in userDetails - " + userDetails);

        if (userDetails == null) {
            System.out.println("sign in userDetails - null " + userDetails);
            throw new BadCredentialsException("Invalid username or password");
        }

        return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
    }

    @PatchMapping("/verify/{otp}")
    public ResponseEntity<Seller> verifySellerEmail(@PathVariable String otp) throws SellerException {


        VerificationCode verificationCode = verificationCodeRepository.findByOtp(otp);

        if (verificationCode == null || !verificationCode.getOtp().equals(otp)) {
            throw new SellerException("wrong otp...");
        }

        Seller seller = sellerService.verifyEmail(verificationCode.getEmail(), otp);

        return new ResponseEntity<>(seller, HttpStatus.OK);
    }


    @PostMapping
    public ResponseEntity<Seller> createSeller(@RequestBody Seller seller) throws SellerException, MessagingException {
        Seller savedSeller = sellerService.createSeller(seller);

        String otp = OtpUtils.generateOTP();
        VerificationCode verificationCode = verificationService.createVerificationCode(otp, seller.getEmail());

        String subject = "ShopSphere Email Verification Code";
        String text = "Welcome to ShopSphere, verify your account using this link ";
        String frontend_url = frontendPath("/verify-seller/");
        emailService.sendVerificationOtpEmail(seller.getEmail(), verificationCode.getOtp(), subject, text + frontend_url);
        return new ResponseEntity<>(savedSeller, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Seller> getSellerById(@PathVariable Long id) throws SellerException {
        Seller seller = sellerService.getSellerById(id);
        return new ResponseEntity<>(seller, HttpStatus.OK);
    }

    @GetMapping("/profile")
    public ResponseEntity<Seller> getSellerByJwt(
            @RequestHeader("Authorization") String jwt) throws SellerException {
        if (!jwtProvider.getAuthoritiesFromJwtToken(jwt).contains("ROLE_SELLER")) {
            return ResponseEntity.noContent().build();
        }
        String email = jwtProvider.getEmailFromJwtToken(jwt);
        Seller seller = sellerService.getSellerByEmail(email);
        return new ResponseEntity<>(seller, HttpStatus.OK);
    }

    @GetMapping("/report")
    public ResponseEntity<SellerReport> getSellerReport(
            @RequestHeader("Authorization") String jwt) throws SellerException {
        String email = jwtProvider.getEmailFromJwtToken(jwt);
        Seller seller = sellerService.getSellerByEmail(email);
        SellerReport report = sellerReportService.getSellerReport(seller);
        return new ResponseEntity<>(report, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<Seller>> getAllSellers(
            @RequestParam(required = false) AccountStatus status) {
        List<Seller> sellers = sellerService.getAllSellers(status);
        return ResponseEntity.ok(sellers);
    }

    @PatchMapping()
    public ResponseEntity<Seller> updateSeller(
            @RequestHeader("Authorization") String jwt, @RequestBody Seller seller) throws SellerException {

        Seller profile = sellerService.getSellerProfile(jwt);
        Seller updatedSeller = sellerService.updateSeller(profile.getId(), seller);
        return ResponseEntity.ok(updatedSeller);

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSeller(@PathVariable Long id) throws SellerException {

        sellerService.deleteSeller(id);
        return ResponseEntity.noContent().build();

    }
}
