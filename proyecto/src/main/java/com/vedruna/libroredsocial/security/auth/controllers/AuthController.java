package com.vedruna.libroredsocial.security.auth.controllers;


import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vedruna.libroredsocial.dto.ResponseDTO;
import com.vedruna.libroredsocial.security.auth.dto.AuthResponseDTO;
import com.vedruna.libroredsocial.security.auth.dto.LoginRequestDTO;
import com.vedruna.libroredsocial.security.auth.dto.RegisterRequestDTO;
import com.vedruna.libroredsocial.security.auth.services.AuthServiceI;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private AuthServiceI authService;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO request) {
        try {
            AuthResponseDTO response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // Aquí devolvemos directamente JSON con mensaje de error
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Correo o contraseña incorrectos"));
        }
    }


    @PostMapping(value = "/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequestDTO request) {
        try {
            authService.register(request);
            return ResponseEntity.ok(new ResponseDTO("User registered successfully"));
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(new ResponseDTO("Error al registrar: " + e.getMessage()));
        }
    }


}
