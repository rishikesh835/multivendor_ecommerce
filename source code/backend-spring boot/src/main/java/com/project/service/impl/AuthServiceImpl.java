package com.project.service.impl;

import com.project.config.JwtProvider;
import com.project.domain.AccountStatus;
import com.project.domain.USER_ROLE;
import com.project.exception.SellerException;
import com.project.exception.UserException;
import com.project.model.Cart;
import com.project.model.User;
import com.project.model.VerificationCode;
import com.project.repository.CartRepository;
import com.project.repository.SellerRepository;
import com.project.repository.UserRepository;
import com.project.repository.VerificationCodeRepository;
import com.project.request.LoginRequest;
import com.project.request.SignupRequest;
import com.project.response.AuthResponse;
import com.project.service.AuthService;
import com.project.service.EmailService;
import com.project.service.GoogleIdentityService;
import com.project.utils.OtpUtils;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final VerificationCodeRepository verificationCodeRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final SellerRepository sellerRepository;

    private final JwtProvider jwtProvider;
    private final CustomeUserServiceImplementation customUserDetails;
    private final CartRepository cartRepository;
    private final GoogleIdentityService googleIdentityService;


    @Override
    public void sentLoginOtp(String email) throws UserException, MessagingException {


        String SIGNING_PREFIX = "signing_";

        if (email.startsWith(SIGNING_PREFIX)) {
            email = email.substring(SIGNING_PREFIX.length());
            if (userRepository.findByEmail(email) == null && sellerRepository.findByEmail(email) == null) {
                throw new UserException("user not exist with email " + email);
            }
        }

        VerificationCode isExist = verificationCodeRepository
                .findByEmail(email);

        if (isExist != null) {
            verificationCodeRepository.delete(isExist);
        }

        String otp = OtpUtils.generateOTP();

        VerificationCode verificationCode = new VerificationCode();
        verificationCode.setOtp(otp);
        verificationCode.setEmail(email);
        verificationCodeRepository.save(verificationCode);

        String subject = "ShopSphere Login/Signup Otp";
        String text = "your login otp is - ";
        emailService.sendVerificationOtpEmail(email, otp, subject, text);
    }

    @Override
    public String createUser(SignupRequest req) throws SellerException {

        String email = req.getEmail();

        String fullName = req.getFullName();

        String otp = req.getOtp();

        VerificationCode verificationCode = verificationCodeRepository.findByEmail(email);

        if (verificationCode == null || !verificationCode.getOtp().equals(otp)) {
            throw new SellerException("wrong otp...");
        }

        User user = userRepository.findByEmail(email);

        String password = req.getPassword();
        if (password == null || password.isBlank() || password.length() < 6) {
            throw new SellerException("password must be at least 6 characters");
        }

        if (user == null) {

            User createdUser = new User();
            createdUser.setEmail(email);
            createdUser.setFullName(fullName);
            createdUser.setRole(USER_ROLE.ROLE_CUSTOMER);
            createdUser.setStatus(AccountStatus.ACTIVE);
            createdUser.setMobile("9083476123");
            createdUser.setPassword(passwordEncoder.encode(password));

            System.out.println(createdUser);

            user = userRepository.save(createdUser);

            Cart cart = new Cart();
            cart.setUser(user);
            cartRepository.save(cart);
        } else {
            requireActive(user);
            user.setPassword(passwordEncoder.encode(password));
            userRepository.save(user);
        }


        List<GrantedAuthority> authorities = new ArrayList<>();

        authorities.add(new SimpleGrantedAuthority(
                USER_ROLE.ROLE_CUSTOMER.toString()));


        Authentication authentication = new UsernamePasswordAuthenticationToken(
                email, null, authorities);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        return jwtProvider.generateToken(authentication);
    }

    @Override
    public AuthResponse signin(LoginRequest req) throws SellerException {

        Authentication authentication = authenticate(req);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = jwtProvider.generateToken(authentication);
        AuthResponse authResponse = new AuthResponse();

        authResponse.setMessage("Login Success");
        authResponse.setJwt(token);
        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();


        String roleName = authorities.isEmpty() ? null : authorities.iterator().next().getAuthority();


        authResponse.setRole(USER_ROLE.valueOf(roleName));

        return authResponse;

    }



    private Authentication authenticate(LoginRequest req) throws SellerException {
        String username = req.getEmail();
        UserDetails userDetails = findAccount(username);
        UserDetails sellerDetails = findAccount("seller_" + username);

        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            if (passwordMatches(userDetails, req.getPassword())) {
                User user = userRepository.findByEmail(username);
                requireActive(user);
                return authentication(userDetails);
            }
            if (passwordMatches(sellerDetails, req.getPassword())) {
                return authentication(sellerDetails);
            }
            throw new SellerException("wrong email or password");
        }

        VerificationCode verificationCode = verificationCodeRepository.findByEmail(username);
        if (verificationCode == null || req.getOtp() == null || !verificationCode.getOtp().equals(req.getOtp())) {
            throw new SellerException("wrong otp...");
        }
        if (userDetails != null) {
            requireActive(userRepository.findByEmail(username));
            return authentication(userDetails);
        }
        if (sellerDetails != null) {
            return authentication(sellerDetails);
        }
        throw new SellerException("wrong email or password");
    }

    private UserDetails findAccount(String username) {
        try {
            return customUserDetails.loadUserByUsername(username);
        } catch (UsernameNotFoundException ex) {
            return null;
        }
    }

    private boolean passwordMatches(UserDetails details, String rawPassword) {
        return details != null
                && details.getPassword() != null
                && passwordEncoder.matches(rawPassword, details.getPassword());
    }

    private Authentication authentication(UserDetails details) {
        return new UsernamePasswordAuthenticationToken(details, null, details.getAuthorities());
    }

    private void requireActive(User user) throws SellerException {
        if (user != null && user.getStatus() != AccountStatus.ACTIVE) {
            throw new SellerException("account is not active");
        }
    }

    @Override
    public String googleClientId() {
        return googleIdentityService.clientId();
    }

    @Override
    public AuthResponse signinWithGoogle(String credential) throws SellerException {
        GoogleIdentityService.GoogleAccount account = googleIdentityService.verify(credential);

        User user = userRepository.findByEmail(account.email());
        if (user == null) {
            UserDetails sellerDetails = findAccount("seller_" + account.email());
            if (sellerDetails != null) {
                Authentication sellerAuth = authentication(sellerDetails);
                SecurityContextHolder.getContext().setAuthentication(sellerAuth);
                AuthResponse sellerResponse = new AuthResponse();
                sellerResponse.setMessage("Login Success");
                sellerResponse.setJwt(jwtProvider.generateToken(sellerAuth));
                sellerResponse.setRole(USER_ROLE.ROLE_SELLER);
                return sellerResponse;
            }

            User createdUser = new User();
            createdUser.setEmail(account.email());
            createdUser.setFullName(account.name());
            createdUser.setRole(USER_ROLE.ROLE_CUSTOMER);
            createdUser.setStatus(AccountStatus.ACTIVE);
            createdUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            user = userRepository.save(createdUser);

            Cart cart = new Cart();
            cart.setUser(user);
            cartRepository.save(cart);
        }

        requireActive(user);
        UserDetails userDetails = customUserDetails.loadUserByUsername(user.getEmail());
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String roleName = userDetails.getAuthorities().isEmpty()
                ? USER_ROLE.ROLE_CUSTOMER.toString()
                : userDetails.getAuthorities().iterator().next().getAuthority();

        AuthResponse authResponse = new AuthResponse();
        authResponse.setMessage("Login Success");
        authResponse.setJwt(jwtProvider.generateToken(authentication));
        authResponse.setRole(USER_ROLE.valueOf(roleName));
        return authResponse;
    }
}
