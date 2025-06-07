package com.vedruna.libroredsocial.dto;

import com.vedruna.libroredsocial.persistance.model.Book;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BookDTO {
    private String title;
    private String description;
    private String author;
    private String coverUrl;

}
