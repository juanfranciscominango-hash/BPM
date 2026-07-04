package com.innovacred.bpm.infrastructure.adapter.rest;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/db-config")
@Slf4j
public class DatabaseConfigController {

    private static final String SRC_YML_PATH = "c:/ProyectosJava/BMP/backend/src/main/resources/application.yml";
    private static final String TARGET_YML_PATH = "c:/ProyectosJava/BMP/backend/target/classes/application.yml";

    @GetMapping
    public ResponseEntity<Map<String, String>> getDbConfig() {
        Map<String, String> config = readCurrentConfig();
        return ResponseEntity.ok(config);
    }

    @PostMapping
    public ResponseEntity<?> updateDbConfig(@RequestBody Map<String, String> newConfig) {
        String newUrl = newConfig.get("url");
        String newUsername = newConfig.get("username");
        String newPassword = newConfig.get("password");

        if (newUrl == null || newUsername == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "URL, username and password are required"));
        }

        try {
            updateYmlFile(SRC_YML_PATH, newUrl, newUsername, newPassword);
            updateYmlFile(TARGET_YML_PATH, newUrl, newUsername, newPassword);
            return ResponseEntity.ok(Map.of("message", "Database connection config updated successfully. Restart the backend to apply changes."));
        } catch (Exception e) {
            log.error("Failed to update database config file", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to update config file: " + e.getMessage()));
        }
    }

    private Map<String, String> readCurrentConfig() {
        Map<String, String> config = new HashMap<>();
        config.put("url", "");
        config.put("username", "");
        config.put("password", "");

        Path path = Paths.get(SRC_YML_PATH);
        if (!Files.exists(path)) {
            path = Paths.get(TARGET_YML_PATH);
        }

        if (Files.exists(path)) {
            try {
                List<String> lines = Files.readAllLines(path, StandardCharsets.UTF_8);
                boolean inDatasource = false;
                for (String line : lines) {
                    String trimmed = line.trim();
                    if (trimmed.equals("datasource:")) {
                        inDatasource = true;
                    } else if (inDatasource && (line.startsWith("  ") && !line.startsWith("    "))) {
                        // Left datasource block
                        inDatasource = false;
                    }

                    if (inDatasource) {
                        if (trimmed.startsWith("url:")) {
                            config.put("url", trimmed.substring(4).trim());
                        } else if (trimmed.startsWith("username:")) {
                            config.put("username", trimmed.substring(9).trim());
                        } else if (trimmed.startsWith("password:")) {
                            config.put("password", trimmed.substring(9).trim());
                        }
                    }
                }
            } catch (IOException e) {
                log.error("Error reading db config", e);
            }
        }
        return config;
    }

    private void updateYmlFile(String filePath, String url, String username, String password) throws IOException {
        Path path = Paths.get(filePath);
        if (!Files.exists(path)) {
            return;
        }

        List<String> lines = Files.readAllLines(path, StandardCharsets.UTF_8);
        List<String> updatedLines = new ArrayList<>();
        boolean inDatasource = false;

        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.equals("datasource:")) {
                inDatasource = true;
                updatedLines.add(line);
                continue;
            } else if (inDatasource && (line.startsWith("  ") && !line.startsWith("    ") && !trimmed.isEmpty())) {
                inDatasource = false;
            }

            if (inDatasource) {
                if (trimmed.startsWith("url:")) {
                    updatedLines.add("    url: " + url);
                } else if (trimmed.startsWith("username:")) {
                    updatedLines.add("    username: " + username);
                } else if (trimmed.startsWith("password:")) {
                    updatedLines.add("    password: " + password);
                } else {
                    updatedLines.add(line);
                }
            } else {
                updatedLines.add(line);
            }
        }

        Files.write(path, updatedLines, StandardCharsets.UTF_8);
    }
}
