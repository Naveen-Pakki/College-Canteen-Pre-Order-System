package com.pragati.canteen.controller;

import com.pragati.canteen.dto.ApiResponse;
import com.pragati.canteen.dto.AuthResponse;
import com.pragati.canteen.dto.LoginRequest;
import com.pragati.canteen.dto.UserDto;
import com.pragati.canteen.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Authentication REST Controller
 * Exposes login, session inspection, and logout endpoints.
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/login
     * Authenticates Student, Faculty, or Admin with Registration ID / Username and Password.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/admin/login
     * Specialized login for Canteen Administrators.
     */
    @PostMapping("/admin/login")
    public ResponseEntity<AuthResponse> loginAdmin(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse response = authService.loginAdmin(loginRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/auth/me
     * Returns the safe profile details of the authenticated caller.
     */
    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser() {
        UserDto currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(currentUser);
    }

    /**
     * POST /api/auth/logout
     * Clears server security context.
     * Note: In a stateless JWT architecture, the client is responsible for discarding the stored token.
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Map<String, String>>> logout() {
        SecurityContextHolder.clearContext();

        Map<String, String> data = new LinkedHashMap<>();
        data.put("action", "LOGOUT");
        data.put("strategy", "STATELESS_JWT");
        data.put("instruction", "Client must delete the stored authorization token from localStorage.");

        return ResponseEntity.ok(ApiResponse.success("User logged out successfully.", data));
    }
}

