package com.pragati.canteen.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;

class PasswordEncoderTest {

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Test
    @DisplayName("Verify BCrypt generates different hashes for the same raw password")
    void testBcryptGeneratesDifferentSalts() {
        String rawPassword = "studentPassword123";
        String hash1 = passwordEncoder.encode(rawPassword);
        String hash2 = passwordEncoder.encode(rawPassword);

        assertThat(hash1).isNotEqualTo(hash2);
        assertThat(passwordEncoder.matches(rawPassword, hash1)).isTrue();
        assertThat(passwordEncoder.matches(rawPassword, hash2)).isTrue();
    }

    @Test
    @DisplayName("Verify BCrypt correctly rejects wrong passwords")
    void testBcryptRejectsWrongPassword() {
        String rawPassword = "facultyPassword123";
        String hash = passwordEncoder.encode(rawPassword);

        assertThat(passwordEncoder.matches("wrongPassword", hash)).isFalse();
        assertThat(passwordEncoder.matches("", hash)).isFalse();
    }
}

