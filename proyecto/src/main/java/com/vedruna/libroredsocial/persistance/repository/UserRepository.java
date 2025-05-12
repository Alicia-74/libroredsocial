package com.vedruna.libroredsocial.persistance.repository;

import com.vedruna.libroredsocial.dto.UserDTO;
import com.vedruna.libroredsocial.persistance.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    
    // Método para encontrar un usuario por correo
    Optional<User> findByEmail(String email);
    // Método para verificar si un usuario existe por correo
    boolean existsByEmail(String email);
    // Método para encontrar un usuario por ID
    User findUserById(Integer id); 
    // Método para encontrar un usuario por nombre de usuario
    List<User> findByUsernameStartingWithIgnoreCase(String prefix);
    // Método para encontrar un usuario por id
    User getUserById(Integer userId);

    
}
