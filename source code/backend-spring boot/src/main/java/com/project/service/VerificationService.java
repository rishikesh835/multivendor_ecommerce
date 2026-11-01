package com.project.service;

import com.project.model.VerificationCode;

public interface VerificationService {

    VerificationCode createVerificationCode(String otp, String email);
}
