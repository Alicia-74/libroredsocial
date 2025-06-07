package com.vedruna.libroredsocial.services;

import com.vedruna.libroredsocial.persistance.model.Book;

import java.util.List;
import java.util.Optional;

public interface BookServiceI {

    List<Book> getAllBooks();
    
    Book getBookByOlid(String olid);

    Book getBookInfoByOlid(String olid);
    
    Book addBook(Book book);
    
    Book updateBook(String olid, Book updatedBook);
    
    void deleteBook(String olid);

    Book save(Book book);
}
