package com.innovation.service;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Date;

@Component("calculateDueDateDelegate")
public class CalculateDueDateDelegate implements JavaDelegate {

    private static final Logger LOGGER = LoggerFactory.getLogger(CalculateDueDateDelegate.class);

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Object dateEcheanceObj = execution.getVariable("dateEcheance");

        if (dateEcheanceObj == null) {
            LOGGER.warn("dateEcheance variable not found for process instance: {}", execution.getProcessInstanceId());
            execution.setVariable("delaiDepasse", false);
            return;
        }

        // The variable is a Date object. We cast it and compare it directly.
        Date dateEcheance = (Date) dateEcheanceObj;
        boolean delaiDepasse = Instant.now().isAfter(dateEcheance.toInstant());

        execution.setVariable("delaiDepasse", delaiDepasse);
        LOGGER.info("Deadline check for process instance {}: delaiDepasse = {}", execution.getProcessInstanceId(), delaiDepasse);
    }
}