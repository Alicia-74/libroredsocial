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

    /**
     * Obtiene un usuario por su ID.
     * @param id ID del usuario
     * @return Optional con el usuario si existe
     */
    @Override
    public Optional<User> getUserById(Integer id) {
        return userRepository.findById(id);
    }

    /**
     * Obtiene un DTO del usuario por su ID, incluyendo listas de seguidores y seguidos.
     * @param id ID del usuario
     * @return UserDTO con datos del usuario y relaciones básicas
     */
    @Override
    public UserDTO getUserDtoById(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));
        
        // Convertir seguidores (usuarios que siguen al usuario actual) a UserDTO para evitar ciclos
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
                            null, null // No incluir relaciones para evitar referencias circulares
                    );
                })
                .collect(Collectors.toList());
        
        // Convertir seguidos (usuarios que el usuario actual sigue) a UserDTO
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
                            null, null // Evitar ciclos de referencia
                    );
                })
                .collect(Collectors.toList());
        
        // Retorna el DTO completo del usuario con seguidores y seguidos
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

    /**
     * Actualiza un usuario existente con los datos proporcionados.
     * @param id ID del usuario a actualizar
     * @param updatedUser Objeto User con datos nuevos
     * @return Usuario actualizado
     */
    @Override
    public User updateUser(Integer id, User updatedUser) {
        Optional<User> existingUser = userRepository.findById(id);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setUsername(updatedUser.getUsername());
            user.setEmail(updatedUser.getEmail());
            user.setImageUrl(updatedUser.getImageUrl());
            user.setDescription(updatedUser.getDescription());
            // Si el tema es nulo, se asigna "light" por defecto
            user.setTheme(updatedUser.getTheme() == null ? "light" : updatedUser.getTheme());
            user.setPassword(updatedUser.getPassword());
            return userRepository.save(user);
        }
        throw new RuntimeException("Usuario no encontrado.");
    }

    /**
     * Elimina un usuario por su ID.
     * @param id ID del usuario a eliminar
     */
    @Override
    public void deleteUser(Integer id) {
        userRepository.deleteById(id);
    }

    /**
     * Guarda un nuevo usuario o actualiza uno existente.
     * @param user Usuario a guardar
     * @return Usuario guardado
     */
    @Override
    public User save(User user) {
        return userRepository.save(user);
    }

    /**
     * Obtiene una lista de todos los usuarios en formato DTO.
     * Omite el email para mayor seguridad.
     * @return Lista de UserDTO
     */
    @Override
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> {
                    // Convertir seguidores a DTO sin email
                    List<UserDTO> followers = user.getFollowers().stream()
                            .map(f -> new UserDTO(
                                    f.getFollower().getId(),
                                    f.getFollower().getUsername(),
                                    null, // Email omitido por seguridad
                                    f.getFollower().getImageUrl(),
                                    f.getFollower().getDescription(),
                                    f.getFollower().getTheme(),
                                    f.getFollower().getCreatedAt(),
                                    null, null
                            ))
                            .collect(Collectors.toList());
                    
                    // Convertir seguidos a DTO sin email
                    List<UserDTO> following = user.getFollowing().stream()
                            .map(f -> new UserDTO(
                                    f.getFollowing().getId(),
                                    f.getFollowing().getUsername(),
                                    null, // Email omitido
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
                            null, // Email omitido
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

    /**
     * Simula la generación y guardado de un identificador para una imagen de perfil.
     * @param file Archivo de imagen recibido
     * @return UUID generado como String
     */
    @Override
    public String saveProfilePicture(MultipartFile file) {
        try {
            // Por ahora, solo genera un UUID, no guarda realmente la imagen
            return UUID.randomUUID().toString();
        } catch (Exception e) {
            throw new RuntimeException("Error al procesar la imagen");
        }
    }

    /**
     * Sube la imagen de perfil codificada en base64 y la guarda en el usuario.
     * @param userId ID del usuario
     * @param file Imagen a subir
     * @return URL base64 con prefijo del tipo MIME
     * @throws Exception si ocurre error leyendo la imagen o buscando usuario
     */
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

    /**
     * Elimina la imagen de perfil del usuario.
     * @param userId ID del usuario
     */
    @Override
    public void deleteProfilePicture(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        user.setImageUrl(null);
        userRepository.save(user);
    }

    /**
     * Actualiza el tema de interfaz (light/dark) del usuario.
     * @param userId ID del usuario
     * @param theme Tema a aplicar ("light" o "dark")
     */
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

    /**
     * Obtiene el tema actual del usuario, devolviendo "light" si no está definido o si no existe el usuario.
     * @param userId ID del usuario
     * @return Tema como String ("light" o "dark")
     */
    @Override
    public String getUserTheme(Integer userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            // Si el tema es null, devolver "light" por defecto
            return userOptional.get().getTheme();
        }
        // Usuario no encontrado: tema por defecto "light"
        return "light";
    }
}
