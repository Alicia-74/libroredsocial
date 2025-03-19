package com.vedruna.libroredsocial.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authorizeRequests ->
                authorizeRequests
                    .requestMatchers("/api/users/**").permitAll() // Permite acceso a los endpoints específicos sin autenticación
                    .anyRequest().permitAll()  // Permite acceso a cualquier otra solicitud sin autenticación
            )
            .csrf().disable();  // Desactiva la protección CSRF

        return http.build();
    }
}
