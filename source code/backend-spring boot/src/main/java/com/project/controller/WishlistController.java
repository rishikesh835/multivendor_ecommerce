package com.project.controller;

import com.project.exception.ProductException;
import com.project.exception.UserException;
import com.project.exception.WishlistNotFoundException;
import com.project.model.Product;
import com.project.model.User;
import com.project.model.Wishlist;
import com.project.service.ProductService;
import com.project.service.UserService;
import com.project.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;
    private final ProductService productService;
    private final UserService userService;


    @PostMapping("/create")
    public ResponseEntity<Wishlist> createWishlist(@RequestBody User user) {
        Wishlist wishlist = wishlistService.createWishlist(user);
        return ResponseEntity.ok(wishlist);
    }

    @GetMapping()
    public ResponseEntity<Wishlist> getWishlistByUserId(
            @RequestHeader("Authorization") String jwt) throws UserException {

        User user = userService.findUserProfileByJwt(jwt);
        Wishlist wishlist = wishlistService.getWishlistByUserId(user);
        return ResponseEntity.ok(wishlist);
    }

    @PostMapping("/add-product/{productId}")
    public ResponseEntity<Wishlist> addProductToWishlist(
            @PathVariable Long productId,
            @RequestHeader("Authorization") String jwt) throws WishlistNotFoundException, ProductException, UserException {

        Product product = productService.findProductById(productId);
        User user=userService.findUserProfileByJwt(jwt);
        Wishlist updatedWishlist = wishlistService.addProductToWishlist(
                user,
                product
        );
        return ResponseEntity.ok(updatedWishlist);

    }

}



