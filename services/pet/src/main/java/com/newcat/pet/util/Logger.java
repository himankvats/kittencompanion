package com.newcat.pet.util;

/**
 * Structured JSON logging utility. Outputs CloudWatch-compatible log lines
 * with timestamp, level, service name, and key-value context pairs.
 * See TDD Section 10.1 for logging specification.
 */

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.time.Instant;

public class Logger {

    private final String className;
    private static final ObjectMapper mapper = new ObjectMapper();

    public Logger(Class<?> clazz) {
        this.className = clazz.getSimpleName();
    }

    /** Logs an INFO-level message with optional key-value pairs. */
    public void info(String message, Object... keyValues) {
        log("INFO", message, null, keyValues);
    }

    /** Logs a WARN-level message. */
    public void warn(String message, Object... keyValues) {
        log("WARN", message, null, keyValues);
    }

    /** Logs an ERROR-level message with the exception. */
    public void error(String message, Exception e, Object... keyValues) {
        log("ERROR", message, e, keyValues);
    }

    private void log(String level, String message, Exception e, Object... keyValues) {
        try {
            ObjectNode entry = mapper.createObjectNode();
            entry.put("timestamp", Instant.now().toString());
            entry.put("level", level);
            entry.put("service", "pet");
            entry.put("class", className);
            entry.put("message", message);

            // Add key-value pairs
            for (int i = 0; i + 1 < keyValues.length; i += 2) {
                entry.put(String.valueOf(keyValues[i]), String.valueOf(keyValues[i + 1]));
            }

            if (e != null) {
                entry.put("error", e.getMessage());
                entry.put("errorClass", e.getClass().getSimpleName());
            }

            System.out.println(mapper.writeValueAsString(entry));
        } catch (Exception ex) {
            System.out.println(level + " " + message);
        }
    }
}
