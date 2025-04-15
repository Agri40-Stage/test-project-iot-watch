package com.mycompany.myapp.web.rest;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mycompany.myapp.security.AuthoritiesConstants;
import java.io.File;
import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sensor")
public class SensorController {

    private static final String FILE_PATH = "src/main/resources/data/history.json";
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "', '" + AuthoritiesConstants.USER + "')")
    @GetMapping("/latest")
    public ResponseEntity<?> getLatestReading() {
        try {
            File file = new File(FILE_PATH);
            if (!file.exists()) {
                // Créer le dossier parent s'il n'existe pas
                file.getParentFile().mkdirs();
                // Créer le fichier avec un tableau vide
                objectMapper.writeValue(file, Collections.emptyList());
            }

            List<Map<String, Object>> readings = objectMapper.readValue(file, new TypeReference<List<Map<String, Object>>>() {});

            if (readings.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
            }

            Map<String, Object> latest = readings.get(readings.size() - 1);
            return ResponseEntity.ok(latest);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to read data."));
        }
    }

    @PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "', '" + AuthoritiesConstants.USER + "')")
    @GetMapping("/history")
    public ResponseEntity<List<Map<String, Object>>> getAllSensorHistory() {
        try {
            File file = new File(FILE_PATH);
            if (!file.exists()) {
                // Créer le dossier parent s'il n'existe pas
                file.getParentFile().mkdirs();
                // Créer le fichier avec un tableau vide
                objectMapper.writeValue(file, Collections.emptyList());
            }

            List<Map<String, Object>> history = objectMapper.readValue(file, new TypeReference<>() {});
            return ResponseEntity.ok(history);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
