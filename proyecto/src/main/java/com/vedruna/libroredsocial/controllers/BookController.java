package com.vedruna.libroredsocial.controllers;

import com.vedruna.libroredsocial.persistance.model.Book;
import com.vedruna.libroredsocial.persistance.model.User;
import com.vedruna.libroredsocial.persistance.model.UserBookFav;
import com.vedruna.libroredsocial.persistance.model.UserBookRead;
import com.vedruna.libroredsocial.persistance.repository.BookRepository;
import com.vedruna.libroredsocial.persistance.repository.UserRepository;
import com.vedruna.libroredsocial.services.BookServiceI;
import com.vedruna.libroredsocial.services.UserBookFavServiceI;
import com.vedruna.libroredsocial.services.UserBookReadServiceI;
import com.vedruna.libroredsocial.services.UserServiceI;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;



@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/books")

public class BookController {

   @Autowired
    private UserBookReadServiceI userBookReadService;

    @Autowired
    private UserBookFavServiceI userBookFavService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;


    @GetMapping("/external/book/{olid}")
    public ResponseEntity<String> getBookFromOpenLibrary(@PathVariable String olid) {
        String url = "https://openlibrary.org/works/" + olid + ".json";
        RestTemplate restTemplate = new RestTemplate();
        try {
            String response = restTemplate.getForObject(url, String.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("Error al obtener el libro.");
        }
    }


    @GetMapping("/external/book/{bookId}-L.jpg")
    public ResponseEntity<byte[]> getBookCover(@PathVariable String olid) {
        String imageUrl = "https://covers.openlibrary.org/b/olid/" + olid + "-L.jpg";
        RestTemplate restTemplate = new RestTemplate();
        try {
            byte[] imageBytes = restTemplate.getForObject(imageUrl, byte[].class);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_JPEG);
            return new ResponseEntity<>(imageBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).build();
        }
    }



    //Añadir a la lista de leídos
    @PostMapping("/read/{userId}/{olid}")
    public ResponseEntity<String> addBookToRead(@PathVariable Integer userId, @PathVariable String olid)  {
        // Buscar el usuario y el libro por sus IDs
        User user = userRepository.findUserById(userId);  // Asegúrate de tener un método en el servicio para encontrar al usuario
        Book book = bookRepository.findByOlid(olid);  // Asegúrate de tener un método en el servicio para encontrar el libro

        if (user == null || book == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuario o libro no encontrado.");
        }

        // Crear el objeto UserBookFav
        UserBookRead userBookRead = new UserBookRead();
        userBookRead.setUser(user);  // Asociar la instancia de usuario
        userBookRead.setBook(book);  // Asociar la instancia del libro
        
        userBookReadService.addBookToRead(userBookRead);
        return ResponseEntity.ok("Libro añadido a la lista de leídos.");
    }

    // Añadir a la lista de favoritos
    @PostMapping("/fav/{userId}/{oild}")
    public ResponseEntity<String> addBookToFav(@PathVariable Integer userId, @PathVariable String olid) {
        // Buscar el usuario y el libro por sus IDs
        User user = userRepository.findUserById(userId);  // Asegúrate de tener un método en el servicio para encontrar al usuario
        Book book = bookRepository.findByOlid(olid);  // Asegúrate de tener un método en el servicio para encontrar el libro

        if (user == null || book == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuario o libro no encontrado.");
        }

        // Crear el objeto UserBookFav
        UserBookFav userBookFav = new UserBookFav();
        userBookFav.setUser(user);  // Asociar la instancia de usuario
        userBookFav.setBook(book);  // Asociar la instancia del libro

        // Añadir el libro a los favoritos
        userBookFavService.addBookToFav(userBookFav);
        return ResponseEntity.ok("Libro añadido a la lista de favoritos.");
    }


    // Eliminar de la lista de leídos
    @DeleteMapping("/read/{userId}/{olid}")
    public ResponseEntity<String> removeBookFromRead(@PathVariable Integer userId,  @PathVariable String olid) {
        userBookReadService.removeBookFromRead(userId, olid);
        return ResponseEntity.ok("Libro eliminado de la lista de leídos.");
    }

    // Eliminar de la lista de favoritos
    @DeleteMapping("/fav/{userId}/{olid}")
    public ResponseEntity<String> removeBookFromFav(@PathVariable Integer userId,  @PathVariable String olid) {
        userBookFavService.removeBookFromFav(userId, olid);
        return ResponseEntity.ok("Libro eliminado de la lista de favoritos.");
    }
}
