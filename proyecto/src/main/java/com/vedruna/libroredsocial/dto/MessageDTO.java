package com.vedruna.libroredsocial.dto;

import java.time.LocalDateTime;

// No usamos @Data de Lombok aquí, porque no queremos que se generen setters para campos que no se envían desde el cliente,
// como id o sentAt (que se generan en el backend).
public class MessageDTO {
    private Integer id; // ID del mensaje (puede ser nulo al crear, se asigna en el backend)
    private Integer senderId; // ID del remitente
    private Integer receiverId; // ID del receptor
    private String content; // Contenido del mensaje
    private LocalDateTime sentAt; // Fecha y hora de envío (se asigna en el backend)

    // Constructor vacío (necesario para la deserialización JSON)
    public MessageDTO() {
    }

    // Constructor para enviar mensajes desde el cliente
    public MessageDTO(Integer senderId, Integer receiverId, String content) {
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.content = content;
    }

    // Getters y setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getSenderId() {
        return senderId;
    }

    public void setSenderId(Integer senderId) {
        this.senderId = senderId;
    }

    public Integer getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(Integer receiverId) {
        this.receiverId = receiverId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }
}