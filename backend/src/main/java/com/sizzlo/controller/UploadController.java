package com.sizzlo.controller;

import com.sizzlo.dto.ApiResponse;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class UploadController {

    private static final String UPLOAD_DIR = "uploads";

    public UploadController() {
        File dir = new File(UPLOAD_DIR);
        if (!dir.exists()) {
            dir.mkdirs();
        }
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", required = false, defaultValue = "general") String category) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Please provide a valid file"));
        }

        try {
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String cleanCategory = category.replaceAll("[^a-zA-Z0-9_-]", "");
            String newFilename = cleanCategory + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;
            Path targetPath = Paths.get(UPLOAD_DIR, newFilename);

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "/api/uploads/" + newFilename;

            Map<String, String> response = new HashMap<>();
            response.put("filename", newFilename);
            response.put("url", fileUrl);
            response.put("originalName", originalFilename);
            response.put("size", String.valueOf(file.getSize()));

            return ResponseEntity.ok(ApiResponse.success("File uploaded successfully", response));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to store file: " + e.getMessage()));
        }
    }
}
