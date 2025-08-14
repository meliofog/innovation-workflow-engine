package com.innovation.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    // Define the root location for file uploads.
    // For development, this will create a folder named "uploads" in your project's root directory.
    private final Path rootLocation = Paths.get("uploads");

    public FileStorageService() {
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage location", e);
        }
    }

    public String storeFile(MultipartFile file) {
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("Failed to store empty file.");
            }

            // Generate a unique filename to prevent conflicts
            String originalFilename = file.getOriginalFilename();
            String uniqueFilename = UUID.randomUUID().toString() + "_" + originalFilename;

            // Resolve the final path and save the file
            Path destinationFile = this.rootLocation.resolve(Paths.get(uniqueFilename))
                    .normalize().toAbsolutePath();

            Files.copy(file.getInputStream(), destinationFile);

            return uniqueFilename; // Return the new, unique filename

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file.", e);
        }
    }

    public void deleteFile(String filename) {
        try {
            Path file = rootLocation.resolve(filename).normalize().toAbsolutePath();
            Files.deleteIfExists(file);
        } catch (NoSuchFileException e) {
            // This is not a critical error if the file is already gone
            System.out.println("Attempted to delete a file that does not exist: " + filename);
        } catch (IOException e) {
            // This is a more serious error
            throw new RuntimeException("Could not delete the file. Error: " + e.getMessage());
        }
    }
}