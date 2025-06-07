package com.vedruna.libroredsocial.security.auth.services;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.vedruna.libroredsocial.persistance.model.User;
import com.vedruna.libroredsocial.persistance.repository.UserRepository;
import com.vedruna.libroredsocial.security.auth.dto.AuthResponseDTO;
import com.vedruna.libroredsocial.security.auth.dto.LoginRequestDTO;
import com.vedruna.libroredsocial.security.auth.dto.RegisterRequestDTO;



@Service
public class AuthService implements AuthServiceI {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private JWTServiceImpl jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    public AuthResponseDTO login(LoginRequestDTO request) {
         try {
            // Intenta autenticar con email y contraseña
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (BadCredentialsException e) {
            // Si falla, devuelve mensaje genérico
            throw new RuntimeException("Correo o contraseña incorrectos");
        }
        User user=userRepo.findByEmail(request.getEmail()).orElseThrow();
        return new AuthResponseDTO(jwtService.getToken(user));
    }

    public void register(RegisterRequestDTO request) {
        // Buscar todos los usuarios (o podrías buscar uno por username y otro por email)
        List<User> users = userRepo.findAll();

        for (User user : users) {
            if (user.getUsername().equals(request.getUsername())) {
                throw new IllegalArgumentException("Ya existe un usuario con ese nombre.");
            }
            if (user.getEmail().equals(request.getEmail())) {
                throw new IllegalArgumentException("Ya existe un usuario con ese correo.");
            }
        }

        User newUser = new User();
        newUser.setUsername(request.getUsername());
        newUser.setEmail(request.getEmail());
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepo.save(newUser);
    }

}
