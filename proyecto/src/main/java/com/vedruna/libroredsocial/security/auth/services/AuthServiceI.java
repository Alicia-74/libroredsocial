package com.vedruna.libroredsocial.security.auth.services;

import com.vedruna.libroredsocial.security.auth.dto.AuthResponseDTO;
import com.vedruna.libroredsocial.security.auth.dto.LoginRequestDTO;
import com.vedruna.libroredsocial.security.auth.dto.RegisterRequestDTO;

public interface AuthServiceI {
    AuthResponseDTO login(LoginRequestDTO request);
    void register(RegisterRequestDTO request);
}
