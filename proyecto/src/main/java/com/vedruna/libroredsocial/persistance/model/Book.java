package com.vedruna.libroredsocial.persistance.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "books", schema = "libroredsocial")
@Data
@NoArgsConstructor
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Relaciones con otros modelos
    @OneToMany(mappedBy = "book")
    private List<BookRating> ratings;

    @OneToMany(mappedBy = "book")
    private List<UserBookRead> booksRead;

    @OneToMany(mappedBy = "book")
    private List<UserBookFav> booksFav;

    @OneToMany(mappedBy = "book")
    private List<BookRanking> rankings;
}
