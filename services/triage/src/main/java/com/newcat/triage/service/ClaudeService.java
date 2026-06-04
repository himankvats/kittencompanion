package com.newcat.triage.service;

/**
 * Calls Claude claude-3-5-sonnet-20241022 via AWS Bedrock Runtime.
 * Builds JSON request payload, invokes model, and parses response text.
 * See TDD Section 4.1 for client specification and prompt format.
 */

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.services.bedrockruntime.BedrockRuntimeClient;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelRequest;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelResponse;

@Service
public class ClaudeService {

    private static final Logger log = LoggerFactory.getLogger(ClaudeService.class);
    private static final String MODEL_ID = "anthropic.claude-3-5-sonnet-20241022-v2:0";
    private final ObjectMapper mapper = new ObjectMapper();

    private BedrockRuntimeClient client;

    private BedrockRuntimeClient getClient() {
        if (client == null) {
            client = BedrockRuntimeClient.builder().build();
        }
        return client;
    }

    /**
     * Calls Claude via Bedrock. Falls back to rule-based guidance when
     * Bedrock is unavailable (no AWS credentials in local dev).
     */
    public String callClaude(String systemPrompt, String userPrompt, int maxTokens) {
        try {
            SdkBytes payload = buildRequestPayload(systemPrompt, userPrompt, maxTokens);
            InvokeModelRequest request = InvokeModelRequest.builder()
                    .modelId(MODEL_ID)
                    .body(payload)
                    .build();
            InvokeModelResponse response = getClient().invokeModel(request);
            return parseResponse(response);
        } catch (Exception e) {
            log.warn("Bedrock unavailable ({}), using rule-based fallback: {}", e.getClass().getSimpleName(), e.getMessage());
            return generateFallbackGuidance(userPrompt);
        }
    }

    /**
     * Generates deterministic guidance from the prompt context when Bedrock is unavailable.
     * Extracts concern type and template from the prompt built by TemplateService.
     */
    private String generateFallbackGuidance(String userPrompt) {
        String concern = extractLine(userPrompt, "Concern:");
        String template = extractLine(userPrompt, "Template guidance:");

        // Urgent
        if ("urgent".equals(template)) {
            return "This situation needs prompt veterinary attention.\n\n" +
                   "• Contact your vet or an emergency clinic as soon as possible\n" +
                   "• Describe all symptoms clearly — when they started and how severe\n" +
                   "• Keep your kitten calm and warm until you can be seen\n" +
                   "• Do not give any human medications\n\n" +
                   "**Do not delay** — prompt care makes a significant difference.";
        }

        // Benign (manage at home)
        if ("benign".equals(template)) {
            return "This sounds like a normal adjustment behaviour for a newly adopted kitten.\n\n" +
                   "• Give your kitten quiet time in a safe, low-stress space\n" +
                   "• Ensure fresh water and food are easily accessible\n" +
                   "• Avoid forcing interaction — let them come to you on their own terms\n" +
                   "• This typically resolves within 24–72 hours as they settle in\n\n" +
                   "Monitor closely and flag again if symptoms worsen or last more than 48 hours.";
        }

        // Concern-specific watch guidance
        return switch (concern) {
            case "not eating" -> "It's natural to worry when your kitten isn't eating normally.\n\n" +
                    "• Offer food in a quiet spot away from noise and other pets\n" +
                    "• Try warming wet food slightly to enhance the scent\n" +
                    "• Offer small portions 3–4 times daily rather than one large meal\n" +
                    "• Track water intake — hydration is critical\n\n" +
                    "If your kitten hasn't eaten in 48 hours or shows lethargy or vomiting, contact your vet.";
            case "vomiting" -> "Occasional vomiting can occur in kittens, but needs monitoring.\n\n" +
                    "• Withhold food for 2–3 hours then offer a small bland meal\n" +
                    "• Ensure fresh water is available at all times\n" +
                    "• Check that your kitten hasn't eaten something unusual\n" +
                    "• Do not give human medications\n\n" +
                    "If vomiting continues more than 4 times in 24 hours or you notice blood, contact your vet today.";
            case "litter problems" -> "Litter changes are common after diet changes or stress.\n\n" +
                    "• Keep the litter box clean — scoop at least twice daily\n" +
                    "• Ensure there is one litter box per cat plus one extra\n" +
                    "• Avoid switching food again right now\n" +
                    "• A teaspoon of plain pumpkin purée can help with loose stools\n\n" +
                    "If diarrhea persists beyond 48 hours or you see blood, contact your vet.";
            case "hiding withdrawn" -> "Hiding is a normal stress response, especially in newly adopted kittens.\n\n" +
                    "• Don't force your kitten out — let them come out when ready\n" +
                    "• Place food, water, and a litter box near their hiding spot\n" +
                    "• Sit quietly nearby and speak softly\n" +
                    "• Give it 48–72 hours before worrying\n\n" +
                    "If hiding is combined with not eating or litter changes, contact your vet.";
            case "eye ear issue" -> "Eye and ear symptoms often indicate mild infection.\n\n" +
                    "• Gently wipe discharge with a warm damp cloth\n" +
                    "• Do not insert anything into the ear canal\n" +
                    "• Keep the area clean and dry\n" +
                    "• Do not use over-the-counter drops without vet guidance\n\n" +
                    "If symptoms worsen or your kitten is constantly scratching, see your vet this week.";
            default -> "Thank you for flagging this concern about your kitten.\n\n" +
                    "• Monitor your kitten closely over the next 24–48 hours\n" +
                    "• Note any changes in eating, litter use, or energy level\n" +
                    "• Ensure fresh water and food are available\n" +
                    "• Keep their environment calm and stress-free\n\n" +
                    "If symptoms worsen or you notice additional signs of distress, contact your vet promptly.";
        };
    }

    private String extractLine(String prompt, String prefix) {
        for (String line : prompt.split("\n")) {
            if (line.trim().startsWith(prefix)) {
                return line.substring(line.indexOf(prefix) + prefix.length()).trim();
            }
        }
        return "";
    }

    /**
     * Builds the Bedrock request payload JSON as SdkBytes.
     * Format: anthropic_version, max_tokens, optional system, messages array.
     */
    SdkBytes buildRequestPayload(String systemPrompt, String userPrompt, int maxTokens) {
        try {
            ObjectNode payload = mapper.createObjectNode();
            payload.put("anthropic_version", "bedrock-2023-05-31");
            payload.put("max_tokens", maxTokens);
            if (systemPrompt != null && !systemPrompt.isBlank()) {
                payload.put("system", systemPrompt);
            }
            ArrayNode messages = mapper.createArrayNode();
            ObjectNode msg = mapper.createObjectNode();
            msg.put("role", "user");
            msg.put("content", userPrompt);
            messages.add(msg);
            payload.set("messages", messages);
            return SdkBytes.fromUtf8String(payload.toString());
        } catch (Exception e) {
            throw new RuntimeException("Failed to build Claude request payload", e);
        }
    }

    /**
     * Parses the text from the first content block of the Bedrock response.
     */
    String parseResponse(InvokeModelResponse response) {
        try {
            JsonNode json = mapper.readTree(response.body().asByteArray());
            return json.get("content").get(0).get("text").asText();
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Claude response", e);
        }
    }
}
