package com.project.repository;

import com.project.model.HomeCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HomeCategoryRepository extends JpaRepository<HomeCategory,Long> {
}
