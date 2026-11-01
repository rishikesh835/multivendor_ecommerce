package com.project.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.model.Order;

public interface OrderRepository extends JpaRepository<Order,Long> {

    List<Order>findByUserId(Long userId);
    List<Order> findBySellerIdOrderByOrderDateDesc(Long sellerId);
    List<Order> findBySellerIdAndOrderDateBetween(Long sellerId,LocalDateTime startDate, LocalDateTime endDate);

}
