package com.vedruna.libroredsocial.controllers;

import com.vedruna.libroredsocial.persistance.model.UserBookRead;
import com.vedruna.libroredsocial.services.UserBookReadServiceI;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/user-books-read")
public class UserBookReadController {

    @Autowired
    private  UserBookReadServiceI userBookReadService;

    @PostMapping
    public ResponseEntity<?> addBookToRead(@RequestBody UserBookRead userBookRead) {
        userBookReadService.addBookToRead(userBookRead);
        return ResponseEntity.ok("Libro añadido a la lista de leídos");
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserBookRead>> getBooksReadByUser(@PathVariable Integer userId) {
        List<UserBookRead> books = userBookReadService.getBooksReadByUser(userId);
        return ResponseEntity.ok(books);
    }
}
