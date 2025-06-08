package com.vedruna.libroredsocial.security.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.vedruna.libroredsocial.security.jwt.JWTAuthenticationFilter;

// ¡Asegúrate de tener este import estático!
import static org.springframework.security.web.util.matcher.AntPathRequestMatcher.antMatcher;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JWTAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private AuthenticationProvider authProvider;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("https://libroredsocial-amante-de-los-libros.vercel.app"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*")); // Permite todas las cabeceras
        config.setExposedHeaders(List.of("*")); // Expone todas las cabeceras
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http.csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(authReq -> authReq
                    // 1. PERMITIR WEBSOCKETS AL PRINCIPIO (¡prioridad!)
                    
                   // Permite conexiones WebSocket sin autenticación
                    .requestMatchers(antMatcher("/ws/**")).permitAll()
                    .requestMatchers(antMatcher("/ws/info/**")).permitAll()
                    .requestMatchers(antMatcher("/topic/**")).permitAll()
                    .requestMatchers(antMatcher("/queue/**")).permitAll()
                    .requestMatchers(antMatcher("/app/**")).permitAll()

                    // 2. PERMITIR OPTIONS para CORS (generalmente una buena práctica)
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                    // 3. Demás rutas públicas (mantener el orden si es posible de más específico a menos)
                    .requestMatchers("/api/v1/auth/**").permitAll()
                    .requestMatchers("/api/users/**").permitAll()
                    .requestMatchers("/api/books/fav/**").permitAll()
                    .requestMatchers("/api/books/read/**").permitAll()
                    .requestMatchers("/api/users/all").permitAll()
                    .requestMatchers("/api/users/search/**").permitAll()
                    .requestMatchers("/api/follow/**").permitAll()
                    .requestMatchers("/api/users/me").authenticated() // Esta es una ruta autenticada, déjala así o muévela después de anyRequest().authenticated()
                    .requestMatchers("/api/follow/{id}/followers").permitAll()
                    .requestMatchers("/api/follow/{id}/following").permitAll()
                    .requestMatchers("/api/follow/{id}/is-following").permitAll()
                    .requestMatchers("/api/books/external/book/**").permitAll()
                    .requestMatchers("/api/books/{userId}/read-books").permitAll()
                    .requestMatchers("/api/books/{userId}/favorite-books").permitAll()
                    .requestMatchers("/api/users/{userId}/theme").permitAll()
                    .requestMatchers("/api/messages/**").permitAll()
                    .requestMatchers("/api/messages/conversation/{user1Id}/{user2Id}").permitAll()
                    .requestMatchers("/api/messages/chats/{userId}").permitAll()
                    .requestMatchers("/api/messages/unread/**").permitAll()
                    .requestMatchers("/api/messages/unread/{emisorId}/{receptorId}").permitAll()
                    .requestMatchers("/api/messages/unread-counts-by-sender/{userId}").permitAll()
                    .requestMatchers("/api/messages/chat.sendMessage").permitAll()
                    //Cualquier otra solicitud debe estar autenticada
                    .anyRequest().authenticated()
                )
                .sessionManagement(sessionManager -> sessionManager.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authProvider)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}