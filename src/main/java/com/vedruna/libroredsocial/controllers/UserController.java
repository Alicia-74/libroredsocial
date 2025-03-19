package com.vedruna.libroredsocial.controllers;

import com.vedruna.libroredsocial.persistance.model.User;
import com.vedruna.libroredsocial.persistance.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

    // Registro de usuario
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        // Verificar si el usuario ya existe
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body("{\"message\":\"El correo ya está registrado.\"}");
        }

        // Asignar un valor predeterminado al tema si es null
        if (user.getTheme() == null) {
            user.setTheme("light"); // Asigna un valor predeterminado si no se proporcionó el valor de theme
        }

        // Hashear la contraseña con BCrypt manualmente
        String hashedPassword = BCrypt.hashpw(user.getPassword(), BCrypt.gensalt(12));
        user.setPassword(hashedPassword);

        // Guardar usuario
        userRepository.save(user);

        // Enviar una respuesta exitosa como JSON
        return ResponseEntity.ok("{\"message\":\"Usuario registrado con éxito.\"}");
    }




    // Método login (sin sesiones ni autenticación)
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User user) {
        Optional<User> userOptional = userRepository.findByEmail(user.getEmail());

        if (!userOptional.isPresent()) {
            return ResponseEntity.badRequest().body("Usuario no encontrado.");
        }

        User existingUser = userOptional.get();

        // Verificar la contraseña
        if (!BCrypt.checkpw(user.getPassword(), existingUser.getPassword())) {
            return ResponseEntity.badRequest().body("Contraseña incorrecta.");
        }

        // Si no utilizas sesión, simplemente devuelve un mensaje de éxito
        return ResponseEntity.ok("Inicio de sesión exitoso.");
    }

    // Método para cerrar sesión (no necesario si no usas sesiones)
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // Aquí no es necesario hacer nada ya que no estamos gestionando la sesión
        return ResponseEntity.ok("Sesión cerrada correctamente.");
    }
}
