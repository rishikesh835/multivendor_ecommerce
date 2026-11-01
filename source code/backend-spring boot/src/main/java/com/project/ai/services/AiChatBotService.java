package com.project.ai.services;

import com.project.exception.ProductException;
import com.project.response.ApiResponse;

public interface AiChatBotService {

    ApiResponse aiChatBot(String prompt,Long productId,Long userId) throws ProductException;
}
