package com.vedruna.libroredsocial.services.Impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vedruna.libroredsocial.persistance.model.Book;
import com.vedruna.libroredsocial.persistance.repository.BookRepository;
import com.vedruna.libroredsocial.services.BookServiceI;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Optional;

@Service
public class BookServiceImpl implements BookServiceI {

    @Autowired
    private BookRepository bookRepository;
    @Autowired
    private RestTemplate restTemplate;
    @Autowired
    private ObjectMapper objectMapper;

    private static final String API_URL = "https://openlibrary.org/api/books?bibkeys=OLID:{olid}&format=json&jscmd=data";
    

    @Override
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    @Override
    public Book getBookByOlid(String olid) {
        return bookRepository.findByOlid(olid);
    }


    public Book getBookInfoByOlid(String olid) {
        String url = API_URL.replace("{olid}", olid);
         // Hacemos la solicitud a la API
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
        
        if (response.getStatusCode().is2xxSuccessful()) {
            String jsonResponse = response.getBody();
            try {
                // Convertimos el JSON en un objeto BookInfo
                return mapJsonToBookInfo(jsonResponse, olid);
            } catch (Exception e) {
                // Si hay un error al procesar el JSON, se retorna null
                e.printStackTrace();
                return null;
            }
        }
        // Si la respuesta no es exitosa, retornamos null
        return null;
    }

    // Método para mapear el JSON de Open Library a un objeto BookInfo
    private Book mapJsonToBookInfo(String jsonResponse, String olid) throws Exception {
        JsonNode rootNode = objectMapper.readTree(jsonResponse);
        JsonNode bookNode = rootNode.get("OLID:" + olid);

        if (bookNode != null) {
            String title = bookNode.path("title").asText(null);
            String coverUrl = bookNode.path("cover").path("medium").asText(null);
            String author = bookNode.path("authors").get(0).path("name").asText(null);
            String description = bookNode.has("description")
                ? (bookNode.get("description").isTextual()
                    ? bookNode.get("description").asText()
                    : bookNode.get("description").path("value").asText(null))
                : null;

            return new Book(olid, title, coverUrl, author, description);
        }

        return null;
    }


    // Método auxiliar para extraer el OLID del libro desde la URL
    private String extractOlidFromUrl(String url) {
        // Extraemos el OLID del JSON (en formato "OLID:{olid}")
        return url.split(":")[1].split(",")[0];
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
