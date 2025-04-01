package com.vedruna.libroredsocial.services;

import com.vedruna.libroredsocial.persistance.model.Book;

import java.util.List;
import java.util.Optional;

public interface BookServiceI {

    List<Book> getAllBooks();
    
    Optional<Book> getBookById(Integer id);
    
    Book addBook(Book book);
    
    Book updateBook(Integer id, Book updatedBook);
    
    void deleteBook(Integer id);

    Book save(Book book);
}
