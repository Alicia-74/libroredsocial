package com.vedruna.libroredsocial.services.Impl;

import com.vedruna.libroredsocial.dto.UserDTO;
import com.vedruna.libroredsocial.persistance.model.User;
import com.vedruna.libroredsocial.persistance.repository.UserRepository;
import com.vedruna.libroredsocial.services.UserServiceI;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserServiceI {

    @Autowired
    private UserRepository userRepository;


    @Override
    public Optional<User> getUserById(Integer id) {
        return userRepository.findById(id);
    }

    @Override
    public User updateUser(Integer id, User updatedUser) {
        Optional<User> existingUser = userRepository.findById(id);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setUsername(updatedUser.getUsername());
            user.setEmail(updatedUser.getEmail());
            user.setImageUrl(updatedUser.getImageUrl());
            user.setDescription(updatedUser.getDescription());
            user.setTheme(updatedUser.getTheme());
            user.setPassword(updatedUser.getPassword());
            return userRepository.save(user);
        }
        throw new RuntimeException("Usuario no encontrado.");
    }

    @Override
    public void deleteUser(Integer id) {
        userRepository.deleteById(id);
    }

    
    // Guardar un usuario
    @Override
    public User save(User user) {
        return userRepository.save(user);
    }

   // Obtener todos los usuarios
    @Override
    public List<UserDTO> getAllUsers() {
        // Obtener todas las entidades User
        List<User> users = userRepository.findAll();

        // Convertir las entidades User a UserDTO
        return users.stream()
                .map(user -> new UserDTO(
                    user.getId(), 
                    user.getUsername(), 
                    user.getEmail(), 
                    user.getImageUrl(),
                    user.getDescription(), 
                    user.getTheme()))
                .collect(Collectors.toList());
    }


    // Guardar la imagen de perfil y devolver la URL
    @Override
    public String saveProfilePicture(MultipartFile file) {
        try {
            String fileName = System.currentTimeMillis() + "-" + file.getOriginalFilename();
            Path filePath = Paths.get("uploads/profile-pictures", fileName);
            Files.createDirectories(filePath.getParent());
            file.transferTo(filePath.toFile());

            // Devolver la URL de la imagen guardada
            return "/uploads/profile-pictures/" + fileName;
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al guardar la imagen de perfil.");
        }
    }

    // Eliminar la imagen de perfil del almacenamiento
    // Eliminar la imagen de perfil del almacenamiento
    @Override
    public void deleteProfilePicture(Integer userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setImageUrl(null);
            userRepository.save(user);
        });
    }
}

