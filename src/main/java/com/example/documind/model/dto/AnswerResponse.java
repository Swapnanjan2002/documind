package com.example.documind.model.dto;

import java.util.List;

public record AnswerResponse(String answer, List<SourceChunk> sources) {}