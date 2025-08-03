package com.innovation.dto;

import com.innovation.domain.Idea;
import lombok.Data;
import org.camunda.bpm.engine.rest.dto.task.TaskDto;

@Data
public class TaskDetailsDto {

    private TaskDto task;
    private Idea idea;

    public TaskDetailsDto(TaskDto task, Idea idea) {
        this.task = task;
        this.idea = idea;
    }
}