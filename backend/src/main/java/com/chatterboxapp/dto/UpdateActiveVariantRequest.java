package com.chatterboxapp.dto;

import jakarta.validation.constraints.Min;

public record UpdateActiveVariantRequest(
    @Min(0) int activeVariantIndex
) {
}
