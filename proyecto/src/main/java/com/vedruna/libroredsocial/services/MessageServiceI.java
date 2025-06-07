package com.vedruna.libroredsocial.services;

import com.vedruna.libroredsocial.dto.MessageDTO;
import com.vedruna.libroredsocial.persistance.model.Message;

import java.util.List;
import java.util.Map;

public interface MessageServiceI {
    Message saveMessage(MessageDTO messageDTO); // Guarda el mensaje en la BBDD y devuelve la entidad persistida
    List<MessageDTO> getConversation(Integer user1Id, Integer user2Id); // Obtiene el historial de mensajes entre dos usuarios
    List<MessageDTO> getLatestChatsForUser(Integer userId); // Obtiene los últimos mensajes de cada chat para un usuario
    void markConversationAsRead(Integer senderId, Integer receiverId);
    
    Map<Integer, Long> getUnreadCountsBySender(Integer id); // Obtiene un mapa con el conteo de mensajes no leídos por remitente para un usuario específico
}