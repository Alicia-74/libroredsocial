package com.vedruna.libroredsocial.persistance.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "books", schema = "libroredsocial")
@Data
@NoArgsConstructor
public class Book {

    @Id
    @Column(name = "olid", nullable = false, unique = true)
    private String olid;  

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "author", length = 255)
    private String author;

    @Column(name = "cover_url", length = 255)
    private String coverUrl;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", nullable = true, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Relaciones con otros modelos
    @OneToMany(mappedBy = "book")
    private List<BookRating> ratings;

    @OneToMany(mappedBy = "book")
    @JsonIgnore
    private List<UserBookRead> booksRead;

    @OneToMany(mappedBy = "book")
    @JsonIgnore
    private List<UserBookFav> booksFav;

    @OneToMany(mappedBy = "book")
    private List<BookRanking> rankings;

    // Constructor que acepta los parámetros que necesitamos
    public Book(String olid, String title, String coverUrl, String author, String description) {
        this.olid = olid;
        this.title = title;
        this.coverUrl = coverUrl;
        this.author = author;
        this.description = description;
        this.createdAt = LocalDateTime.now();  // Asigna la fecha de creación automáticamente
    }
}
