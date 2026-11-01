package com.project.config;

import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtProvider {

	private final SecretKey key;

	public JwtProvider(@Value("${jwt.secret}") String secret) {
		this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
	}
	
	public String generateToken(Authentication auth) {
		Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
	    String roles = populateAuthorities(authorities);

		String jwt=Jwts.builder()
				.setIssuedAt(new Date())
				.setExpiration(new Date(new Date().getTime()+86400000))
				.claim("email",auth.getName())
				.claim("authorities", roles)
				.signWith(key)
				.compact();
		return jwt;
		
	}
	
	public String getEmailFromJwtToken(String jwt) {
		return String.valueOf(claims(jwt).get("email"));
	}

	public String getAuthoritiesFromJwtToken(String jwt) {
		Object authorities = claims(jwt).get("authorities");
		return authorities == null ? "" : String.valueOf(authorities);
	}

	private Claims claims(String jwt) {
		if (jwt != null && jwt.startsWith("Bearer ")) {
			jwt = jwt.substring(7);
		}
		return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(jwt).getBody();
	}
	
	public String populateAuthorities(Collection<? extends GrantedAuthority> collection) {
		Set<String> auths=new HashSet<>();
		
		for(GrantedAuthority authority:collection) {
			auths.add(authority.getAuthority());
		}
		return String.join(",",auths);
	}

}
