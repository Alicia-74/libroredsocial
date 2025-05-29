package com.vedruna.libroredsocial.controllers;

import com.vedruna.libroredsocial.dto.MessageDTO;
import com.vedruna.libroredsocial.persistance.model.Message;
import com.vedruna.libroredsocial.services.MessageServiceI;

import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired
    private MessageServiceI messageService; // Inyección del servicio de mensajes
    @Autowired
    private SimpMessagingTemplate messagingTemplate; // Inyección de SimpMessagingTemplate para enviar mensajes a través de WebSockets


    // --- Endpoint REST para obtener la conversación entre dos usuarios ---
    // URL: GET /api/messages/conversation/{user1Id}/{user2Id}
    @GetMapping("/conversation/{user1Id}/{user2Id}")
    public ResponseEntity<List<MessageDTO>> getConversation(@PathVariable Integer user1Id, @PathVariable Integer user2Id) {
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
    public void sendMessage(@Payload MessageDTO message) {
        // 1. Guardar el mensaje en la DB (aquí se le asignaría un ID real)
        Message savedMessage = messageService.saveMessage(message); // Este savedMessage ya tiene el ID real y sentAt

        // 2. Enviar el mensaje al remitente (para reemplazar el temporal)
        messagingTemplate.convertAndSendToUser(
            String.valueOf(savedMessage.getSender()),
            "/queue/messages",
            savedMessage // Envía el mensaje con el ID real
        );

        // 3. Enviar el mensaje al receptor
        messagingTemplate.convertAndSendToUser(
            String.valueOf(savedMessage.getReceiver()),
            "/queue/messages",
            savedMessage // Envía el mensaje con el ID real
        );
    }


   @MessageMapping("/chat.readMessage")
    public void markMessageAsRead(@Payload MessageDTO messageDTO) {
        // Actualiza el estado a 'read' en BD (debes implementar esto en tu servicio)
        // Se asume que messageService.markMessageAsRead(messageDTO.getId()) devuelve el Message actualizado
        Message message = messageService.markMessageAsRead(messageDTO.getId());

        // Notificar a receptor y remitente el cambio de estado
        // ¡CAMBIO CLAVE AQUÍ! Ahora se envía a la cola /queue/message-status
        // Asegúrate de que message.getReceiver() y message.getSender() devuelvan objetos User
        // y que estos objetos User tengan un método getId() que retorne el ID numérico.
        messagingTemplate.convertAndSendToUser(
            message.getReceiver().getId().toString(), // Asegura que se usa el ID del receptor
            "/queue/message-status", // <-- DESTINO CORREGIDO
            message // Se envía el mensaje actualizado
        );
        messagingTemplate.convertAndSendToUser(
            message.getSender().getId().toString(), // Asegura que se usa el ID del remitente
            "/queue/message-status", // <-- DESTINO CORREGIDO
            message // Se envía el mensaje actualizado
        );
    }


}