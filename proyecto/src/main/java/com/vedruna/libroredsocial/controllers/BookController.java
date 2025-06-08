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
import org.springframework.web.client.RestTemplate;

@CrossOrigin(origins = "https://libroredsocial-amante-de-los-libros.vercel.app") // Permite peticiones CORS desde localhost:3000
@RestController // Define que esta clase es un controlador REST
@RequestMapping("/api/books") // Ruta base para todos los endpoints de este controlador
public class BookController {

   @Autowired
    private UserBookReadServiceI userBookReadService; // Servicio para manejar libros leídos

    @Autowired
    private UserBookFavServiceI userBookFavService; // Servicio para manejar libros favoritos

    @Autowired
    private UserRepository userRepository; // Repositorio para manejar usuarios

    @Autowired
    private UserBookReadRepository userBookReadRepository; // Repositorio para relación usuario-libro leído

    @Autowired
    private UserBookFavRepository userBookFavRepository; // Repositorio para relación usuario-libro favorito

    @Autowired
    private BookServiceI bookService; // Servicio para manejar libros

    @Autowired
    private RestTemplate restTemplate; // Cliente para realizar peticiones HTTP a servicios externos

    // Obtener información de un libro desde la API externa Open Library por OLID
    @GetMapping("/external/book/{olid}")
    public ResponseEntity<?> getBookFromOpenLibrary(@PathVariable String olid) {
        // Construye la URL para consultar la API Open Library
        String url = "https://openlibrary.org/api/books?bibkeys=OLID:" + olid + "&format=json&jscmd=data";
        try {
            // Realiza la petición GET y recibe un mapa con los datos del libro
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            // Extrae los datos del libro con la clave "OLID:<olid>"
            Map<String, Object> bookData = (Map<String, Object>) response.get("OLID:" + olid);
            BookDTO bookDTO = new BookDTO();

            // Asigna el título del libro
            bookDTO.setTitle((String) bookData.get("title"));

            // Extrae y asigna la descripción, que puede venir como String o Map
            Object desc = bookData.get("description");
            if (desc instanceof String) {
                bookDTO.setDescription((String) desc);
            } else if (desc instanceof Map) {
                bookDTO.setDescription((String) ((Map<String, Object>) desc).get("value"));
            }

            // Procesa la lista de autores y concatena sus nombres
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

            // Establece la URL de la portada que será otro endpoint de este controlador
            bookDTO.setCoverUrl("http://localhost:8080/api/books/external/book/" + olid + "-L.jpg");

            // Devuelve la información del libro con status 200
            return ResponseEntity.ok(bookDTO);

        } catch (Exception e) {
            // En caso de error, devuelve un status 502 Bad Gateway con un mensaje
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("Error al obtener el libro.");
        }
    }

