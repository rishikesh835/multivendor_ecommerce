package com.project.service.impl;

import com.project.model.Seller;
import com.project.model.SellerReport;
import com.project.repository.SellerReportRepository;
import com.project.service.SellerReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SellerReportServiceImpl implements SellerReportService {

    private final SellerReportRepository sellerReportRepository;


    @Override
    public SellerReport getSellerReport(Seller seller) {
        SellerReport report = sellerReportRepository.findBySellerId(seller.getId());
        if(report == null){
            SellerReport newReport = new SellerReport();
            newReport.setSeller(seller);
            return sellerReportRepository.save(newReport);
        }
        return report;
    }


    @Override
    public SellerReport updateSellerReport(SellerReport sellerReport) {

        return sellerReportRepository.save(sellerReport);
    }

}
