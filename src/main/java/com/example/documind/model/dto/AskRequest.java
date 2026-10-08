package com.example.documind.model.dto;

import jakarta.validation.constraints.NotBlank;

public record AskRequest(@NotBlank(message = "question must not be blank") String question) {}
