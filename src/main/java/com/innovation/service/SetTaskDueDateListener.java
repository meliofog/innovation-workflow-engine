package com.innovation.service;

import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component("setTaskDueDateListener")
public class SetTaskDueDateListener implements TaskListener {

    @Override
    public void notify(DelegateTask delegateTask) {
        // Check if the dateEcheance variable exists in the process
        if (delegateTask.hasVariable("dateEcheance")) {
            // Get the variable (it should be a Date object from our controller)
            Date dueDate = (Date) delegateTask.getVariable("dateEcheance");

            // Set the due date on the task directly
            delegateTask.setDueDate(dueDate);
        }
    }
}