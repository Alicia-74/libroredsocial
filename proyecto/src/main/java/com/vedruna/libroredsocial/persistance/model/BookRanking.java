package com.vedruna.libroredsocial.persistance.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "book_rankings", schema = "libroredsocial")
@Data
@NoArgsConstructor
public class BookRanking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "book_Olid", referencedColumnName = "olid", nullable = false)
    private Book book;

    @Column(name = "total_ratings", nullable = false)
    private Integer totalRatings;

    @Column(name = "average_rating", nullable = false)
    private Float averageRating;
}
