package com.vedruna.libroredsocial.services.impl;

import com.vedruna.libroredsocial.services.MessageServiceI;
import com.vedruna.libroredsocial.dto.MessageDTO;
import com.vedruna.libroredsocial.mapper.MessageMapper;
import com.vedruna.libroredsocial.persistance.model.Message;
import com.vedruna.libroredsocial.persistance.model.User;
import com.vedruna.libroredsocial.persistance.repository.MessageRepository;
import com.vedruna.libroredsocial.persistance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@Service
@Transactional
public class MessageServiceImpl implements MessageServiceI {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessageMapper messageMapper;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Override
    public Message saveMessage(MessageDTO messageDTO) {
        User sender = userRepository.findById(messageDTO.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(messageDTO.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(messageDTO.getContent());
        message.setSentAt(LocalDateTime.now());
        message.setStatus("sent");

        return messageRepository.save(message);
    }

    @Override
    public List<MessageDTO> getConversation(Integer user1Id, Integer user2Id) {
        // Verificar que los usuarios existan
        if (!userRepository.existsById(user1Id) || !userRepository.existsById(user2Id)) {
            throw new RuntimeException("Uno o ambos usuarios no existen");
        }
        
        List<Message> messages = messageRepository.findConversationBetweenUsers(user1Id, user2Id);
        return messages.stream()
                .map(messageMapper::toDTO)
                .sorted(Comparator.comparing(MessageDTO::getSentAt))
                .collect(Collectors.toList());
    }

    @Override
    public List<MessageDTO> getLatestChatsForUser(Integer userId) {
        List<Message> messages = messageRepository.findLatestMessagesForUser(userId);
        // Verificar que el usuario exista
        Map<String, Message> latestMessagesMap = new LinkedHashMap<>();

        for (Message m : messages) {
            // Generamos una clave que sea independiente del orden sender-receiver
            Integer id1 = m.getSender().getId();
            Integer id2 = m.getReceiver().getId();

            String chatKey = id1 < id2 ? id1 + "_" + id2 : id2 + "_" + id1;

            // Solo guardamos el primer mensaje que aparece (el más reciente) para cada chat
            if (!latestMessagesMap.containsKey(chatKey)) {
                latestMessagesMap.put(chatKey, m);
            }
        }

        // Convertimos los mensajes a DTOs y devolvemos
        return latestMessagesMap.values().stream()
            .map(messageMapper::toDTO)
            .collect(Collectors.toList());
    }



    @Override
    @Transactional // ¡Súper importante para que las actualizaciones se guarden!
    public void markConversationAsRead(Integer senderId, Integer receiverId) {
        // 1. Marcar como 'read' los mensajes que el 'receiverId' (tú) ha recibido del 'senderId' (el otro)
        // Usamos el método @Modifying del repositorio para una actualización eficiente en la DB.
        messageRepository.markConversationAsRead(senderId, receiverId);
        System.out.println("Mensajes de " + senderId + " para " + receiverId + " marcados como leídos en DB.");


        // 2. Notificar al 'senderId' (el otro) que el 'receiverId' (tú) ha leído sus mensajes.
        // Esto es para que el 'senderId' vea el '✓✓' en sus mensajes que te envió.
        // El frontend del 'senderId' (en su `ChatComponent`) estará escuchando esta señal
        // en la cola `/user/{senderId}/queue/message-status-update`.
        messagingTemplate.convertAndSendToUser(
            senderId.toString(),
            "/queue/message-status-update",
            Map.of("type", "readConfirmation", "readerId", receiverId, "senderOfReadMessages", senderId)
            // Puedes añadir 'senderOfReadMessages' para mayor claridad si lo necesitas en el frontend
        );
        System.out.println("Notificación de lectura enviada a usuario " + senderId + " para mensajes leídos por " + receiverId);
    }


    // Método para obtener conteo de mensajes no leídos por remitente
     @Override
    public Map<Integer, Long> getUnreadCountsBySender(Integer receiverId) {
        List<Object[]> results = messageRepository.countUnreadBySender(receiverId);
        Map<Integer, Long> counts = new HashMap<>();
        
        for (Object[] result : results) {
            Integer senderId = (Integer) result[0];
            Long count = (Long) result[1];
            counts.put(senderId, count);
        }
        
        return counts;
    }
}