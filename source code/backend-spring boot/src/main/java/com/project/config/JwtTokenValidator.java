package com.project.config;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

import javax.crypto.SecretKey;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class JwtTokenValidator extends OncePerRequestFilter {

	private static final String BEARER_PREFIX = "Bearer ";
	private final SecretKey key;
	private final String headerName;

	public JwtTokenValidator(String secret, String headerName) {
		this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
		this.headerName = headerName;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		String header = request.getHeader(headerName);
		String jwt = extractToken(header);

		if (jwt != null) {
			try {
				Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(jwt).getBody();

				String email = String.valueOf(claims.get("email"));
				String authorities = String.valueOf(claims.get("authorities"));

				List<GrantedAuthority> auths = AuthorityUtils.commaSeparatedStringToAuthorityList(authorities);
				Authentication authentication = new UsernamePasswordAuthenticationToken(email, null, auths);

				SecurityContextHolder.getContext().setAuthentication(authentication);

			} catch (Exception e) {
				// Expired or malformed tokens must not abort the filter chain.
				// Protected routes still fail later with 401.
				SecurityContextHolder.clearContext();
			}
		}
		filterChain.doFilter(request, response);
	}

	private String extractToken(String header) {
		if (header == null || !header.startsWith(BEARER_PREFIX)) {
			return null;
		}
		String jwt = header.substring(BEARER_PREFIX.length()).trim();
		if (jwt.isEmpty() || "null".equals(jwt) || "undefined".equals(jwt)) {
			return null;
		}
		return jwt;
	}

}
