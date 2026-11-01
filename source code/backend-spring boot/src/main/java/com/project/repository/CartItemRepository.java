package com.project.repository;

import com.project.model.Cart;
import com.project.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import com.project.model.CartItem;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {


    CartItem findByCartAndProductAndSize(Cart cart, Product product, String size);


}
