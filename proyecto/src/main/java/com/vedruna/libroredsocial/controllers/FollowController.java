package com.vedruna.libroredsocial.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vedruna.libroredsocial.dto.UserDTO;
import com.vedruna.libroredsocial.services.FollowServiceI;


// Define que esta clase es un controlador REST
@RestController

// Define la ruta base para todas las rutas de este controlador
@RequestMapping("/api/follow")
public class FollowController {

    // Inyecta el servicio que maneja la lógica de seguir usuarios
    @Autowired
    private FollowServiceI followService;

    // Endpoint para seguir a un usuario.
    // El id del usuario a seguir viene en la URL, 
    // el id del usuario actual viene en el header "userId".
    @PostMapping("/{id}/follow")
    public void follow(@PathVariable Integer id, @RequestHeader("userId") Integer currentUserId) {
        followService.followUser(currentUserId, id);
    }

    // Endpoint para obtener la lista de seguidores de un usuario.
    // Devuelve una lista de UserDTO con los seguidores.
    @GetMapping("/{userId}/followers")
    public ResponseEntity<List<UserDTO>> getFollowers(@PathVariable Integer userId) {
        List<UserDTO> followers = followService.getFollowers(userId);
        return ResponseEntity.ok(followers); // responde con status 200 y la lista
    }

    // Endpoint para obtener la lista de usuarios que sigue un usuario.
    // Devuelve una lista de UserDTO con los usuarios seguidos.
    @GetMapping("/{userId}/following")
    public ResponseEntity<List<UserDTO>> getFollowing(@PathVariable Integer userId) {
        List<UserDTO> following = followService.getFollowing(userId);
        return ResponseEntity.ok(following); // responde con status 200 y la lista
    }

    // Endpoint para dejar de seguir a un usuario.
    // El id del usuario a dejar de seguir viene en la URL,
    // el id del usuario actual viene en el header "userId".
    @DeleteMapping("/{id}/unfollow")
    public void unfollow(@PathVariable Integer id, @RequestHeader("userId") Integer currentUserId) {
        followService.unfollowUser(currentUserId, id);
    }

    // Endpoint para consultar si el usuario actual sigue a otro usuario.
    // Devuelve true o false en la respuesta.
    @GetMapping("/{id}/is-following")
    public ResponseEntity<?> isFollowing(@PathVariable Integer id, @RequestHeader("userid") Integer currentUserId) {
        boolean isFollowing = followService.isFollowing(currentUserId, id);
        return ResponseEntity.ok(isFollowing); // true o false
    }

}
