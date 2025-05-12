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

    // Obtener todos los usuarios con sus seguidores y seguidos completos
    @Override
    public List<UserDTO> getAllUsers() {
        // Obtener todas las entidades User
        List<User> users = userRepository.findAll();
    
        // Convertir las entidades User a UserDTO con seguidores y seguidos completos
        return users.stream()
                .map(user -> new UserDTO(
                        user.getId(),
                        user.getUsername(),
                        user.getEmail(),
                        user.getImageUrl(),
                        user.getDescription(),
                        user.getTheme(),
                        // Convertir los seguidores a UserDTO completos
                        user.getFollowers().stream()
                                .map(f -> new UserDTO(
                                        f.getFollower().getId(),
                                        f.getFollower().getUsername(),
                                        f.getFollower().getEmail(),
                                        f.getFollower().getImageUrl(),
                                        f.getFollower().getDescription(),
                                        f.getFollower().getTheme(),
                                        null, null // Evitar ciclos infinitos
                                ))
                                .collect(Collectors.toList()),
                        // Convertir los seguidos a UserDTO completos
                        user.getFollowing().stream()
                                .map(f -> new UserDTO(
                                        f.getFollowing().getId(),
                                        f.getFollowing().getUsername(),
                                        f.getFollowing().getEmail(),
                                        f.getFollowing().getImageUrl(),
                                        f.getFollowing().getDescription(),
                                        f.getFollowing().getTheme(),
                                        null, null // Evitar ciclos infinitos
                                ))
                                .collect(Collectors.toList())
                ))
                .collect(Collectors.toList());
    }
    

    
        // Método para guardar la imagen como Base64 en la base de datos
        @Override
    public String saveProfilePicture(MultipartFile file) {
        try {
            // Generar un nombre único para la imagen
            String fileName = UUID.randomUUID().toString();
            
            // Guardar solo el nombre del archivo (no los datos de la imagen)
            return fileName;
        } catch (Exception e) {
            throw new RuntimeException("Error al procesar la imagen");
        }
    }

    
        // Método para actualizar la imagen de perfil
    @Override
    public String uploadProfileImage(Integer userId, MultipartFile file) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + userId));
    
        // Convertir la imagen a Base64
        byte[] imageBytes = file.getBytes();
        String base64Image = Base64.getEncoder().encodeToString(imageBytes);
        
        // Guardar la imagen en la base de datos con el prefijo "data:image/jpeg;base64,"
        String imageWithPrefix = "data:" + file.getContentType() + ";base64," + base64Image;
        user.setImageUrl(imageWithPrefix);
    
        userRepository.save(user);
        
        return imageWithPrefix; // Retornar la cadena base64
    }
    
    
        // Método para eliminar la imagen de perfil
        @Override
        public void deleteProfilePicture(Integer userId) {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            user.setImageUrl(null);
            userRepository.save(user);
        }
}

