package com.healthverse.user.service;

import com.healthverse.user.dto.ComprehensiveTwinDto;
import com.healthverse.user.dto.DigitalHealthTwinDto;
import com.healthverse.user.dto.TwinContextDto;

public interface TwinService {
    DigitalHealthTwinDto getTwinMetrics(Long userId);
    TwinContextDto getTwinContext(Long userId);
    ComprehensiveTwinDto getComprehensiveTwin(Long userId);
}
