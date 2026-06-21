package com.chatterboxapp.service;

import com.chatterboxapp.dto.AuthUserResponse;
import com.chatterboxapp.dto.LoginRequest;
import com.chatterboxapp.dto.SignupRequest;
import com.chatterboxapp.entity.User;
import com.chatterboxapp.exception.AccountExistsException;
import com.chatterboxapp.exception.NotWhitelistedException;
import com.chatterboxapp.repository.EmailWhitelistRepository;
import com.chatterboxapp.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

  private final UserRepository userRepository;
  private final EmailWhitelistRepository emailWhitelistRepository;
  private final PasswordEncoder passwordEncoder;
  private final AuthenticationManager authenticationManager;
  private final SecurityContextRepository securityContextRepository;

  public AuthService(
      UserRepository userRepository,
      EmailWhitelistRepository emailWhitelistRepository,
      PasswordEncoder passwordEncoder,
      AuthenticationManager authenticationManager,
      SecurityContextRepository securityContextRepository
  ) {
    this.userRepository = userRepository;
    this.emailWhitelistRepository = emailWhitelistRepository;
    this.passwordEncoder = passwordEncoder;
    this.authenticationManager = authenticationManager;
    this.securityContextRepository = securityContextRepository;
  }

  @Transactional
  public AuthUserResponse signup(
      SignupRequest request,
      HttpServletRequest httpRequest,
      HttpServletResponse httpResponse
  ) {
    String email = normalizeEmail(request.email());

    if (userRepository.existsByEmailIgnoreCase(email)) {
      throw new AccountExistsException();
    }

    if (!emailWhitelistRepository.existsByEmailIgnoreCase(email)) {
      throw new NotWhitelistedException();
    }

    User user = new User(
        email,
        request.displayName().trim(),
        passwordEncoder.encode(request.password())
    );
    User saved = userRepository.save(user);
    authenticate(email, request.password(), httpRequest, httpResponse);
    return toResponse(saved);
  }

  public AuthUserResponse login(
      LoginRequest request,
      HttpServletRequest httpRequest,
      HttpServletResponse httpResponse
  ) {
    String email = normalizeEmail(request.email());
    authenticate(email, request.password(), httpRequest, httpResponse);
    User user = userRepository.findByEmailIgnoreCase(email).orElseThrow();
    return toResponse(user);
  }

  public AuthUserResponse currentUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !authentication.isAuthenticated()
        || "anonymousUser".equals(authentication.getPrincipal())) {
      return null;
    }

    String email = authentication.getName();
    return userRepository.findByEmailIgnoreCase(email)
        .map(this::toResponse)
        .orElse(null);
  }

  private void authenticate(
      String email,
      String password,
      HttpServletRequest httpRequest,
      HttpServletResponse httpResponse
  ) {
    Authentication authentication = authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(email, password)
    );
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(authentication);
    SecurityContextHolder.setContext(context);
    securityContextRepository.saveContext(context, httpRequest, httpResponse);
  }

  private String normalizeEmail(String email) {
    return email.trim().toLowerCase();
  }

  private AuthUserResponse toResponse(User user) {
    return new AuthUserResponse(user.getId(), user.getEmail(), user.getDisplayName());
  }
}
