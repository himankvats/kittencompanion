package com.newcat.pattern.handler;

/**
 * EventBridge-triggered handler that iterates all active pets and generates
 * weekly pattern analysis and digest for each one.
 * See TDD Section 4.3 for system prompt and pattern analysis specification.
 */

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.ScheduledEvent;
import com.newcat.pattern.service.DigestService;
import com.newcat.pattern.service.PatternAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class PatternDetectionHandler {

    @Autowired
    private PatternAnalysisService patternAnalysisService;

    @Autowired
    private DigestService digestService;

    /**
     * TODO: Implement run (TDD Section 4.3)
     * Steps:
     *   1. Query all active pets (pets WHERE deleted_at IS NULL)
     *   2. For each pet, fetch last 7 days of check-ins
     *   3. Run PatternAnalysisService.analyzeEating / analyzeLitter / analyzeActivity / detectTreatAbuse
     *   4. Generate digest via DigestService.generateWeeklyDigest
     *   5. Insert into digest_logs table
     */
    public void run(ScheduledEvent event, Context context) {
        throw new UnsupportedOperationException("Not implemented - see TDD Section 4.3");
    }
}
