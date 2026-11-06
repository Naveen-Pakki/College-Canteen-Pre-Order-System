package com.pragati.canteen.enums;

/**
 * System roles for Pragati University Canteen platform.
 * Supports Student, Faculty, and Admin personas.
 */
public enum Role {
    STUDENT,
    FACULTY,
    ADMIN;

    public String getAuthority() {
        return "ROLE_" + this.name();
    }
}

