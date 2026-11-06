package com.pragati.canteen.security;

import com.pragati.canteen.entity.User;
import com.pragati.canteen.enums.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private final String secret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "jwtSecret", secret);
        ReflectionTestUtils.setField(jwtUtil, "jwtExpirationMs", 3600000L); // 1 hour
        jwtUtil.init();
    }

    @Test
    @DisplayName("Generate token for Student and verify extracted claims")
    void testGenerateTokenForStudent() {
        User student = User.builder()
                .id(1L)
                .fullName("P. Naveen Kumar")
                .registrationId("23A91A0501")
                .email("student@pragati.ac.in")
                .role(Role.STUDENT)
                .active(true)
                .build();
        CustomUserDetails userDetails = new CustomUserDetails(student);

        String token = jwtUtil.generateToken(userDetails);

        assertThat(token).isNotBlank();
        assertThat(jwtUtil.validateToken(token)).isTrue();
        assertThat(jwtUtil.extractUsername(token)).isEqualTo("23A91A0501");
        assertThat(jwtUtil.extractRole(token)).isEqualTo("STUDENT");
        assertThat(jwtUtil.validateToken(token, userDetails)).isTrue();
    }

    @Test
    @DisplayName("Generate token for Faculty and Admin and verify role extraction")
    void testGenerateTokenForFacultyAndAdmin() {
        User faculty = User.builder()
                .id(2L)
                .fullName("Dr. K. Srinivas")
                .registrationId("FAC1024")
                .email("srinivas.faculty@pragati.ac.in")
                .role(Role.FACULTY)
                .active(true)
                .build();
        String facultyToken = jwtUtil.generateToken(new CustomUserDetails(faculty));
        assertThat(jwtUtil.extractRole(facultyToken)).isEqualTo("FACULTY");

        User admin = User.builder()
                .id(3L)
                .fullName("Canteen Administrator")
                .registrationId("ADMIN001")
                .email("canteen.admin@pragati.ac.in")
                .role(Role.ADMIN)
                .active(true)
                .build();
        String adminToken = jwtUtil.generateToken(new CustomUserDetails(admin));
        assertThat(jwtUtil.extractRole(adminToken)).isEqualTo("ADMIN");
    }

    @Test
    @DisplayName("Verify rejection of tampered or invalid token")
    void testTamperedTokenValidation() {
        User student = User.builder()
                .id(1L)
                .registrationId("23A91A0501")
                .role(Role.STUDENT)
                .active(true)
                .build();
        String validToken = jwtUtil.generateToken(new CustomUserDetails(student));
        String tamperedToken = validToken + "corrupted";

        assertThat(jwtUtil.validateToken(tamperedToken)).isFalse();
    }

    @Test
    @DisplayName("Verify expired token is identified correctly")
    void testExpiredToken() {
        JwtUtil shortLivedJwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(shortLivedJwtUtil, "jwtSecret", secret);
        ReflectionTestUtils.setField(shortLivedJwtUtil, "jwtExpirationMs", -1000L); // Expired 1 second ago
        shortLivedJwtUtil.init();

        User student = User.builder()
                .id(1L)
                .registrationId("23A91A0501")
                .role(Role.STUDENT)
                .active(true)
                .build();
        String expiredToken = shortLivedJwtUtil.generateToken(new CustomUserDetails(student));

        assertThat(shortLivedJwtUtil.isTokenExpired(expiredToken)).isTrue();
        assertThat(shortLivedJwtUtil.validateToken(expiredToken)).isFalse();
    }
}

