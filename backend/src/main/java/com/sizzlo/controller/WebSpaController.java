package com.sizzlo.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Controller
public class WebSpaController {

    private volatile String cachedIndexHtml;

    @GetMapping(value = {
        "/",
        "/admin",
        "/admin/**",
        "/login",
        "/dashboard",
        "/members",
        "/coupons",
        "/reservations",
        "/payments",
        "/billing",
        "/loyalty",
        "/sales",
        "/banquets",
        "/outlets",
        "/marketing",
        "/staff",
        "/reports",
        "/settings"
    }, produces = MediaType.TEXT_HTML_VALUE)
    @ResponseBody
    public ResponseEntity<String> serveAdminSpa() {
        if (cachedIndexHtml != null) {
            return ResponseEntity.ok(cachedIndexHtml);
        }
        try {
            Resource resource = new ClassPathResource("static/index.html");
            if (!resource.exists()) {
                resource = new ClassPathResource("index.html");
            }
            if (resource.exists()) {
                try (InputStream is = resource.getInputStream()) {
                    cachedIndexHtml = StreamUtils.copyToString(is, StandardCharsets.UTF_8);
                    return ResponseEntity.ok(cachedIndexHtml);
                }
            }
        } catch (IOException ignored) {}
        return ResponseEntity.ok("<!DOCTYPE html><html><head><meta http-equiv='refresh' content='0; url=index.html'></head><body>Loading Sizzlo Admin...</body></html>");
    }
}
