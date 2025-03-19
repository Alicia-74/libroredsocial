package com.vedruna.libroredsocial.services;

import com.vedruna.libroredsocial.persistance.model.User;

import java.util.List;
import java.util.Optional;

public interface UserServiceI {

    User registerUser(User user);
    
    Optional<User> loginUser(String correo, String contrasena);
    
    Optional<User> getUserById(Integer id);
    
    User updateUser(Integer id, User updatedUser);
    
    void deleteUser(Integer id);

    User save(User user);

    List<User> getAllUsers();
}
