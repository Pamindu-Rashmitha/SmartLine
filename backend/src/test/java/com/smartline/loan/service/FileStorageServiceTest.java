package com.smartline.loan.service;

import com.smartline.loan.exception.BadRequestException;
import com.smartline.loan.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class FileStorageServiceTest {

    private FileStorageService fileStorageService;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setUp() {
        fileStorageService = new FileStorageService();
        ReflectionTestUtils.setField(fileStorageService, "uploadDir", tempDir.toString());
        ReflectionTestUtils.setField(fileStorageService, "maxFileSize", 5242880L);
        fileStorageService.init();
    }

    @Test
    void storeFile_validPdf_storesFileAndReturnsResult() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "identity_doc.pdf",
                "application/pdf",
                "mock-pdf-content".getBytes()
        );

        FileStorageService.StorageResult result = fileStorageService.storeFile(101L, file);

        assertNotNull(result);
        assertEquals("identity_doc.pdf", result.getOriginalFilename());
        assertTrue(result.getStoredFilename().contains("identity_doc.pdf"));
        assertNotNull(result.getFilePath());
    }

    @Test
    void storeFile_emptyFile_throwsBadRequestException() {
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file",
                "empty.pdf",
                "application/pdf",
                new byte[0]
        );

        assertThrows(BadRequestException.class, () -> fileStorageService.storeFile(101L, emptyFile));
    }

    @Test
    void storeFile_invalidExtension_throwsBadRequestException() {
        MockMultipartFile maliciousFile = new MockMultipartFile(
                "file",
                "script.exe",
                "application/octet-stream",
                "harmful-code".getBytes()
        );

        BadRequestException ex = assertThrows(BadRequestException.class, () -> fileStorageService.storeFile(101L, maliciousFile));
        assertTrue(ex.getMessage().contains("Invalid file type"));
    }

    @Test
    void storeFile_exceedsMaxSize_throwsBadRequestException() {
        byte[] largeBytes = new byte[6 * 1024 * 1024]; // 6MB
        MockMultipartFile largeFile = new MockMultipartFile(
                "file",
                "large.pdf",
                "application/pdf",
                largeBytes
        );

        BadRequestException ex = assertThrows(BadRequestException.class, () -> fileStorageService.storeFile(101L, largeFile));
        assertTrue(ex.getMessage().contains("File exceeds maximum allowed size"));
    }

    @Test
    void loadFileAsResource_validFile_returnsReadableResource() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.png",
                "image/png",
                "image-data".getBytes()
        );

        FileStorageService.StorageResult stored = fileStorageService.storeFile(101L, file);
        Resource resource = fileStorageService.loadFileAsResource(stored.getFilePath());

        assertNotNull(resource);
        assertTrue(resource.exists());
    }

    @Test
    void loadFileAsResource_nonExistentFile_throwsResourceNotFound() {
        assertThrows(ResourceNotFoundException.class, () ->
                fileStorageService.loadFileAsResource(tempDir.resolve("non_existent_file.pdf").toString())
        );
    }
}
