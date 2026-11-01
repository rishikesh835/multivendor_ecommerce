package com.project.service;

import com.project.exception.UserException;
import com.project.model.User;

public interface UserService {

	public User findUserProfileByJwt(String jwt) throws UserException;
	
	public User findUserByEmail(String email) throws UserException;


}
