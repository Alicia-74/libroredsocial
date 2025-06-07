package com.vedruna.libroredsocial.mapper;

import com.vedruna.libroredsocial.dto.MessageDTO;
import com.vedruna.libroredsocial.persistance.model.Message;
import org.springframework.stereotype.Component; // ¡Importante!

@Component // Marca esta clase como un bean de Spring
public class MessageMapper {

    public MessageDTO toDTO(Message message) {
        if (message == null) {
            return null;
        }
        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        //  message.getSender() y message.getReceiver() no sean nulos
        dto.setSenderId(message.getSender() != null ? message.getSender().getId() : null);
        dto.setReceiverId(message.getReceiver() != null ? message.getReceiver().getId() : null);
        dto.setContent(message.getContent());
        dto.setSentAt(message.getSentAt());
        dto.setStatus(message.getStatus()); 
        return dto;
    }

    public Message toEntity(MessageDTO messageDTO) {
        if (messageDTO == null) {
            return null;
        }
        Message entity = new Message();
        // ID se genera en la DB, no se setea al crear la entidad desde el DTO
        // entity.setId(messageDTO.getId()); // No descomentar si el ID se genera en la DB

        // Sender y Receiver serán objetos User, no IDs.
        // Esto lo manejará tu servicio, buscando el User por ID
        // y seteando el objeto User completo aquí.
        // Por eso, el DTO solo tiene los IDs.

        entity.setContent(messageDTO.getContent());
        // sentAt y status se pueden establecer en la entidad por @PrePersist
        // o aquí si quieres un control más explícito desde el DTO
        if (messageDTO.getSentAt() != null) {
            entity.setSentAt(messageDTO.getSentAt());
        }
        if (messageDTO.getStatus() != null) {
            entity.setStatus(messageDTO.getStatus());
        }
        return entity;
    }
}