package com.project.service;


import com.project.exception.WishlistNotFoundException;
import com.project.model.Product;
import com.project.model.User;
import com.project.model.Wishlist;

public interface WishlistService {

    Wishlist createWishlist(User user);

    Wishlist getWishlistByUserId(User user);

    Wishlist addProductToWishlist(User user, Product product) throws WishlistNotFoundException;

}

