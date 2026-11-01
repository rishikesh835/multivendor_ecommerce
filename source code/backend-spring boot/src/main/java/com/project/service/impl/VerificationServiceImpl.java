package com.project.service.impl;

import com.project.model.VerificationCode;
import com.project.repository.VerificationCodeRepository;
import com.project.service.VerificationService;
import org.springframework.stereotype.Service;

@Service
public class VerificationServiceImpl implements VerificationService {

    private final VerificationCodeRepository verificationCodeRepository;

    VerificationServiceImpl(VerificationCodeRepository verificationCodeRepository){

        this.verificationCodeRepository = verificationCodeRepository;
    }

    @Override
    public VerificationCode createVerificationCode(String otp,String email) {
        VerificationCode isExist=verificationCodeRepository.findByEmail(email);

        if(isExist!=null) {
            verificationCodeRepository.delete(isExist);
        }

        VerificationCode verificationCode=new VerificationCode();
        verificationCode.setOtp(otp);
        verificationCode.setEmail(email);

        return verificationCodeRepository.save(verificationCode);

    }
}
