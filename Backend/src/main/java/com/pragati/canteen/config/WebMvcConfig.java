package com.pragati.canteen.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Web MVC Configuration for serving uploaded static resources (food images).
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${canteen.upload.dir:./uploads/foods}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        String uploadResourceLocation = uploadPath.toUri().toString();

        if (!uploadResourceLocation.endsWith("/")) {
            uploadResourceLocation += "/";
        }

        registry.addResourceHandler("/uploads/foods/**")
                .addResourceLocations(uploadResourceLocation);
    }
}

