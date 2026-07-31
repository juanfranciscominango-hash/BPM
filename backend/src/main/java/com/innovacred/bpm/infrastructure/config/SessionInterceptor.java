package com.innovacred.bpm.infrastructure.config;

import com.innovacred.bpm.domain.entity.UserAccount;
import com.innovacred.bpm.infrastructure.adapter.persistence.UserAccountRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class SessionInterceptor implements HandlerInterceptor {
 
    private final UserAccountRepository userRepository;
 
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Bypass OPTIONS requests (CORS preflight)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
 
        String path = request.getRequestURI();
        // Bypass login, public endpoints, static/mock and internal execution endpoints
        if (path.contains("/auth/login") || path.contains("/productos") || 
            path.contains("/public/") || path.contains("/turnero/") || path.contains("/Nomina/") || path.contains("/Mock/") ||
            path.contains("/credit-operation/") || path.contains("/documents/") ||
            (path.endsWith("/processes") && "GET".equalsIgnoreCase(request.getMethod()))) {
            return true;
        }
 
        String username = request.getHeader("X-Username");
        String sessionId = request.getHeader("X-Session-Id");
 
        if (username == null || sessionId == null) {
            log.warn("SessionInterceptor: Missing session headers for path {}. X-Username: {}, X-Session-Id: {}", path, username, sessionId);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"Unauthorized: Missing session headers\"}");
            response.setContentType("application/json");
            return false;
        }
 
        UserAccount user = userRepository.findByUsername(username).orElse(null);
        if (user == null || !user.isActive()) {
            log.warn("SessionInterceptor: User not found or inactive for username {} at path {}", username, path);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"Unauthorized: User not found or inactive\"}");
            response.setContentType("application/json");
            return false;
        }
 
        if (user.getCurrentSessionId() == null || !user.getCurrentSessionId().equals(sessionId)) {
            log.warn("SessionInterceptor: Session mismatch/expired for user {}. Path: {}. Header Session ID: {}, DB Session ID: {}", 
                username, path, sessionId, user.getCurrentSessionId());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"SessionExpired\", \"message\": \"Tu sesion ha sido cerrada porque has iniciado sesion en otro navegador o dispositivo.\"}");
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            return false;
        }
 
        return true;
    }
}
