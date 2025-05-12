package com.vedruna.libroredsocial.persistance.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.vedruna.libroredsocial.persistance.model.Book;
import com.vedruna.libroredsocial.persistance.model.User;
import com.vedruna.libroredsocial.persistance.model.UserBookRead;
@Repository
public interface UserBookReadRepository extends JpaRepository<UserBookRead, Integer> {
    List<UserBookRead> findByUserId(Integer userId);
    List<UserBookRead> findByBookOlid(String olid);
    UserBookRead findByUserIdAndBookOlid(Integer userId, String olid);
    boolean existsByUserIdAndBookOlid(Integer userId, String olid); // Método para verificar si un libro ya está en la lista de leídos
    boolean existsByUserAndBook(User user, Book book);

}
