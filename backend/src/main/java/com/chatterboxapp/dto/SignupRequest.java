package com.chatterboxapp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SignupRequest(
    @NotBlank @Email String email,
    @NotBlank @Size(min = 2, max = 255) String displayName,
    @NotBlank @Size(min = 8, max = 128) String password
) {
}
