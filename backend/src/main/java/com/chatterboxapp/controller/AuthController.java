package com.chatterboxapp.controller;

import com.chatterboxapp.dto.AuthUserResponse;
import com.chatterboxapp.dto.LoginRequest;
import com.chatterboxapp.dto.SignupRequest;
import com.chatterboxapp.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/signup")
  public ResponseEntity<AuthUserResponse> signup(
      @Valid @RequestBody SignupRequest request,
      HttpServletRequest httpRequest,
      HttpServletResponse httpResponse
  ) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(authService.signup(request, httpRequest, httpResponse));
  }

  @PostMapping("/login")
  public AuthUserResponse login(
      @Valid @RequestBody LoginRequest request,
      HttpServletRequest httpRequest,
      HttpServletResponse httpResponse
  ) {
    return authService.login(request, httpRequest, httpResponse);
  }

  @GetMapping("/me")
  public ResponseEntity<AuthUserResponse> me() {
    AuthUserResponse user = authService.currentUser();
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
    return ResponseEntity.ok(user);
  }
}
