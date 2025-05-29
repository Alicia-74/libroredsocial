package com.vedruna.libroredsocial.services.impl;

import com.vedruna.libroredsocial.dto.UserDTO;
import com.vedruna.libroredsocial.persistance.model.User;
import com.vedruna.libroredsocial.persistance.repository.UserRepository;
import com.vedruna.libroredsocial.services.UserServiceI;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
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
    public UserDTO getUserDtoById(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));
        
        // Convertir seguidores (usuarios que siguen al usuario actual)
        List<UserDTO> followers = user.getFollowers().stream()
                .map(f -> {
                    User follower = f.getFollower();
                    return new UserDTO(
                            follower.getId(),
                            follower.getUsername(),
                            follower.getEmail(),
                            follower.getImageUrl(),
                            follower.getDescription(),
                            follower.getTheme(),
                            follower.getCreatedAt(),
                            null, null // No incluir relaciones para evitar ciclos
                    );
                })
                .collect(Collectors.toList());
        
        // Convertir seguidos (usuarios que el usuario actual sigue)
        List<UserDTO> following = user.getFollowing().stream()
                .map(f -> {
                    User followed = f.getFollowing();
                    return new UserDTO(
                            followed.getId(),
                            followed.getUsername(),
                            followed.getEmail(),
                            followed.getImageUrl(),
                            followed.getDescription(),
                            followed.getTheme(),
                            followed.getCreatedAt(),
                            null, null // No incluir relaciones para evitar ciclos
                    );
                })
                .collect(Collectors.toList());
        
        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getImageUrl(),
                user.getDescription(),
                user.getTheme(),
                user.getCreatedAt(),
                followers,
                following
        );
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
            user.setTheme(updatedUser.getTheme() == null ? "light" : updatedUser.getTheme());
            user.setPassword(updatedUser.getPassword());
            return userRepository.save(user);
        }
        throw new RuntimeException("Usuario no encontrado.");
    }

    @Override
    public void deleteUser(Integer id) {
        userRepository.deleteById(id);
    }

    @Override
    public User save(User user) {
        return userRepository.save(user);
    }

    @Override
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> {
                    List<UserDTO> followers = user.getFollowers().stream()
                            .map(f -> new UserDTO(
                                    f.getFollower().getId(),
                                    f.getFollower().getUsername(),
                                    null, // No incluir email por seguridad
                                    f.getFollower().getImageUrl(),
                                    f.getFollower().getDescription(),
                                    f.getFollower().getTheme(),
                                    f.getFollower().getCreatedAt(),
                                    null, null
                            ))
                            .collect(Collectors.toList());
                    
                    List<UserDTO> following = user.getFollowing().stream()
                            .map(f -> new UserDTO(
                                    f.getFollowing().getId(),
                                    f.getFollowing().getUsername(),
                                    null, // No incluir email por seguridad
                                    f.getFollowing().getImageUrl(),
                                    f.getFollowing().getDescription(),
                                    f.getFollowing().getTheme(),
                                    f.getFollowing().getCreatedAt(),
                                    null, null
                            ))
                            .collect(Collectors.toList());
                    
                    return new UserDTO(
                            user.getId(),
                            user.getUsername(),
                            null, // No incluir email por seguridad
                            user.getImageUrl(),
                            user.getDescription(),
                            user.getTheme(),
                            user.getCreatedAt(),
                            followers,
                            following
                    );
                })
                .collect(Collectors.toList());
    }

    @Override
    public String saveProfilePicture(MultipartFile file) {
        try {
            return UUID.randomUUID().toString();
        } catch (Exception e) {
            throw new RuntimeException("Error al procesar la imagen");
        }
    }

    @Override
    public String uploadProfileImage(Integer userId, MultipartFile file) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + userId));
    
        byte[] imageBytes = file.getBytes();
        String base64Image = Base64.getEncoder().encodeToString(imageBytes);
        String imageWithPrefix = "data:" + file.getContentType() + ";base64," + base64Image;
        user.setImageUrl(imageWithPrefix);
    
        userRepository.save(user);
        return imageWithPrefix;
    }

    @Override
    public void deleteProfilePicture(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        user.setImageUrl(null);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void updateUserTheme(Integer userId, String theme) {
        System.out.println("DEBUG - UserService: Intentando actualizar tema para userId: " + userId + " a tema: " + theme);
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            System.out.println("DEBUG - UserService: Usuario encontrado: " + user.getUsername() + ", Tema actual en BD: " + user.getTheme());
            user.setTheme(theme); // Guarda el String "light" o "dark"
            System.out.println("DEBUG - UserService: Tema establecido en objeto User (en memoria): " + user.getTheme());
            userRepository.save(user);
            System.out.println("DEBUG - UserService: Llamada a userRepository.save() completada.");
        } else {
            throw new RuntimeException("Usuario no encontrado con ID: " + userId);
        }
    }

    @Override
    public String getUserTheme(Integer userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            // Asegura que si el tema es null en BD, devuelva "light"
            return userOptional.get().getTheme();
        }
        // Si el usuario no existe, devuelve "light" por defecto
        return "light";
    }
}