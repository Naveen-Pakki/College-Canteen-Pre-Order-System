package com.pragati.canteen.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pragati.canteen.dto.AuthResponse;
import com.pragati.canteen.dto.LoginRequest;
import com.pragati.canteen.dto.UserDto;
import com.pragati.canteen.enums.Role;
import com.pragati.canteen.exception.GlobalExceptionHandler;
import com.pragati.canteen.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Stub service to avoid bytecode agent attachment
    private static class StubAuthService extends AuthService {
        public StubAuthService() {
            super(null, null, null);
        }

        @Override
        public AuthResponse login(LoginRequest request) {
            if ("wrongPassword".equals(request.getPassword())) {
                throw new BadCredentialsException("Invalid registration ID or password");
            }
            return AuthResponse.builder()
                    .token("mock-jwt-token")
                    .type("Bearer")
                    .expiresIn(86400000L)
                    .user(UserDto.builder()
                            .id(1L)
                            .fullName("P. Naveen Kumar")
                            .registrationId(request.getIdentifier())
                            .email("student@pragati.ac.in")
                            .role(Role.STUDENT)
                            .active(true)
                            .build())
                    .build();
        }

        @Override
        public AuthResponse loginAdmin(LoginRequest request) {
            if (!"ADMIN001".equalsIgnoreCase(request.getIdentifier())) {
                throw new BadCredentialsException("Access Denied: The provided credentials do not hold Canteen Admin privileges.");
            }
            return AuthResponse.builder()
                    .token("mock-admin-token")
                    .type("Bearer")
                    .expiresIn(86400000L)
                    .user(UserDto.builder()
                            .id(3L)
                            .fullName("Canteen Administrator")
                            .registrationId("ADMIN001")
                            .email("admin@pragati.ac.in")
                            .role(Role.ADMIN)
                            .active(true)
                            .build())
                    .build();
        }

        @Override
        public UserDto getCurrentUser() {
            return UserDto.builder()
                    .id(1L)
                    .fullName("P. Naveen Kumar")
                    .registrationId("23A91A0501")
                    .email("student@pragati.ac.in")
                    .role(Role.STUDENT)
                    .active(true)
                    .build();
        }
    }

    @BeforeEach
    void setUp() {
        AuthController authController = new AuthController(new StubAuthService());
        mockMvc = MockMvcBuilders.standaloneSetup(authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("POST /api/auth/login returns 200 OK and auth response for valid credentials")
    void testLoginSuccess() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setRegistrationId("23A91A0501");
        request.setPassword("student123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock-jwt-token"))
                .andExpect(jsonPath("$.type").value("Bearer"))
                .andExpect(jsonPath("$.user.registrationId").value("23A91A0501"))
                .andExpect(jsonPath("$.user.role").value("STUDENT"));
    }

    @Test
    @DisplayName("POST /api/auth/login with blank fields returns 400 Bad Request")
    void testLoginValidationFailure() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setPassword(""); // blank password violates @NotBlank

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Validation Failed"));
    }

    @Test
    @DisplayName("POST /api/auth/login returns 401 Unauthorized when credentials invalid")
    void testLoginBadCredentials() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setRegistrationId("23A91A0501");
        request.setPassword("wrongPassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Invalid registration ID or password"));
    }

    @Test
    @DisplayName("POST /api/auth/admin/login returns 200 OK for valid admin credentials")
    void testAdminLoginSuccess() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setRegistrationId("ADMIN001");
        request.setPassword("admin123");

        mockMvc.perform(post("/api/auth/admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock-admin-token"))
                .andExpect(jsonPath("$.user.role").value("ADMIN"));
    }

    @Test
    @DisplayName("GET /api/auth/me returns 200 OK with authenticated user profile")
    void testGetCurrentUser() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.registrationId").value("23A91A0501"))
                .andExpect(jsonPath("$.email").value("student@pragati.ac.in"));
    }

    @Test
    @DisplayName("POST /api/auth/logout returns 200 OK with logout acknowledgment")
    void testLogout() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.action").value("LOGOUT"));
    }
}
