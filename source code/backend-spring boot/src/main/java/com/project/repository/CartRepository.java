package com.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.model.Cart;

public interface CartRepository extends JpaRepository<Cart, Long> {

	 Cart findByUserId(Long userId);
}
