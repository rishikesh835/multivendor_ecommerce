package com.project.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Component
public class PropertiesKeyWriter implements ApplicationRunner {

    @Override
    public void run(ApplicationArguments args) throws Exception {
        List<String> keys = new ArrayList<>();
        ClassPathResource resource = new ClassPathResource("application.properties");
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String trimmed = line.trim();
                if (trimmed.isEmpty() || trimmed.startsWith("#") || trimmed.startsWith("!")) {
                    continue;
                }
                int separator = indexOfSeparator(trimmed);
                if (separator > 0) {
                    keys.add(trimmed.substring(0, separator).trim());
                }
            }
        }

        StringBuilder markdown = new StringBuilder();
        for (String key : keys) {
            markdown.append("- ").append(key).append(System.lineSeparator());
        }
        Files.writeString(Path.of("propeties.md"), markdown.toString(), StandardCharsets.UTF_8);
    }

    private int indexOfSeparator(String line) {
        int equals = line.indexOf('=');
        int colon = line.indexOf(':');
        if (equals < 0) {
            return colon;
        }
        if (colon < 0) {
            return equals;
        }
        return Math.min(equals, colon);
    }
}
