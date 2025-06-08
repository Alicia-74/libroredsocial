package com.vedruna.libroredsocial.controllers;

import com.vedruna.libroredsocial.dto.UserDTO;
import com.vedruna.libroredsocial.persistance.model.User;
import com.vedruna.libroredsocial.persistance.repository.UserRepository;
import com.vedruna.libroredsocial.security.auth.services.JWTServiceI;
import com.vedruna.libroredsocial.services.impl.UserServiceImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

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
        return ResponseEntity.ok(userService.getUserDtoById(id));
    }

    

    // Método GET para obtener todos los usuarios
    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findAll();
    
        if (users.isEmpty()) {
            return ResponseEntity.status(200).body("No hay usuarios registrados.");
        }
    
        List<UserDTO> userDTOs = users.stream()
                .map(user -> new UserDTO(
                        user.getId(),
                        user.getUsername(),
                        user.getEmail(),
                        user.getImageUrl(),
                        user.getDescription(),
                        user.getTheme() == null ? "light" : user.getTheme(),
                        user.getCreatedAt(),
                        // Convertir los seguidores a UserDTO completos
                        user.getFollowers().stream()
                                .map(f -> new UserDTO(
                                        f.getFollower().getId(),
                                        f.getFollower().getUsername(),
                                        f.getFollower().getEmail(),
                                        f.getFollower().getImageUrl(),
                                        f.getFollower().getDescription(),
                                        f.getFollower().getTheme() == null ? "light" : user.getTheme(),
                                        f.getFollower().getCreatedAt(),
                                        null, null // No necesitamos los seguidores de los seguidores para evitar ciclos infinitos
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
                                        f.getFollowing().getTheme() == null ? "light" : user.getTheme(),
                                        f.getFollowing().getCreatedAt(),
                                        null, null // No necesitamos los seguidos de los seguidos para evitar ciclos infinitos
                                ))
                                .collect(Collectors.toList())
                ))
                .collect(Collectors.toList());
    
        return ResponseEntity.ok(userDTOs);
    }
    

    // Método GET para buscar los usuarios
    @GetMapping("/search/{username}")
    public ResponseEntity<?> searchUsersByPrefix(@PathVariable String username) {
        List<User> users = userRepository.findByUsernameStartingWithIgnoreCase(username);

        if (users.isEmpty()) {
            return ResponseEntity.status(404).body("No se encontraron usuarios.");
        }

        List<UserDTO> userDTOs = users.stream()
                .map(user -> new UserDTO(
                        user.getId(),
                        user.getUsername(),
                        user.getEmail(),
                        user.getImageUrl(),
                        user.getDescription(),
                        user.getTheme() == null ? "light" : user.getTheme(),
                        user.getCreatedAt(),
                        // Convertir los seguidores a UserDTO completos
                        user.getFollowers().stream()
                                .map(f -> new UserDTO(
                                        f.getFollower().getId(),
                                        f.getFollower().getUsername(),
                                        f.getFollower().getEmail(),
                                        f.getFollower().getImageUrl(),
                                        f.getFollower().getDescription(),
                                        f.getFollower().getTheme() == null ? "light" : user.getTheme(),
                                        f.getFollower().getCreatedAt(),
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
                                        f.getFollowing().getTheme() == null ? "light" : user.getTheme(),
                                        f.getFollowing().getCreatedAt(),
                                        null, null // Evitar ciclos infinitos
                                ))
                                .collect(Collectors.toList())
                ))
                .collect(Collectors.toList());

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

        Map<String, String> response = new HashMap<>();
        response.put("message", "Descripción actualizada correctamente.");
        return ResponseEntity.ok(response);

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
            errorResponse.put("error", "Solo se permiten imágenes en formato JPG o PNG. Por favor, selecciona una foto compatible.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    


    @DeleteMapping("/{id}/profile-picture")
    public ResponseEntity<?> deleteProfilePicture(@PathVariable Integer id) {
        userService.deleteProfilePicture(id);
        return ResponseEntity.ok("Imagen de perfil eliminada");
    }
   


    // Obtener el tema de un usuario por su ID (sin autenticación)
     @GetMapping("/{id}/theme")
    public ResponseEntity<String> getUserTheme(@PathVariable Integer id) {
        try {
            // Llama a un método en tu servicio para obtener el tema
            String theme = userService.getUserTheme(id);
            // Aseguramos que siempre devuelve "light" si no se encontró o es nulo
            return ResponseEntity.ok(theme != null ? theme : "light");
        } catch (RuntimeException e) {
            // En caso de que el usuario no exista, o algún otro error,
            // podríamos devolver "light" como tema por defecto o un error.
            // Aquí devolvemos "light" para una experiencia de usuario más suave.
            return ResponseEntity.ok("light");
        }
    }

    //Actualizar theme
     @PutMapping("/{id}/theme")
    public ResponseEntity<?> updateTheme(@PathVariable Integer id, @RequestBody Map<String, String> payload) {
        String theme = payload.get("theme"); // Obtiene el String "light" o "dark"

        if (theme == null || (!theme.equals("light") && !theme.equals("dark"))) {
            return ResponseEntity.badRequest().body("El valor del tema es inválido. Debe ser 'light' o 'dark'.");
        }

        try {
            // Llama a un método en tu servicio para actualizar el tema
            userService.updateUserTheme(id, theme);
            return ResponseEntity.ok().build(); // O ResponseEntity.noContent().build()
        } catch (RuntimeException e) {
            // Manejo de errores si el usuario no existe o hay un problema en la DB
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al actualizar el tema: " + e.getMessage());
        }
    }

}