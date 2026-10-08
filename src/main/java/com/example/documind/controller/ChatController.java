package com.example.documind.controller;

import com.example.documind.model.dto.AnswerResponse;
import com.example.documind.model.dto.AskRequest;
import com.example.documind.service.RagService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ChatController {

    private final RagService ragService;

    public ChatController(RagService ragService) { this.ragService = ragService; }

    @PostMapping("/ask")
    public AnswerResponse ask(@Valid @RequestBody AskRequest request) {
        return ragService.ask(request.question());
    }
}