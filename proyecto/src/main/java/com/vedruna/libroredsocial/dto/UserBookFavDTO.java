package com.vedruna.libroredsocial.dto;

import com.vedruna.libroredsocial.persistance.model.Book;
import com.vedruna.libroredsocial.persistance.model.User;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserBookFavDTO {

    private Integer userId;  // ID del usuario que ha marcado el libro como favorito
    private String olid;  // ID del libro marcado como favorito

}
