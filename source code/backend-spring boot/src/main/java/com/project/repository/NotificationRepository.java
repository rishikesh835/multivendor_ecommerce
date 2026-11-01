package com.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.model.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {



}
