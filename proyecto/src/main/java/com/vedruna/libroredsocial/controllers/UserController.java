package com.vedruna.libroredsocial.controllers;

import com.vedruna.libroredsocial.persistance.model.User;
import com.vedruna.libroredsocial.persistance.repository.UserRepository;
import com.vedruna.libroredsocial.security.auth.services.JWTServiceI;

import io.jsonwebtoken.Claims;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JWTServiceI jwtService; // Inyectamos el servicio de JWT

    // Método GET para obtener un usuario por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Integer id) {
        Optional<User> userOptional = userRepository.findById(id);

        if (!userOptional.isPresent()) {
            return ResponseEntity.status(404).body("Usuario no encontrado.");
        }

        return ResponseEntity.ok(userOptional.get());
    }

    // Método GET para obtener todos los usuarios
    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findAll();

        if (users.isEmpty()) {
            return ResponseEntity.status(404).body("No hay usuarios registrados.");
        }

        return ResponseEntity.ok(users);
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

}