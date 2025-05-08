package com.vedruna.libroredsocial.services.Impl;

import com.vedruna.libroredsocial.persistance.model.Book;
import com.vedruna.libroredsocial.persistance.repository.BookRepository;
import com.vedruna.libroredsocial.services.BookServiceI;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BookServiceImpl implements BookServiceI {

    @Autowired
    private BookRepository bookRepository;

    @Override
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    @Override
    public Book getBookByOlid(String olid) {
        return bookRepository.findByOlid(olid);
    }

    @Override
    public Book addBook(Book book) {
        return bookRepository.save(book);
    }

    @Override
    public Book updateBook(String olid, Book updatedBook) {
        Book book = bookRepository.findByOlid(olid);
        if (book == null) {
            throw new RuntimeException("Libro no encontrado.");
        }

        book.setTitle(updatedBook.getTitle());
        book.setAuthor(updatedBook.getAuthor());
        book.setCoverUrl(updatedBook.getCoverUrl());

        return bookRepository.save(book);
    }


    @Override
    public void deleteBook(String olid) {
        bookRepository.deleteById(olid);
    }

    @Override
    public Book save(Book book) {
        return bookRepository.save(book);
    }
}
