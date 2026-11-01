package com.project.service;

import com.project.exception.ProductException;
import com.project.model.Cart;
import com.project.model.CartItem;
import com.project.model.Product;
import com.project.model.User;

public interface CartService {
	
	public CartItem addCartItem(User user,
								Product product,
								String size,
								int quantity) throws ProductException;
	
	public Cart findUserCart(User user);

}
