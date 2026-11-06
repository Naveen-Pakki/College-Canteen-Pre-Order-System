package com.pragati.canteen.dto;

import com.pragati.canteen.entity.User;
import com.pragati.canteen.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Safe user profile data transfer object (strictly excludes password hashes).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {

    private Long id;
    private String registrationId;
    private String name;        // Matches frontend "name"
    private String fullName;    // Canonical full name
    private String email;
    private String phone;
    private String department;
    private Role role;
    private boolean active;
    private LocalDateTime createdAt;

    public static UserDto fromEntity(User user) {
        if (user == null) return null;
        return UserDto.builder()
                .id(user.getId())
                .registrationId(user.getRegistrationId())
                .name(user.getFullName())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .department(user.getDepartment())
                .role(user.getRole())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}

