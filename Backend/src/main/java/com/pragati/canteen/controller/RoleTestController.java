package com.pragati.canteen.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Controller strictly for testing and validating role-based authorization boundaries.
 */
@RestController
@RequestMapping("/api/test")
public class RoleTestController {

    @GetMapping("/student")
    public ResponseEntity<Map<String, Object>> studentOnlyAccess(@AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("role", "STUDENT");
        response.put("username", userDetails.getUsername());
        response.put("message", "Authorized: Student portal access verified.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/faculty")
    public ResponseEntity<Map<String, Object>> facultyOnlyAccess(@AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("role", "FACULTY");
        response.put("username", userDetails.getUsername());
        response.put("message", "Authorized: Faculty portal access verified.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin")
    public ResponseEntity<Map<String, Object>> adminOnlyAccess(@AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("role", "ADMIN");
        response.put("username", userDetails.getUsername());
        response.put("message", "Authorized: Canteen Administrator desk access verified.");
        return ResponseEntity.ok(response);
    }
}

