package com.example.documind.controller;

import com.example.documind.service.IngestionService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class DocumentController {

    private final IngestionService ingestion;

    public DocumentController(IngestionService ingestion) { this.ingestion = ingestion; }

    @PostMapping("/documents")
    public Map<String, Object> upload(@RequestParam("file") MultipartFile file) {
        return Map.of("filename", file.getOriginalFilename(), "chunks", ingestion.ingest(file));
    }
}