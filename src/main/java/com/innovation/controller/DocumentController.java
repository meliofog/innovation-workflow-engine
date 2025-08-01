package com.innovation.controller;

import com.innovation.domain.Document;
import com.innovation.domain.Idea;
import com.innovation.repository.DocumentRepository;
import com.innovation.repository.IdeaRepository;
import com.innovation.service.FileStorageService;
import org.camunda.bpm.engine.RuntimeService; // <-- Add this import
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Collections; // <-- Add this import
import java.util.List;

@RestController
@RequestMapping("/api")
public class DocumentController {

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private IdeaRepository ideaRepository;

    @Autowired
    private RuntimeService runtimeService; // <-- Inject RuntimeService

    // This is the NEW endpoint for uploading
    @PostMapping("/process-instances/{processInstanceId}/documents")
    public ResponseEntity<?> uploadDocumentForProcessInstance(
            @PathVariable String processInstanceId,
            @RequestParam("file") MultipartFile file) {

        Long ideaId = (Long) runtimeService.getVariable(processInstanceId, "ideaId");
        if (ideaId == null) {
            throw new RuntimeException("Could not find ideaId for process instance: " + processInstanceId);
        }

        Idea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new RuntimeException("Idea not found with id: " + ideaId));

        String fileName = fileStorageService.storeFile(file);

        Document document = new Document();
        document.setIdea(idea);
        document.setFileName(fileName);
        document.setFileType(file.getContentType());
        document.setFilePath("uploads/" + fileName);
        document.setUploadDate(LocalDateTime.now());

        documentRepository.save(document);

        return ResponseEntity.ok().body("File uploaded successfully: " + fileName);
    }

    // This is the NEW endpoint for fetching documents
    @GetMapping("/process-instances/{processInstanceId}/documents")
    public ResponseEntity<List<Document>> getDocumentsForProcessInstance(@PathVariable String processInstanceId) {
        Long ideaId = (Long) runtimeService.getVariable(processInstanceId, "ideaId");
        if (ideaId == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        List<Document> documents = documentRepository.findByIdeaId(ideaId);
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/documents/{documentId}/download")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found with id: " + documentId));
        try {
            Path filePath = Paths.get(document.getFilePath()).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(document.getFileType()))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getFileName() + "\"")
                        .body(resource);
            } else {
                throw new RuntimeException("File not found: " + document.getFileName());
            }
        } catch (Exception e) {
            throw new RuntimeException("File not found: " + document.getFileName(), e);
        }
    }
}