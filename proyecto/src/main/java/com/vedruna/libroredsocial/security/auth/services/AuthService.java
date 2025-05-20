package com.vedruna.libroredsocial.security.auth.services;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
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
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        User user=userRepo.findByEmail(request.getEmail()).orElseThrow();
        return new AuthResponseDTO(jwtService.getToken(user));
    }

    public void register(RegisterRequestDTO request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepo.save(user);
    }
}
