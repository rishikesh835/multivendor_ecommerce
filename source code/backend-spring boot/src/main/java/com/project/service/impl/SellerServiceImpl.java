package com.project.service.impl;

import com.project.config.JwtProvider;
import com.project.domain.AccountStatus;
import com.project.domain.USER_ROLE;
import com.project.exception.SellerException;
import com.project.model.Address;
import com.project.model.Seller;
import com.project.repository.AddressRepository;
import com.project.repository.SellerRepository;
import com.project.response.AuthResponse;
import com.project.service.GoogleIdentityService;
import com.project.service.SellerService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SellerServiceImpl implements SellerService {

    private final SellerRepository sellerRepository;
    private final AddressRepository addressRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final GoogleIdentityService googleIdentityService;
    private final CustomeUserServiceImplementation customUserDetails;


    @Override
    public Seller getSellerProfile(String jwt) throws SellerException {
        String email = jwtProvider.getEmailFromJwtToken(jwt);
        return this.getSellerByEmail(email);
    }

    @Override
    public Seller createSeller(Seller seller) throws SellerException {
        Seller sellerExist = sellerRepository.findByEmail(seller.getEmail());
        if (sellerExist != null) {
            throw new SellerException("Seller already exists used different email");
        }

        Address savedAddress = addressRepository.save(seller.getPickupAddress());


        Seller newSeller = new Seller();
        newSeller.setEmail(seller.getEmail());
        newSeller.setPickupAddress(savedAddress);
        newSeller.setSellerName(seller.getSellerName());
        newSeller.setGSTIN(seller.getGSTIN());
        newSeller.setRole(USER_ROLE.ROLE_SELLER);
        newSeller.setMobile(seller.getMobile());

        newSeller.setPassword(passwordEncoder.encode(seller.getPassword()));
        newSeller.setBankDetails(seller.getBankDetails());
        newSeller.setBusinessDetails(seller.getBusinessDetails());

        System.out.println(newSeller);
        return sellerRepository.save(newSeller);
    }

    @Override
    public Seller getSellerById(Long id) throws SellerException {
        Optional<Seller> optionalSeller = sellerRepository.findById(id);
        if (optionalSeller.isPresent()) {
            return optionalSeller.get();
        }
        throw new SellerException("Seller not found");
    }

    @Override
    public Seller getSellerByEmail(String email) throws SellerException {
        Seller seller = sellerRepository.findByEmail(email);
        if (seller != null) {
            return seller;
        }
        throw new SellerException("Seller not found");
    }

    @Override
    public List<Seller> getAllSellers(AccountStatus status) {
        return sellerRepository.findByAccountStatus(status);
    }

    @Override
    public Seller updateSeller(Long id, Seller seller) throws SellerException {
        Seller existingSeller = sellerRepository.findById(id)
                .orElseThrow(() ->
                        new SellerException("Seller not found with id " + id));


        if (seller.getSellerName() != null) {
            existingSeller.setSellerName(seller.getSellerName());
        }
        if (seller.getMobile() != null) {
            existingSeller.setMobile(seller.getMobile());
        }
        if (seller.getEmail() != null) {
            existingSeller.setEmail(seller.getEmail());
        }

        if (seller.getBusinessDetails() != null
                && seller.getBusinessDetails().getBusinessName() != null
        ) {
            if (existingSeller.getBusinessDetails() == null) {
                existingSeller.setBusinessDetails(new com.project.model.BusinessDetails());
            }
            existingSeller.getBusinessDetails().setBusinessName(
                    seller.getBusinessDetails().getBusinessName()
            );
        }

        if (seller.getBankDetails() != null
                && seller.getBankDetails().getAccountHolderName() != null
                && seller.getBankDetails().getIfscCode() != null
                && seller.getBankDetails().getAccountNumber() != null
        ) {
            if (existingSeller.getBankDetails() == null) {
                existingSeller.setBankDetails(new com.project.model.BankDetails());
            }
            existingSeller.getBankDetails().setAccountHolderName(
                    seller.getBankDetails().getAccountHolderName()
            );
            existingSeller.getBankDetails().setAccountNumber(
                    seller.getBankDetails().getAccountNumber()
            );
            existingSeller.getBankDetails().setIfscCode(
                    seller.getBankDetails().getIfscCode()
            );
        }
        if (seller.getPickupAddress() != null
                && seller.getPickupAddress().getAddress() != null
                && seller.getPickupAddress().getMobile() != null
                && seller.getPickupAddress().getCity() != null
                && seller.getPickupAddress().getState() != null
        ) {
            if (existingSeller.getPickupAddress() == null) {
                existingSeller.setPickupAddress(new Address());
            }
            existingSeller.getPickupAddress()
                    .setAddress(seller.getPickupAddress().getAddress());
            existingSeller.getPickupAddress().setCity(seller.getPickupAddress().getCity());
            existingSeller.getPickupAddress().setState(seller.getPickupAddress().getState());
            existingSeller.getPickupAddress().setMobile(seller.getPickupAddress().getMobile());
            existingSeller.getPickupAddress().setPinCode(seller.getPickupAddress().getPinCode());
            existingSeller.getPickupAddress().setName(seller.getPickupAddress().getName());
            existingSeller.getPickupAddress().setLocality(seller.getPickupAddress().getLocality());
        }
        if (seller.getPassword() != null && !seller.getPassword().isBlank()) {
            existingSeller.setPassword(passwordEncoder.encode(seller.getPassword()));
        }
        if (seller.getGSTIN() != null) {
            existingSeller.setGSTIN(seller.getGSTIN());
        }


        return sellerRepository.save(existingSeller);

    }

    @Override
    public void deleteSeller(Long id) throws SellerException {
        if (sellerRepository.existsById(id)) {
            sellerRepository.deleteById(id);
        } else {
            throw new SellerException("Seller not found with id " + id);
        }
    }

    @Override
    public Seller verifyEmail(String email, String otp) throws SellerException {
        Seller seller = this.getSellerByEmail(email);
        seller.setEmailVerified(true);
        return sellerRepository.save(seller);
    }

    @Override
    public Seller updateSellerAccountStatus(Long sellerId, AccountStatus status) throws SellerException {
        Seller seller = this.getSellerById(sellerId);
        seller.setAccountStatus(status);
        return sellerRepository.save(seller);
    }

    @Override
    public AuthResponse signinWithGoogle(String credential, String mode) throws SellerException {
        GoogleIdentityService.GoogleAccount account = googleIdentityService.verify(credential);
        Seller seller = sellerRepository.findByEmail(account.email());
        boolean registering = "register".equalsIgnoreCase(mode);

        if (registering) {
            if (seller != null) {
                throw new SellerException("A seller account already exists for this email. Log in instead.");
            }
            seller = createGoogleSeller(account);
        } else if (seller == null) {
            throw new SellerException("This account is not a seller");
        }

        UserDetails userDetails = customUserDetails.loadUserByUsername("seller_" + seller.getEmail());
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());

        AuthResponse authResponse = new AuthResponse();
        authResponse.setMessage("Login Success");
        authResponse.setJwt(jwtProvider.generateToken(authentication));
        authResponse.setRole(USER_ROLE.ROLE_SELLER);
        authResponse.setProfileComplete(!registering && isOnboardingComplete(seller));
        return authResponse;
    }

    private Seller createGoogleSeller(GoogleIdentityService.GoogleAccount account) {
        Seller seller = new Seller();
        seller.setEmail(account.email());
        seller.setSellerName(account.name());
        seller.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        seller.setRole(USER_ROLE.ROLE_SELLER);
        seller.setEmailVerified(true);
        seller.setAccountStatus(AccountStatus.PENDING_VERIFICATION);
        seller.setPickupAddress(new Address());
        seller.setBusinessDetails(new com.project.model.BusinessDetails());
        seller.setBankDetails(new com.project.model.BankDetails());
        return sellerRepository.save(seller);
    }

    private boolean isOnboardingComplete(Seller seller) {
        return filled(seller.getSellerName())
                && filled(seller.getMobile())
                && filled(seller.getGSTIN())
                && seller.getPickupAddress() != null
                && filled(seller.getPickupAddress().getAddress())
                && filled(seller.getPickupAddress().getCity())
                && seller.getBankDetails() != null
                && filled(seller.getBankDetails().getAccountNumber())
                && filled(seller.getBankDetails().getIfscCode())
                && filled(seller.getBankDetails().getAccountHolderName())
                && seller.getBusinessDetails() != null
                && filled(seller.getBusinessDetails().getBusinessName());
    }

    private boolean filled(String value) {
        return value != null && !value.isBlank();
    }
}
