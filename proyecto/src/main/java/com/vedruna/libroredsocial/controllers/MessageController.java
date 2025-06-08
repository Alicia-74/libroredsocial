package com.vedruna.libroredsocial.controllers;

import com.vedruna.libroredsocial.dto.MessageDTO;
import com.vedruna.libroredsocial.persistance.model.Message;
import com.vedruna.libroredsocial.persistance.repository.MessageRepository;
import com.vedruna.libroredsocial.services.MessageServiceI;
import com.vedruna.libroredsocial.mapper.MessageMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "https://libroredsocial-amante-de-los-libros.vercel.app") 
// Permite que el frontend alojado en localhost:3000 pueda hacer peticiones a este backend (evita error CORS)
@RestController 
// Define que esta clase es un controlador REST y que todos sus métodos devolverán datos (no vistas)
@RequestMapping("/api/messages") 
// Prefijo común para todas las rutas de este controlador, ej: /api/messages/conversation/1/2
public class MessageController {

    @Autowired
    private MessageServiceI messageService; // Servicio que maneja la lógica de negocio relacionada con mensajes

    @Autowired
    private MessageMapper messageMapper; // Componente para convertir entre entidades Message y DTOs MessageDTO

    @Autowired
    private SimpMessagingTemplate messagingTemplate; // Facilita enviar mensajes a clientes conectados vía WebSocket

    @Autowired
    private MessageRepository messageRepository;
    
    // --- Endpoint REST para obtener la conversación entre dos usuarios ---
    @GetMapping("/conversation/{user1Id}/{user2Id}")
    public ResponseEntity<List<MessageDTO>> getConversation(@PathVariable Integer user1Id, @PathVariable Integer user2Id) {
        // Llamamos al servicio para obtener la lista de mensajes entre user1 y user2 en DTOs
        List<MessageDTO> conversation = messageService.getConversation(user1Id, user2Id);
        // Devolvemos la lista con estado HTTP 200 OK
        return ResponseEntity.ok(conversation);
    }

    // --- Endpoint REST para obtener los últimos chats para un usuario ---
    @GetMapping("/chats/{userId}")
    public ResponseEntity<List<MessageDTO>> getLatestChatsForUser(@PathVariable Integer userId) {
        // Llamamos al servicio para obtener los últimos mensajes relevantes para un usuario
        List<MessageDTO> latestChats = messageService.getLatestChatsForUser(userId);
        // Devolvemos la lista con estado HTTP 200 OK
        return ResponseEntity.ok(latestChats);
    }

    // --- Método que maneja mensajes enviados por WebSocket desde clientes ---
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload MessageDTO messageDTO) {
        Message savedMessage = messageService.saveMessage(messageDTO);
        MessageDTO savedMessageDTO = messageMapper.toDTO(savedMessage);

        // Enviar mensaje a los participantes
        messagingTemplate.convertAndSendToUser(
            savedMessage.getSender().getId().toString(),
            "/queue/messages",
            savedMessageDTO
        );

        messagingTemplate.convertAndSendToUser(
            savedMessage.getReceiver().getId().toString(),
            "/queue/messages",
            savedMessageDTO
        );

        // Enviar actualización de conteos no leídos por remitente al receptor
        Map<Integer, Long> unreadCountsBySender = messageService.getUnreadCountsBySender(savedMessage.getReceiver().getId());
        messagingTemplate.convertAndSendToUser(
            savedMessage.getReceiver().getId().toString(),
            "/queue/unread-count",
            unreadCountsBySender
        );
    }


    
    // Método para obtener conteo de mensajes no leídos
    @GetMapping("/unread-count/{userId}")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable Integer userId) {
        Long count = messageRepository.countByReceiverIdAndStatus(userId, "sent");
        return ResponseEntity.ok(Collections.singletonMap("unreadCount", count));
    }

    // --- Método para marcar un mensaje como leído vía WebSocket ---
   @PostMapping("/mark-as-read")
    public ResponseEntity<Void> markConversationAsRead(
        @RequestParam Integer senderId,
        @RequestParam Integer receiverId,
        @RequestHeader("Authorization") String token) {
        
        messageService.markConversationAsRead(senderId, receiverId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unread-counts-by-sender/{userId}")
    public ResponseEntity<Map<Integer, Long>> getUnreadCountsBySender(@PathVariable Integer userId) {
        System.out.println("DEBUG: Backend endpoint /unread-counts-by-sender called for userId=" + userId);
        // Llama al servicio para obtener el conteo de mensajes no leídos por remitente
        Map<Integer, Long> counts = messageService.getUnreadCountsBySender(userId);
            System.out.println("DEBUG: Backend returns counts: " + counts);
        return ResponseEntity.ok(counts);
    }
}
