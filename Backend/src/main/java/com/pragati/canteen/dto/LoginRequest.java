package com.pragati.canteen.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Authentication request payload.
 * Supports registrationId, username, adminId, or email alongside the password.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    /**
     * Unique college registration ID (Student/Faculty), username, or adminId.
     */
    @JsonAlias({"username", "adminId", "userId", "email", "identifier"})
    private String registrationId;

    @NotBlank(message = "Password is required")
    private String password;

    /**
     * Retrieves the non-blank identifier from the request.
     */
    public String getIdentifier() {
        return registrationId != null ? registrationId.trim() : null;
    }
}

