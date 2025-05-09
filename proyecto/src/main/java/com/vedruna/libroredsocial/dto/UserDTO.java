package com.vedruna.libroredsocial.dto;

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
     String theme; // campo para elegir el tema

    // Constructor que acepta los parámetros necesarios
    public UserDTO(Integer id, String username, String email, String imageUrl, String description, String theme) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.imageUrl = imageUrl;
        this.description = description;
        this.theme = theme;
    }
}
