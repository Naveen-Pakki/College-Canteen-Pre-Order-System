package com.pragati.canteen.service;

import com.pragati.canteen.dto.AuthResponse;
import com.pragati.canteen.dto.LoginRequest;
import com.pragati.canteen.dto.UserDto;
import com.pragati.canteen.entity.User;
import com.pragati.canteen.enums.Role;
import com.pragati.canteen.repository.UserRepository;
import com.pragati.canteen.security.CustomUserDetails;
import com.pragati.canteen.security.JwtUtil;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.lang.reflect.Proxy;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AuthServiceTest {

    private AuthService authService;
    private final Map<String, User> userDatabase = new HashMap<>();

    private User sampleStudent;
    private User sampleAdmin;
    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        userDatabase.clear();

        sampleStudent = User.builder()
                .id(1L)
                .fullName("P. Naveen Kumar")
                .registrationId("23A91A0501")
                .email("student@pragati.ac.in")
                .password("$2a$12$sampleEncodedHash")
                .role(Role.STUDENT)
                .active(true)
                .build();

        sampleAdmin = User.builder()
                .id(2L)
                .fullName("Canteen Admin")
                .registrationId("ADMIN001")
                .email("admin@pragati.ac.in")
                .password("$2a$12$sampleEncodedHash")
                .role(Role.ADMIN)
                .active(true)
                .build();

        userDatabase.put("23a91a0501", sampleStudent);
        userDatabase.put("student@pragati.ac.in", sampleStudent);
        userDatabase.put("admin001", sampleAdmin);
        userDatabase.put("admin@pragati.ac.in", sampleAdmin);

        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "jwtSecret", "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwtUtil, "jwtExpirationMs", 3600000L);
        jwtUtil.init();

        UserRepository fakeUserRepository = (UserRepository) Proxy.newProxyInstance(
                UserRepository.class.getClassLoader(),
                new Class<?>[]{UserRepository.class},
                (proxy, method, args) -> {
                    if ("findByRegistrationIdIgnoreCaseOrEmailIgnoreCase".equals(method.getName())) {
                        String id = (String) args[0];
                        if (id == null) return Optional.empty();
                        return Optional.ofNullable(userDatabase.get(id.toLowerCase()));
                    }
                    return null;
                }
        );

        AuthenticationManager testAuthManager = authentication -> {
            String principal = (String) authentication.getPrincipal();
            String credentials = (String) authentication.getCredentials();

            if ("wrongPassword".equals(credentials)) {
                throw new BadCredentialsException("Bad credentials: password mismatch");
            }

            User user = userDatabase.get(principal.toLowerCase());
            if (user == null) {
                throw new BadCredentialsException("User not found: " + principal);
            }

            CustomUserDetails userDetails = new CustomUserDetails(user);
            return new UsernamePasswordAuthenticationToken(userDetails, credentials, userDetails.getAuthorities());
        };

        authService = new AuthService(testAuthManager, fakeUserRepository, jwtUtil);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Successful login returns valid AuthResponse with token and user profile")
    void testSuccessfulLogin() {
        LoginRequest request = new LoginRequest();
        request.setRegistrationId("23A91A0501");
        request.setPassword("student123");

        AuthResponse response = authService.login(request);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isNotBlank();
        assertThat(response.getType()).isEqualTo("Bearer");
        assertThat(response.getUser().getRegistrationId()).isEqualTo("23A91A0501");
        assertThat(response.getUser().getRole()).isEqualTo(Role.STUDENT);
        assertThat(response.getUser().getEmail()).isEqualTo("student@pragati.ac.in");
    }

    @Test
    @DisplayName("Login fails when user is not found")
    void testLoginUserNotFound() {
        LoginRequest request = new LoginRequest();
        request.setRegistrationId("UNKNOWN999");
        request.setPassword("anyPassword");

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("Invalid credentials: User not found");
    }

    @Test
    @DisplayName("Login fails when account is deactivated")
    void testLoginDisabledAccount() {
        sampleStudent.setActive(false);

        LoginRequest request = new LoginRequest();
        request.setRegistrationId("23A91A0501");
        request.setPassword("student123");

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(DisabledException.class)
                .hasMessageContaining("Account is disabled");
    }

    @Test
    @DisplayName("Login fails with bad password")
    void testLoginBadPassword() {
        LoginRequest request = new LoginRequest();
        request.setRegistrationId("23A91A0501");
        request.setPassword("wrongPassword");

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("password mismatch");
    }

    @Test
    @DisplayName("Admin login succeeds for user with ADMIN role")
    void testLoginAdminSuccess() {
        LoginRequest request = new LoginRequest();
        request.setRegistrationId("ADMIN001");
        request.setPassword("admin123");

        AuthResponse response = authService.loginAdmin(request);

        assertThat(response).isNotNull();
        assertThat(response.getUser().getRole()).isEqualTo(Role.ADMIN);
        assertThat(response.getUser().getRegistrationId()).isEqualTo("ADMIN001");
    }

    @Test
    @DisplayName("Admin login rejects non-admin users (e.g. STUDENT)")
    void testLoginAdminRejectsStudent() {
        LoginRequest request = new LoginRequest();
        request.setRegistrationId("23A91A0501");
        request.setPassword("student123");

        assertThatThrownBy(() -> authService.loginAdmin(request))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("Access Denied: The provided credentials do not hold Canteen Admin privileges.");
    }

    @Test
    @DisplayName("getCurrentUser returns authenticated user DTO")
    void testGetCurrentUser() {
        CustomUserDetails userDetails = new CustomUserDetails(sampleStudent);
        Authentication auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        UserDto userDto = authService.getCurrentUser();

        assertThat(userDto).isNotNull();
        assertThat(userDto.getRegistrationId()).isEqualTo("23A91A0501");
        assertThat(userDto.getEmail()).isEqualTo("student@pragati.ac.in");
    }

    @Test
    @DisplayName("getCurrentUser throws BadCredentialsException when unauthenticated")
    void testGetCurrentUserUnauthenticated() {
        SecurityContextHolder.clearContext();

        assertThatThrownBy(() -> authService.getCurrentUser())
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("No authenticated user found in active session context");
    }
}
