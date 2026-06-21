package com.chatterboxapp.exception;

import com.chatterboxapp.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(AccountExistsException.class)
  public ResponseEntity<ErrorResponse> handleAccountExists(AccountExistsException ex) {
    return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(new ErrorResponse("account_exists", ex.getMessage()));
  }

  @ExceptionHandler(NotWhitelistedException.class)
  public ResponseEntity<ErrorResponse> handleNotWhitelisted(NotWhitelistedException ex) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN)
        .body(new ErrorResponse("not_whitelisted", ex.getMessage()));
  }

  @ExceptionHandler({BadCredentialsException.class, UsernameNotFoundException.class})
  public ResponseEntity<ErrorResponse> handleBadCredentials(RuntimeException ex) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
        .body(new ErrorResponse("invalid_credentials", "Invalid email or password."));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
    String message = ex.getBindingResult().getFieldErrors().stream()
        .map(FieldError::getDefaultMessage)
        .findFirst()
        .orElse("Invalid request.");
    return ResponseEntity.badRequest()
        .body(new ErrorResponse("validation_error", message));
  }

  @ExceptionHandler(com.chatterboxapp.exception.ResourceNotFoundException.class)
  public ResponseEntity<ErrorResponse> handleNotFound(
      com.chatterboxapp.exception.ResourceNotFoundException ex
  ) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(new ErrorResponse("not_found", ex.getMessage()));
  }

  @ExceptionHandler(com.chatterboxapp.exception.ForbiddenException.class)
  public ResponseEntity<ErrorResponse> handleForbidden(
      com.chatterboxapp.exception.ForbiddenException ex
  ) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN)
        .body(new ErrorResponse("forbidden", ex.getMessage()));
  }
}