    // Endpoint para obtener la imagen de la portada del libro desde Open Library
    @GetMapping("/external/book/{olid}-L.jpg")
    public ResponseEntity<byte[]> getBookCover(@PathVariable String olid) {
        // URL para la imagen de la portada en Open Library
        String imageUrl = "https://covers.openlibrary.org/b/olid/" + olid + "-L.jpg";
        RestTemplate restTemplate = new RestTemplate();
        try {
            // Obtiene la imagen como array de bytes
            byte[] imageBytes = restTemplate.getForObject(imageUrl, byte[].class);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_JPEG); // Indica que la respuesta es una imagen JPEG
            return new ResponseEntity<>(imageBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            // Si no se encuentra o hay error, responde con status 502 y sin contenido
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).build();
        }
    }

    // Obtener la lista de libros favoritos de un usuario
    @GetMapping("/fav/{userId}")
    public ResponseEntity<List<Book>> getFavoriteBooks(@PathVariable Integer userId) {
        List<Book> favoriteBooks = userBookFavService.getFavoriteBooksByUserId(userId);
        return ResponseEntity.ok(favoriteBooks);
    }

    // Obtener la lista de libros leídos de un usuario
    @GetMapping("/read/{userId}")
    public ResponseEntity<List<Book>> getReadBooks(@PathVariable Integer userId) {
        List<Book> readBooks = userBookReadService.getReadBooksByUserId(userId);
        return ResponseEntity.ok(readBooks);
    }

    // Añadir un libro a la lista de leídos de un usuario
    @PostMapping("/read/{userId}/{olid}")
    public ResponseEntity<?> addBookToRead(@PathVariable Integer userId, @PathVariable String olid) {
        try {
            // Buscar el usuario por id
            Optional<User> optionalUser = userRepository.findById(userId);
            if (optionalUser.isEmpty()) {
                return ResponseEntity.badRequest().body("Usuario no encontrado.");
            }
            User user = optionalUser.get();

            // Buscar el libro por OLID en la base de datos local
            Book book = bookService.getBookByOlid(olid);
            if (book == null) {
                // Si no existe, obtener info del libro desde la API externa
                book = bookService.getBookInfoByOlid(olid);
                if (book == null) {
                    return ResponseEntity.badRequest().body("No se encontró información del libro.");
                }
                // Guardar el libro nuevo en la base de datos
                bookService.save(book);
            }

            // Si no existe relación de libro leído para ese usuario, crearla
            if (!userBookReadRepository.existsByUserAndBook(user, book)) {
                UserBookRead relation = new UserBookRead();
                relation.setUser(user);
                relation.setBook(book);
                userBookReadRepository.save(relation);
            }

            return ResponseEntity.ok("Libro añadido a la lista de leídos.");
        } catch (Exception e) {
            // Captura errores y devuelve error 500 con mensaje
            return ResponseEntity.internalServerError().body("Error al añadir el libro: " + e.getMessage());
        }
    }

    // Añadir un libro a la lista de favoritos de un usuario
    @PostMapping("/fav/{userId}/{olid}")
    public ResponseEntity<?> addBookToFav(@PathVariable Integer userId, @PathVariable String olid) {
       try {
            // Buscar el usuario por id
            Optional<User> optionalUser = userRepository.findById(userId);
            if (optionalUser.isEmpty()) {
                return ResponseEntity.badRequest().body("Usuario no encontrado.");
            }
            User user = optionalUser.get();

            // Buscar el libro en la base de datos local
            Book book = bookService.getBookByOlid(olid);
            if (book == null) {
                // Si no existe, obtener info del libro desde la API externa
                book = bookService.getBookInfoByOlid(olid);
                if (book == null) {
                    return ResponseEntity.badRequest().body("No se encontró información del libro.");
                }
                // Guardar el libro nuevo
                bookService.save(book);
            }

            // Si no existe relación libro favorito para ese usuario, crearla
            if (!userBookFavRepository.existsByUserAndBook(user, book)) {
                UserBookFav relation = new UserBookFav();
                relation.setUser(user);
                relation.setBook(book);
                userBookFavRepository.save(relation);
            }

            return ResponseEntity.ok("Libro añadido a la lista de leídos."); // Nota: este mensaje debería decir "favoritos"
        } catch (Exception e) {
            // Captura errores y devuelve error 500 con mensaje
            return ResponseEntity.internalServerError().body("Error al añadir el libro: " + e.getMessage());
        } 
    }

    // Eliminar un libro de la lista de leídos de un usuario
    @DeleteMapping("/read/{userId}/{olid}")
    public ResponseEntity<String> removeBookFromRead(@PathVariable Integer userId,  @PathVariable String olid) {
        userBookReadService.removeBookFromRead(userId, olid);
        return ResponseEntity.ok("Libro eliminado de la lista de leídos.");
    }

    // Eliminar un libro de la lista de favoritos de un usuario
    @DeleteMapping("/fav/{userId}/{olid}")
    public ResponseEntity<String> removeBookFromFav(@PathVariable Integer userId,  @PathVariable String olid) {
        userBookFavService.removeBookFromFav(userId, olid);
        return ResponseEntity.ok("Libro eliminado de la lista de favoritos.");
    }
}
