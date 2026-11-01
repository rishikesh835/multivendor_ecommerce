package com.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.model.PasswordResetToken;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Integer> {
	PasswordResetToken findByToken(String token);
}
