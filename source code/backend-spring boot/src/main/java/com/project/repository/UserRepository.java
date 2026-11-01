package com.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.model.User;

public interface UserRepository extends JpaRepository<User, Long> {

	
	public User findByEmail(String username);

}
