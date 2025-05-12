package com.vedruna.libroredsocial.persistance.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.vedruna.libroredsocial.persistance.model.Book;
import com.vedruna.libroredsocial.persistance.model.User;
import com.vedruna.libroredsocial.persistance.model.UserBookFav;
@Repository
public interface UserBookFavRepository extends JpaRepository<UserBookFav, Integer> {
    List<UserBookFav> findByUserId(Integer userId);
    List<UserBookFav> findByBookOlid(String oild);
    UserBookFav findByUserIdAndBookOlid(Integer userId, String oild);
    boolean existsByUserIdAndBookOlid(Integer userId, String olid); // Método para verificar si un libro ya está en la lista de favoritos
    boolean existsByUserAndBook(User user, Book book);

}
