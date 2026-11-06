package com.pragati.canteen.service;

import com.pragati.canteen.dto.AuthResponse;
import com.pragati.canteen.dto.LoginRequest;
import com.pragati.canteen.dto.UserDto;
import com.pragati.canteen.entity.User;
import com.pragati.canteen.enums.Role;
import com.pragati.canteen.repository.UserRepository;
import com.pragati.canteen.security.CustomUserDetails;
import com.pragati.canteen.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Authentication and User Service
 * Handles credentials verification, JWT issuance, and user profile retrieval.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    /**
     * Unified Login for Student, Faculty, or Admin.
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String identifier = request.getIdentifier();
        if (identifier == null || identifier.isBlank()) {
            throw new BadCredentialsException("Registration ID or Username must not be empty");
        }

        User user = userRepository.findByRegistrationIdIgnoreCaseOrEmailIgnoreCase(identifier, identifier)
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials: User not found"));

        if (!user.isActive()) {
            throw new DisabledException("Account is disabled. Please contact Canteen Administration.");
        }

        // Authenticate with AuthenticationManager (BCrypt check)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getRegistrationId(), request.getPassword())
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String token = jwtUtil.generateToken(userDetails);

        log.info("User {} successfully logged in with role {}", user.getRegistrationId(), user.getRole());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .expiresIn(jwtUtil.getExpirationMs())
                .user(UserDto.fromEntity(user))
                .build();
    }

    /**
     * Specialized Admin Login endpoint verifying that the authenticating account holds the ADMIN role.
     */
    @Transactional(readOnly = true)
    public AuthResponse loginAdmin(LoginRequest request) {
        AuthResponse response = login(request);

        if (response.getUser().getRole() != Role.ADMIN) {
            log.warn("Non-admin user {} attempted login via admin endpoint", response.getUser().getRegistrationId());
            throw new BadCredentialsException("Access Denied: The provided credentials do not hold Canteen Admin privileges.");
        }

        return response;
    }

    /**
     * Retrieves currently authenticated user profile from SecurityContextHolder.
     */
    @Transactional(readOnly = true)
    public UserDto getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new BadCredentialsException("No authenticated user found in active session context");
        }

        String username = authentication.getName();
        User user = userRepository.findByRegistrationIdIgnoreCaseOrEmailIgnoreCase(username, username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found for registration ID: " + username));

        return UserDto.fromEntity(user);
    }
}

