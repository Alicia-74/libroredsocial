package com.vedruna.libroredsocial.services;

import com.vedruna.libroredsocial.dto.UserDTO;
import com.vedruna.libroredsocial.persistance.model.User;

import java.util.List;
import java.util.Optional;

import org.springframework.web.multipart.MultipartFile;

public interface UserServiceI {

    Optional<User> getUserById(Integer id);
    
    User updateUser(Integer id, User updatedUser);
    
    void deleteUser(Integer id);

    User save(User user);

    List<UserDTO> getAllUsers();
    
    String saveProfilePicture(MultipartFile file);

    String uploadProfileImage(Integer userId, MultipartFile file) throws Exception;

    void deleteProfilePicture(Integer userId);
}
