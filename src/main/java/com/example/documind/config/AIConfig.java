package com.example.documind.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AIConfig {

    @Bean
    public ChatClient chatClient(ChatClient.Builder builder) {
        return builder
                .defaultSystem("""
                You are a document assistant. Answer ONLY using the provided context.
                If the answer is not in the context, say you don't know.
                """)
                .build();
    }
}