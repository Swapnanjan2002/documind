package com.example.documind.service;

import org.springframework.ai.document.Document;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class IngestionService {

    private final VectorStore vectorStore;

    public IngestionService(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    public int ingest(MultipartFile file) {
        var reader = new TikaDocumentReader(file.getResource());
        List<Document> chunks = new TokenTextSplitter().apply(reader.get());
        chunks.forEach(c -> c.getMetadata().put("filename", file.getOriginalFilename()));
        vectorStore.add(chunks);
        return chunks.size();
    }
}