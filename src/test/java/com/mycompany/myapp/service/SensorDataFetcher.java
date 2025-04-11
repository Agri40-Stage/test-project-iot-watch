package com.mycompany.myapp.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.File;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class SensorDataFetcher {

    private static final String API_URL = "https://api.open-meteo.com/v1/forecast?latitude=35.68&longitude=-0.6&current=temperature_2m";
    private static final String FILE_PATH = "src/main/resources/data/history.json";
    private static final int MAX_ENTRIES = 1000;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    @Scheduled(fixedRate = 30000) // كل 30 ثانية
    public void fetchSensorData() {
        try {
            // Call API
            ResponseEntity<JsonNode> response = restTemplate.getForEntity(API_URL, JsonNode.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                double temperature = response.getBody().path("current").path("temperature_2m").asDouble();

                Map<String, Object> reading = new HashMap<>();
                reading.put("timestamp", Instant.now().toString());
                reading.put("temperature", temperature);

                // Load existing history
                File file = new File(FILE_PATH);
                List<Map<String, Object>> history = new ArrayList<>();
                if (file.exists()) {
                    history = objectMapper.readValue(file, new TypeReference<>() {});
                }

                // Add new reading
                history.add(reading);

                // Keep only last 1000 entries
                if (history.size() > MAX_ENTRIES) {
                    history = history.subList(history.size() - MAX_ENTRIES, history.size());
                }

                // Save back to file
                objectMapper.writerWithDefaultPrettyPrinter().writeValue(file, history);
            }
        } catch (Exception e) {
            System.err.println("Erreur lors du fetch des données: " + e.getMessage());
        }
    }
}
