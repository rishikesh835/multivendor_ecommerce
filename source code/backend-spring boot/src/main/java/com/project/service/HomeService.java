package com.project.service;

import com.project.model.Home;
import com.project.model.HomeCategory;

import java.util.List;

public interface HomeService {

    Home creatHomePageData(List<HomeCategory> categories);

}
