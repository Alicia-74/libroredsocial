package com.vedruna.libroredsocial.security.auth.controllers;


import org.springframework.beans.factory.annotation.Autowired;
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

    @PostMapping(value = "/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
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
