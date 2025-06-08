package com.vedruna.libroredsocial.security.config;


import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker // Habilita el manejo de mensajes WebSocket con un broker de mensajes
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Habilita un broker de mensajes simple en memoria.
        // Mensajes con destinos que empiezan con "/topic" o "/queue" serán enviados a los clientes.
        // "/queue" se usa para mensajes privados (específicos de usuario).
        // "/topic" se puede usar para mensajes de difusión o de sala de chat (si implementas grupos).
        config.enableSimpleBroker("/queue", "/topic");

        // Configura el prefijo para los destinos de los mensajes que se envían desde el cliente al servidor.
        // Cuando un cliente envía un mensaje a "/app/chat.sendMessage", Spring lo ruteará al método
        // @MessageMapping("/chat.sendMessage") en tu controlador.
        config.setApplicationDestinationPrefixes("/app");

        // Configura el prefijo para los destinos de mensajes que se envían a usuarios específicos.
        // Esto se usa con SimpMessagingTemplate.convertAndSendToUser().
        // Internamente, Spring transformará "/user/{userId}/queue/messages" a algo que el broker entienda.
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Registra el endpoint "/ws" para la conexión WebSocket.
        // Los clientes se conectarán a ws://localhost:8080/ws
        // .withSockJS() habilita el soporte de SockJS para navegadores que no soportan WebSockets nativos.
        registry.addEndpoint("/ws")
                .setAllowedOrigins("https://libroredsocial-amante-de-los-libros.vercel.app") // Permite conexiones desde tu frontend React
                .withSockJS();
    }
}
