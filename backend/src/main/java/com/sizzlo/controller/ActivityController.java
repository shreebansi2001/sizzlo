package com.sizzlo.controller;

import com.sizzlo.dto.ApiResponse;
import com.sizzlo.entity.ActivityLog;
import com.sizzlo.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activity")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class ActivityController {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ActivityLog>>> getActivities() {
        return ResponseEntity.ok(ApiResponse.success(activityLogRepository.findTop20ByOrderByTimestampDesc()));
    }
}
