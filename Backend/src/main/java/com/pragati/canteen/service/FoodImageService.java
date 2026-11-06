package com.pragati.canteen.service;

import com.pragati.canteen.exception.InvalidOperationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Service handling food image uploads, validation, and storage.
 * Easily swappable for S3 or Cloudinary in future modules.
 */
@Slf4j
@Service
public class FoodImageService {

    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

    @Value("${canteen.upload.dir:./uploads/foods}")
    private String uploadDir;

    @Value("${canteen.upload.url-prefix:/uploads/foods/}")
    private String urlPrefix;

    /**
     * Stores an uploaded food image and returns its accessible relative URL path.
     */
    public String storeImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidOperationException("Uploaded image file must not be empty.");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new InvalidOperationException("Image file size (" + (file.getSize() / 1024 / 1024) +
                    "MB) exceeds the maximum allowed limit of 5MB.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new InvalidOperationException("Invalid image type '" + contentType +
                    "'. Allowed formats: JPEG, PNG, WEBP, GIF.");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.jpg");
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex >= 0) {
            extension = originalFilename.substring(dotIndex).toLowerCase();
        } else {
            extension = ".jpg";
        }

        String uniqueFileName = UUID.randomUUID() + extension;

        try {
            Path targetDirectory = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(targetDirectory);

            Path destinationPath = targetDirectory.resolve(uniqueFileName);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationPath, StandardCopyOption.REPLACE_EXISTING);
            }

            log.info("Saved food image to: {}", destinationPath);
            return urlPrefix + uniqueFileName;
        } catch (IOException e) {
            log.error("Failed to store uploaded food image: {}", e.getMessage(), e);
            throw new InvalidOperationException("Could not store image file. Please try again later.");
        }
    }
}

