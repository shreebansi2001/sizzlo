package com.sizzlo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String uploadDir = new File("uploads").getAbsolutePath();
        if (!uploadDir.endsWith(File.separator)) {
            uploadDir += File.separator;
        }
        registry.addResourceHandler("/api/uploads/**")
                .addResourceLocations("file:" + uploadDir);
    }
}
