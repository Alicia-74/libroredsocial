package com.vedruna.libroredsocial.controllers;

import com.vedruna.libroredsocial.dto.UserDTO;
import com.vedruna.libroredsocial.persistance.model.User;
import com.vedruna.libroredsocial.persistance.repository.UserRepository;
import com.vedruna.libroredsocial.security.auth.services.JWTServiceI;
import com.vedruna.libroredsocial.services.Impl.UserServiceImpl;

import io.swagger.v3.oas.annotations.parameters.RequestBody;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserServiceImpl userService;

    @Autowired
    private JWTServiceI jwtService; // Inyectamos el servicio de JWT

    // Método GET para obtener un usuario por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Integer id) {
        Optional<User> userOptional = userRepository.findById(id);

        if (!userOptional.isPresent()) {
            return ResponseEntity.status(404).body("Usuario no encontrado.");
        }

        // Convertir la entidad User a UserDTO
        User user = userOptional.get();
        UserDTO userDTO = new UserDTO(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getImageUrl(),
            user.getDescription(),
            user.getTheme()
        );

        return ResponseEntity.ok(userDTO);  // Devolver el DTO
    }

    // Método GET para obtener todos los usuarios
    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers() {
        // Obtener todas las entidades User
        List<User> users = userRepository.findAll();

        // Verificar si la lista está vacía
        if (users.isEmpty()) {
            return ResponseEntity.status(200).body("No hay usuarios registrados.");  // 200 OK aunque esté vacía
        }

        // Convertir las entidades User a UserDTO
        List<UserDTO> userDTOs = users.stream()
                .map(user -> new UserDTO(
                        user.getId(), 
                        user.getUsername(), 
                        user.getEmail(), 
                        user.getImageUrl(),
                        user.getDescription(),
                        user.getTheme()))  // Mapeo de User a UserDTO
                .collect(Collectors.toList());

        return ResponseEntity.ok(userDTOs);  // Devolver la lista de UserDTO
    }

    // Método GET para buscar los usuarios
    @GetMapping("/search/{username}")
    public ResponseEntity<?> searchUsersByPrefix(@PathVariable String username) {
        // Buscar usuarios que empiecen con el prefijo de username
        List<User> users = userRepository.findByUsernameStartingWithIgnoreCase(username);
    
        // Si no se encuentran usuarios, retornar un 404
        if (users.isEmpty()) {
            return ResponseEntity.status(404).body("No se encontraron usuarios.");
        }
    
        // Convertir la lista de User a UserDTO
        List<UserDTO> userDTOs = users.stream()
                .map(user -> new UserDTO(
                    user.getId(),
                    user.getUsername(), 
                    user.getEmail(),
                    user.getImageUrl(),
                    user.getDescription(),
                    user.getTheme()))  // Aquí se crea el DTO
                .toList();
    
        // Retornar los DTOs en la respuesta
        return ResponseEntity.ok(userDTOs);
    }


    // Método GET para obtener los detalles del usuario actual a partir del token
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Token no proporcionado o formato incorrecto");
        }

        token = token.substring(7); // Eliminar "Bearer " del token

        String username;
        try {
            // Extraemos el nombre de usuario del token utilizando el método getUsernameFromToken
            username = jwtService.getUsernameFromToken(token); // Obtener email o username desde el token
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Token inválido o expirado");
        }

        // Buscar al usuario en la base de datos utilizando el nombre de usuario (o correo electrónico)
        Optional<User> userOptional = userRepository.findByEmail(username); // O usa findByEmail si usas correo electrónico

        if (userOptional.isPresent()) {
            return ResponseEntity.ok(userOptional.get());  // Devuelve la información del usuario si lo encuentra
        } else {
            return ResponseEntity.status(404).body("Usuario no encontrado");  // Si no se encuentra el usuario
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUserDescription(@PathVariable Integer id, @RequestBody UserDTO updatedUser) {
        Optional<User> userOptional = userRepository.findById(id);

        if (!userOptional.isPresent()) {
            return ResponseEntity.status(404).body("Usuario no encontrado.");
        }

        User user = userOptional.get();
        
        // Solo actualizamos la descripción aquí, puedes expandirlo si necesitas más campos
        user.setDescription(updatedUser.getDescription());

        userRepository.save(user);

        return ResponseEntity.ok("Descripción actualizada correctamente.");
    }


    // Método para actualizar la imagen de perfil del usuario
    @PostMapping("/{id}/upload-profile-image")
    public ResponseEntity<Map<String, String>> uploadProfileImage(@PathVariable Integer id, @RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = userService.uploadProfileImage(id, file);

            // Crear el mapa para devolver la respuesta
            Map<String, String> response = new HashMap<>();
            response.put("message", "Imagen subida correctamente");
            response.put("imageUrl", imageUrl);  // Asegúrate de devolver la URL de la imagen

            // Devolver la respuesta como un JSON
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            // En caso de error, devolver un mensaje de error como JSON
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    


    @DeleteMapping("/{id}/profile-picture")
    public ResponseEntity<?> deleteProfilePicture(@PathVariable Integer id) {
        userService.deleteProfilePicture(id);
        return ResponseEntity.ok("Imagen de perfil eliminada");
    }
   

}