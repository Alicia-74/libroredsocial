package com.vedruna.libroredsocial.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class MessageDTO {
    private Integer id; // ID del mensaje (puede ser nulo al crear, se asigna en el backend)
    private Integer senderId; // ID del remitente
    private Integer receiverId; // ID del receptor
    private String content; // Contenido del mensaje
    private LocalDateTime sentAt; // Fecha y hora de envío (se asigna en el backend)
    private String status; // Estado del mensaje (enviado, recibido, leído, etc.)

    // Constructor vacío (necesario para la deserialización JSON)
    public MessageDTO() {
    }

    // Constructor para enviar mensajes desde el cliente
    public MessageDTO(Integer senderId, Integer receiverId, String content) {
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.content = content;
    }

      // Si quieres un constructor completo para cuando recibes mensajes del backend
    public MessageDTO(Integer id, Integer senderId, Integer receiverId, String content, LocalDateTime sentAt, String status) {
        this.id = id;
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.content = content;
        this.sentAt = sentAt;
        this.status = status;
    }
}