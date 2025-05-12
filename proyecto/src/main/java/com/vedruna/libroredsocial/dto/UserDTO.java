package com.vedruna.libroredsocial.dto;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {

    Integer id;
    String username;
    String email;
    String password;
    String description;
    String imageUrl;
    String theme;

    // Modificamos para usar listas de UserDTO completos
    List<UserDTO> followers;  // Lista de seguidores como UserDTO completos
    List<UserDTO> following;  // Lista de seguidos como UserDTO completos

    // Constructor que acepta los parámetros necesarios
    public UserDTO(Integer id, String username, String email, String imageUrl, String description, String theme, List<UserDTO> followers, List<UserDTO> following) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.imageUrl = imageUrl;
        this.description = description;
        this.theme = theme;
        this.followers = followers;
        this.following = following;
    }
}
