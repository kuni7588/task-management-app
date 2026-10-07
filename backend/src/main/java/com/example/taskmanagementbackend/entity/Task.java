package com.example.taskmanagementbackend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "task_id")
    private Long taskId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    // タスク名は必須。空文字・空白だけの入力は不可。上限は100文字。
    @NotBlank(message = "タスク名を入力してください")
    @Size(max = 100, message = "タスク名は100文字以内で入力してください")
    @Column(name = "title", nullable = false, length = 100)
    private String title;

    // タスクの状態は必須。空文字・空白だけの入力は不可。上限は20文字。
    @NotBlank(message = "タスクの状態を入力してください")
    @Size(max = 20, message = "タスクの状態は20文字以内で入力してください")
    @Column(name = "status", nullable = false, length = 20)
    private String status;

    // タスクの説明は任意入力。入力する場合は1000文字以内。
    @Size(max = 1000, message = "タスクの説明は1000文字以内で入力してください")
    @Column(name = "description", length = 1000)
    private String description;

    public Task() {
    }

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
