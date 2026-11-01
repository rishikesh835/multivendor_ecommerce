package com.project.response;

import com.project.dto.OrderHistory;
import com.project.model.Cart;
import com.project.model.Product;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FunctionResponse {
    private String functionName;
    private Cart userCart;
    private OrderHistory orderHistory;
    private Product product;
}
