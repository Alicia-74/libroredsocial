package com.vedruna.libroredsocial.persistance.repository;

import com.vedruna.libroredsocial.persistance.model.Book;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookRepository extends JpaRepository<Book, String> {
    Book findByOlid(String olid);

}
