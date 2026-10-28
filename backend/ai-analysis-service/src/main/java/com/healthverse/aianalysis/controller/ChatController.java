package com.healthverse.aianalysis.controller;

import com.healthverse.aianalysis.dto.ChatRequest;
import com.healthverse.aianalysis.dto.ChatResponse;
import com.healthverse.aianalysis.exception.BadRequestException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.security.core.Authentication;
import java.util.Map;

@RestController
@RequestMapping("/api/analysis/chat")
public class ChatController {

    private final RestTemplate restTemplate;

    public ChatController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    private void checkAuth(Authentication authentication) {
        if (authentication == null) {
            throw new BadRequestException("User is not authenticated");
        }
    }

    @PostMapping
    public ResponseEntity<ChatResponse> chat(
            Authentication authentication,
            @RequestBody Map<String, Object> payload) {
        checkAuth(authentication);

        ChatRequest request = new ChatRequest();
        if (payload.containsKey("message")) {
            request.setQuery(payload.get("message").toString());
        } else if (payload.containsKey("query")) {
            request.setQuery(payload.get("query").toString());
        } else {
            throw new BadRequestException("Chat request must contain 'message' or 'query'");
        }

        try {
            String aiAgentUrl = System.getenv("AI_AGENT_URL");
            if (aiAgentUrl == null || aiAgentUrl.isBlank()) {
                aiAgentUrl = "http://localhost:8000";
            }
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    aiAgentUrl + "/api/v1/agents/chat",
                    request,
                    Map.class
            );
            Map<String, Object> body = response.getBody();
            
            ChatResponse chatRes = new ChatResponse();
            if (body != null) {
                chatRes.setResponse((String) body.getOrDefault("response", "No response"));
                chatRes.setDisclaimer((String) body.getOrDefault("disclaimer", "AI Health Assistant"));
                Object recommendPro = body.get("recommend_professional");
                chatRes.setRecommend_professional(
                    recommendPro != null && Boolean.parseBoolean(recommendPro.toString())
                );
            }
            return ResponseEntity.ok(chatRes);
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            throw new org.springframework.web.server.ResponseStatusException(
                e.getStatusCode(), e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR, "AI Service communication failed: " + e.getMessage(), e);
        }
    }
}
