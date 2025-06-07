package com.vedruna.libroredsocial.persistance.model;

import java.util.Optional;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_books_fav", schema = "libroredsocial")
@Data
@NoArgsConstructor
public class UserBookFav {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user; // Usuario que ha marcado el libro como favorito

    @ManyToOne
    @JoinColumn(name = "book_olid", referencedColumnName = "olid", nullable = false)
    private Book book; // Libro marcado como favorito

    

}
