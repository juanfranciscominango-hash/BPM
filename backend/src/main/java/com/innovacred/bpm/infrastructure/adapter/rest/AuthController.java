package com.innovacred.bpm.infrastructure.adapter.rest;

import com.innovacred.bpm.domain.entity.UserAccount;
import com.innovacred.bpm.infrastructure.adapter.persistence.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserAccountRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("email");
        String password = credentials.get("password");

        return userRepository.findByUsername(username)
                .filter(u -> u.getPassword().equals(password)) // Por ahora simple, luego BCrypt
                .map(u -> {
                    Set<String> permissions = u.getRoles().stream()
                            .flatMap(r -> r.getPermissions().stream())
                            .map(p -> p.getCode())
                            .collect(Collectors.toSet());
                    
                    return ResponseEntity.ok(Map.of(
                            "id", u.getId(),
                            "username", u.getUsername(),
                            "fullName", u.getFullName(),
                            "roles", u.getRoles().stream().map(r -> r.getName()).collect(Collectors.toSet()),
                            "permissions", permissions
                    ));
                })
                .orElse(ResponseEntity.status(401).build());
    }
}
