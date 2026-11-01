package com.project.service;

import com.project.model.Order;
import com.project.model.Seller;
import com.project.model.Transaction;

import java.util.List;

public interface TransactionService {

    Transaction createTransaction(Order order);
    List<Transaction> getTransactionBySeller(Seller seller);
    List<Transaction>getAllTransactions();
}
