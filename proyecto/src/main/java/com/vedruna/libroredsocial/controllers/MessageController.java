package com.vedruna.libroredsocial.controllers;

import com.vedruna.libroredsocial.dto.MessageDTO;
import com.vedruna.libroredsocial.persistance.model.Message;
import com.vedruna.libroredsocial.services.MessageServiceI;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000") // Permite solicitudes CORS desde el frontend en localhost:3000
@RestController // Indica que esta clase es un controlador REST
@RequestMapping("/api/messages") // Prefijo para las rutas HTTP de este controlador
public class MessageController {


    private MessageServiceI messageService; // Inyección del servicio de mensajes
    private SimpMessagingTemplate messagingTemplate; // Inyección de SimpMessagingTemplate para enviar mensajes a través de WebSockets


    // --- Endpoint REST para obtener la conversación entre dos usuarios ---
    // URL: GET /api/messages/conversation/{user1Id}/{user2Id}
    @GetMapping("/conversation/{user1Id}/{user2Id}")
    public ResponseEntity<List<MessageDTO>> getConversation(
            @PathVariable Integer user1Id,
            @PathVariable Integer user2Id) {
        // Llama al servicio para obtener la conversación
        List<MessageDTO> conversation = messageService.getConversation(user1Id, user2Id);
        return ResponseEntity.ok(conversation); // Devuelve la lista de mensajes con un estado 200 OK
    }

    // --- Endpoint REST para obtener los últimos chats de un usuario ---
    // URL: GET /api/messages/chats/{userId}
    @GetMapping("/chats/{userId}")
    public ResponseEntity<List<MessageDTO>> getLatestChatsForUser(@PathVariable Integer userId) {
        // Llama al servicio para obtener los últimos chats
        List<MessageDTO> latestChats = messageService.getLatestChatsForUser(userId);
        return ResponseEntity.ok(latestChats); // Devuelve la lista de chats con un estado 200 OK
    }

    // --- Endpoint WebSocket para enviar un mensaje ---
    // Los mensajes enviados por los clientes a "/app/chat.sendMessage" serán procesados por este método.
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload MessageDTO messageDTO) {
        // Guarda el mensaje en la base de datos
        Message savedMessage = messageService.saveMessage(messageDTO);

        // Envía el mensaje guardado a los usuarios involucrados en el chat en tiempo real.
        // Se envía a un destino específico para el receptor: "/user/{receiverId}/queue/messages"
        // Esto permite que el receptor reciba mensajes directos.
        messagingTemplate.convertAndSendToUser(
                messageDTO.getReceiverId().toString(), // ID del receptor como String
                "/queue/messages", // Destino específico para mensajes directos al usuario
                savedMessage // El objeto Message guardado se envía
        );

        // También podrías enviar el mensaje de vuelta al remitente para confirmación o para actualizar su UI si es necesario
        messagingTemplate.convertAndSendToUser(
                messageDTO.getSenderId().toString(),
                "/queue/messages",
                savedMessage
        );
    }
}