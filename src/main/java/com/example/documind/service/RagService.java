package com.example.documind.service;

import com.example.documind.model.dto.AnswerResponse;
import com.example.documind.model.dto.SourceChunk;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RagService {

    private final ChatClient chatClient;
    private final VectorStore vectorStore;

    public RagService(ChatClient chatClient, VectorStore vectorStore) {
        this.chatClient = chatClient;
        this.vectorStore = vectorStore;
    }

    public AnswerResponse ask(String question) {
        List<Document> docs = vectorStore.similaritySearch(
                SearchRequest.builder().query(question).topK(5).build());

        if (docs.isEmpty()) {
            return new AnswerResponse("No documents have been uploaded yet.", List.of());
        }

        String context = docs.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n---\n"));

        String answer = chatClient.prompt()
                .user(u -> u.text("Context:\n{context}\n\nQuestion: {question}")
                        .param("context", context)
                        .param("question", question))
                .call()
                .content();

        List<SourceChunk> sources = docs.stream()
                .map(d -> new SourceChunk(
                        String.valueOf(d.getMetadata().getOrDefault("filename", "unknown")),
                        snippet(d.getText())))
                .toList();

        return new AnswerResponse(answer, sources);
    }

    private String snippet(String text) {
        return text.length() > 200 ? text.substring(0, 200) + "..." : text;
    }
}