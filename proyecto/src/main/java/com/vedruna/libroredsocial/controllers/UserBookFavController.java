package com.vedruna.libroredsocial.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vedruna.libroredsocial.persistance.model.UserBookFav;
import com.vedruna.libroredsocial.services.UserBookFavServiceI;

import io.swagger.v3.oas.annotations.parameters.RequestBody;

@RestController
@RequestMapping("/api/user-books-fav")
public class UserBookFavController {
    
    @Autowired
    private UserBookFavServiceI userBookFavService;

    @PostMapping
    public ResponseEntity<?> addBookToFav(@RequestBody UserBookFav userBookFav) {
        userBookFavService.addBookToFav(userBookFav);
        return ResponseEntity.ok("Libro añadido a la lista de favoritos");
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserBookFav>> getBooksFavByUser(@PathVariable Integer userId) {
        List<UserBookFav> books = userBookFavService.getBooksFavByUser(userId);
        return ResponseEntity.ok(books);
    }
}
