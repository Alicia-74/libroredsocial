package com.vedruna.libroredsocial.dto;
import java.sql.Date;
import java.text.DateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

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
    String createdAtFormatted; // Cambiado a Date para almacenar la fecha de creación

    // Modificamos para usar listas de UserDTO completos
    List<UserDTO> followers;  // Lista de seguidores como UserDTO completos
    List<UserDTO> following;  // Lista de seguidos como UserDTO completos

    // Constructor que acepta los parámetros necesarios
    public UserDTO(Integer id, String username, String email, String imageUrl, String description, String theme, LocalDateTime createdAt, List<UserDTO> followers, List<UserDTO> following) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.imageUrl = imageUrl;
        this.description = description;
        this.theme = (theme == null) ? "light" : theme; // Si es null, poner light por defecto
        this.createdAtFormatted = formatCreatedAt(createdAt); // Formateamos aquí
        this.followers = followers;
        this.following = following;
    }

    // Método privado para formatear la fecha
    private String formatCreatedAt(LocalDateTime date) {
        if (date == null) {
            return "Fecha no disponible";
        }
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy", new Locale("es", "ES"));
        return date.format(formatter);
    }
}
