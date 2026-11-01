package com.project.service;


import com.project.domain.AccountStatus;
import com.project.domain.USER_ROLE;
import com.project.model.User;
import com.project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializationComponent implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Value("${app.admin.full-name}")
    private String adminFullName;



    @Override
    public void run(String... args) {
        for (User user : userRepository.findAll()) {
            if (user.getStatus() == null) {
                user.setStatus(AccountStatus.ACTIVE);
                userRepository.save(user);
            }
        }
        initializeAdminUser();
    }

    private void initializeAdminUser() {
        if (userRepository.findByEmail(adminEmail)==null) {
            User adminUser = new User();

            adminUser.setPassword(passwordEncoder.encode(adminPassword));
            adminUser.setFullName(adminFullName);
            adminUser.setEmail(adminEmail);
            adminUser.setRole(USER_ROLE.ROLE_ADMIN);
            adminUser.setStatus(AccountStatus.ACTIVE);

            User admin=userRepository.save(adminUser);
        }
    }

}