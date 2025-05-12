package com.vedruna.libroredsocial.controllers;

import com.vedruna.libroredsocial.dto.BookDTO;
import com.vedruna.libroredsocial.persistance.model.Book;
import com.vedruna.libroredsocial.persistance.model.User;
import com.vedruna.libroredsocial.persistance.model.UserBookFav;
import com.vedruna.libroredsocial.persistance.model.UserBookRead;
import com.vedruna.libroredsocial.persistance.repository.BookRepository;
import com.vedruna.libroredsocial.persistance.repository.UserBookFavRepository;
import com.vedruna.libroredsocial.persistance.repository.UserBookReadRepository;
import com.vedruna.libroredsocial.persistance.repository.UserRepository;
import com.vedruna.libroredsocial.services.BookServiceI;
import com.vedruna.libroredsocial.services.UserBookFavServiceI;
import com.vedruna.libroredsocial.services.UserBookReadServiceI;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
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
    private UserBookReadRepository userBookReadRepository;

    @Autowired
    private UserBookFavRepository userBookFavRepository;

    @Autowired
    private BookServiceI bookService;

    @Autowired
    private RestTemplate restTemplate;

    @GetMapping("/external/book/{olid}")
    public ResponseEntity<?> getBookFromOpenLibrary(@PathVariable String olid) {
        String url = "https://openlibrary.org/api/books?bibkeys=OLID:" + olid + "&format=json&jscmd=data";
        try {
            Map<String, Object> response = restTemplate.getForObject(url, Map.class); // ESTA LÍNEA FALTABA
            Map<String, Object> bookData = (Map<String, Object>) response.get("OLID:" + olid);
            BookDTO bookDTO = new BookDTO();

            bookDTO.setTitle((String) bookData.get("title"));

            Object desc = bookData.get("description");
            if (desc instanceof String) {
                bookDTO.setDescription((String) desc);
            } else if (desc instanceof Map) {
                bookDTO.setDescription((String) ((Map<String, Object>) desc).get("value"));
            }

            List<Map<String, Object>> authors = (List<Map<String, Object>>) bookData.get("authors");
            if (authors != null && !authors.isEmpty()) {
                StringBuilder authorNames = new StringBuilder();
                for (int i = 0; i < authors.size(); i++) {
                    authorNames.append(authors.get(i).get("name"));
                    if (i < authors.size() - 1) {
                        authorNames.append(", ");
                    }
                }
                bookDTO.setAuthor(authorNames.toString());
            } else {
                bookDTO.setAuthor("Autor desconocido");
            }


            bookDTO.setCoverUrl("http://localhost:8080/api/books/external/book/" + olid + "-L.jpg");

            return ResponseEntity.ok(bookDTO);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("Error al obtener el libro.");
        }
    }




    @GetMapping("/external/book/{olid}-L.jpg")
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

    @GetMapping("/fav/{userId}")
    public ResponseEntity<List<Book>> getFavoriteBooks(@PathVariable Integer userId) {
        List<Book> favoriteBooks = userBookFavService.getFavoriteBooksByUserId(userId);
        return ResponseEntity.ok(favoriteBooks);
    }

    @GetMapping("/read/{userId}")
    public ResponseEntity<List<Book>> getReadBooks(@PathVariable Integer userId) {
        List<Book> readBooks = userBookReadService.getReadBooksByUserId(userId);
        return ResponseEntity.ok(readBooks);
    }


    //Añadir a la lista de leídos
    @PostMapping("/read/{userId}/{olid}")
    public ResponseEntity<?> addBookToRead(@PathVariable Integer userId, @PathVariable String olid) {
        try {
            Optional<User> optionalUser = userRepository.findById(userId);
            if (optionalUser.isEmpty()) {
                return ResponseEntity.badRequest().body("Usuario no encontrado.");
            }
            User user = optionalUser.get();

            Book book = bookService.getBookByOlid(olid);
            if (book == null) {
                book = bookService.getBookInfoByOlid(olid);
                if (book == null) {
                    return ResponseEntity.badRequest().body("No se encontró información del libro.");
                }
                System.out.println("Book to save: " + book);
                bookService.save(book);
            }

            if (!userBookReadRepository.existsByUserAndBook(user, book)) {
                UserBookRead relation = new UserBookRead();
                relation.setUser(user);
                relation.setBook(book);
                userBookReadRepository.save(relation);
            }


            return ResponseEntity.ok("Libro añadido a la lista de leídos.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al añadir el libro: " + e.getMessage());
        }
    }



    // Añadir a la lista de favoritos
    @PostMapping("/fav/{userId}/{olid}")
    public ResponseEntity<?> addBookToFav(@PathVariable Integer userId, @PathVariable String olid) {
       try {
            Optional<User> optionalUser = userRepository.findById(userId);
            if (optionalUser.isEmpty()) {
                return ResponseEntity.badRequest().body("Usuario no encontrado.");
            }
            User user = optionalUser.get();

            Book book = bookService.getBookByOlid(olid);
            if (book == null) {
                book = bookService.getBookInfoByOlid(olid);
                if (book == null) {
                    return ResponseEntity.badRequest().body("No se encontró información del libro.");
                }
                bookService.save(book);
            }
            if (!userBookFavRepository.existsByUserAndBook(user, book)) {
                UserBookFav relation = new UserBookFav();
                relation.setUser(user); 
                relation.setBook(book);
                userBookFavRepository.save(relation);
            }

            return ResponseEntity.ok("Libro añadido a la lista de leídos.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al añadir el libro: " + e.getMessage());
        } 
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
