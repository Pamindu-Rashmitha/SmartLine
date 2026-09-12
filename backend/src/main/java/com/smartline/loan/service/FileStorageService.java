package com.smartline.loan.service;

import com.smartline.loan.exception.BadRequestException;
import com.smartline.loan.exception.ResourceNotFoundException;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

    @Value("${app.file.upload-dir:./uploads/documents}")
    private String uploadDir;

    @Value("${app.file.max-file-size:5242880}")
    private long maxFileSize;

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            "pdf", "jpg", "jpeg", "png", "webp"
    );

    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
            "application/pdf", "image/jpeg", "image/png", "image/webp"
    );

    @PostConstruct
    public void init() {
        try {
            Path rootPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(rootPath);
            log.info("Initialized document storage root at: {}", rootPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage directory", e);
        }
    }

    public StorageResult storeFile(Long applicationId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Cannot upload an empty file");
        }

        if (file.getSize() > maxFileSize) {
            throw new BadRequestException("File exceeds maximum allowed size of 5MB");
        }

        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        if (originalFilename.contains("..")) {
            throw new BadRequestException("Filename contains invalid path sequence: " + originalFilename);
        }

        // Validate extension
        String extension = "";
        int extIndex = originalFilename.lastIndexOf(".");
        if (extIndex > 0) {
            extension = originalFilename.substring(extIndex + 1).toLowerCase();
        }

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("Invalid file type: ." + extension + ". Allowed: " + ALLOWED_EXTENSIONS);
        }

        // Validate MIME type
        String contentType = file.getContentType();
        if (contentType != null && !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            log.warn("MIME type {} not in strict list, checking extension validity", contentType);
        }

        try {
            Path appFolder = Paths.get(uploadDir, String.valueOf(applicationId)).toAbsolutePath().normalize();
            Files.createDirectories(appFolder);

            String storedFilename = UUID.randomUUID().toString() + "_" + originalFilename;
            Path targetLocation = appFolder.resolve(storedFilename);

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return new StorageResult(originalFilename, storedFilename, targetLocation.toString(), file.getSize(), file.getContentType());
        } catch (IOException e) {
            log.error("Failed to store file for application ID {}: {}", applicationId, e.getMessage());
            throw new RuntimeException("Could not store file: " + originalFilename, e);
        }
    }

    public StorageResult storePaymentSlip(Long facilityId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Cannot upload an empty file");
        }

        if (file.getSize() > maxFileSize) {
            throw new BadRequestException("File exceeds maximum allowed size of 5MB");
        }

        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        if (originalFilename.contains("..")) {
            throw new BadRequestException("Filename contains invalid path sequence: " + originalFilename);
        }

        String extension = "";
        int extIndex = originalFilename.lastIndexOf(".");
        if (extIndex > 0) {
            extension = originalFilename.substring(extIndex + 1).toLowerCase();
        }

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("Invalid file type: ." + extension + ". Allowed: " + ALLOWED_EXTENSIONS);
        }

        try {
            Path slipFolder = Paths.get(uploadDir, "slips", String.valueOf(facilityId)).toAbsolutePath().normalize();
            Files.createDirectories(slipFolder);

            String storedFilename = UUID.randomUUID().toString() + "_" + originalFilename;
            Path targetLocation = slipFolder.resolve(storedFilename);

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return new StorageResult(originalFilename, storedFilename, targetLocation.toString(), file.getSize(), file.getContentType());
        } catch (IOException e) {
            log.error("Failed to store payment slip for facility ID {}: {}", facilityId, e.getMessage());
            throw new RuntimeException("Could not store payment slip: " + originalFilename, e);
        }
    }

    public Resource loadFileAsResource(String filePath) {
        try {
            Path file = Paths.get(filePath).normalize();
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File", "path", filePath);
            }
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("File", "path", filePath);
        }
    }

    public void deleteFile(String filePath) {
        if (filePath == null) return;
        try {
            Path path = Paths.get(filePath);
            Files.deleteIfExists(path);
        } catch (IOException e) {
            log.warn("Could not delete file at {}: {}", filePath, e.getMessage());
        }
    }

    public static class StorageResult {
        private final String originalFilename;
        private final String storedFilename;
        private final String filePath;
        private final long fileSize;
        private final String contentType;

        public StorageResult(String originalFilename, String storedFilename, String filePath, long fileSize, String contentType) {
            this.originalFilename = originalFilename;
            this.storedFilename = storedFilename;
            this.filePath = filePath;
            this.fileSize = fileSize;
            this.contentType = contentType;
        }

        public String getOriginalFilename() {
            return originalFilename;
        }

        public String getStoredFilename() {
            return storedFilename;
        }

        public String getFilePath() {
            return filePath;
        }

        public long getFileSize() {
            return fileSize;
        }

        public String getContentType() {
            return contentType;
        }
    }
}
