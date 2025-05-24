package com.vedruna.libroredsocial.services;

import com.vedruna.libroredsocial.dto.MessageDTO;
import com.vedruna.libroredsocial.mapper.MessageMapper;
import com.vedruna.libroredsocial.persistance.model.Message;
import com.vedruna.libroredsocial.persistance.model.User;
import com.vedruna.libroredsocial.persistance.repository.MessageRepository;
import com.vedruna.libroredsocial.persistance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageServiceImpl implements MessageServiceI {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessageMapper messageMapper;

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
        message.setTimestamp(LocalDateTime.now());

        return messageRepository.save(message);
    }

    @Override
    public List<MessageDTO> getConversation(Integer user1Id, Integer user2Id) {
        List<Message> messages = messageRepository.findConversation(user1Id, user2Id);
        return messages.stream()
                .map(messageMapper::toDTO)
                .sorted(Comparator.comparing(MessageDTO::getTimestamp))
                .collect(Collectors.toList());
    }

    @Override
    public List<MessageDTO> getLatestChatsForUser(Integer userId) {
        List<Message> latestMessages = messageRepository.findLatestChatsForUser(userId);
        return latestMessages.stream()
                .map(messageMapper::toDTO)
                .collect(Collectors.toList());
    }
}