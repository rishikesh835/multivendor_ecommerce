package com.project.exception;

public class CategoryNotFoundException extends Exception {
    public CategoryNotFoundException(String categoryNotFound) {
        super(categoryNotFound);
    }
}
