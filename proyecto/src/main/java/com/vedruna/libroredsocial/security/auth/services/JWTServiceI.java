package com.vedruna.libroredsocial.security.auth.services;

import java.security.Key;
import java.util.Map;

import org.springframework.security.core.userdetails.UserDetails;

import com.vedruna.libroredsocial.persistance.model.User;

public interface JWTServiceI {
    String getToken(User user);

    String getToken(Map<String, Object> extraClaims, User user);

    Key getKey();

    String getUsernameFromToken(String token);

    boolean isTokenValid(String token, UserDetails userDetails);
}
