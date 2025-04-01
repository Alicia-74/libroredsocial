package com.vedruna.libroredsocial.persistance.repository;

import com.vedruna.libroredsocial.persistance.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    
    // Método para encontrar un usuario por correo
    Optional<User> findByEmail(String email);
    // Método para verificar si un usuario existe por correo
    boolean existsByEmail(String email);
    
    // Método para encontrar un usuario por id
    Optional<User> findById(Integer id);
}
