package com.project.service;

import com.project.exception.SellerException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GoogleIdentityService {

    private final RestTemplate restTemplate;

    @Value("${app.google.client-id:}")
    private String googleClientId;

    public String clientId() {
        return googleClientId == null ? "" : googleClientId.trim();
    }

    public GoogleAccount verify(String credential) throws SellerException {
        if (clientId().isEmpty()) {
            throw new SellerException("Google sign-in is not configured");
        }
        if (credential == null || credential.isBlank()) {
            throw new SellerException("Google sign-in failed");
        }

        Map<String, Object> payload = verifyIdToken(credential);
        String email = stringClaim(payload, "email");
        if (email == null || email.isBlank()) {
            throw new SellerException("Google account has no email");
        }
        if (!isVerified(payload.get("email_verified"))) {
            throw new SellerException("Google email is not verified");
        }
        if (!clientId().equals(stringClaim(payload, "aud"))) {
            throw new SellerException("Google sign-in failed");
        }
        String issuer = stringClaim(payload, "iss");
        if (!"accounts.google.com".equals(issuer) && !"https://accounts.google.com".equals(issuer)) {
            throw new SellerException("Google sign-in failed");
        }

        String name = stringClaim(payload, "name");
        return new GoogleAccount(email, name == null || name.isBlank() ? email : name);
    }

    private Map<String, Object> verifyIdToken(String credential) throws SellerException {
        try {
            String url = "https://oauth2.googleapis.com/tokeninfo?id_token="
                    + URLEncoder.encode(credential, StandardCharsets.UTF_8);
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    URI.create(url),
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<>() {});
            if (response.getBody() == null) {
                throw new SellerException("Google sign-in failed");
            }
            return response.getBody();
        } catch (SellerException ex) {
            throw ex;
        } catch (RestClientException ex) {
            throw new SellerException("Google sign-in failed");
        }
    }

    private String stringClaim(Map<String, Object> payload, String key) {
        Object value = payload.get(key);
        return value == null ? null : String.valueOf(value);
    }

    private boolean isVerified(Object value) {
        return Boolean.TRUE.equals(value) || "true".equalsIgnoreCase(String.valueOf(value));
    }

    public record GoogleAccount(String email, String name) {
    }
}
