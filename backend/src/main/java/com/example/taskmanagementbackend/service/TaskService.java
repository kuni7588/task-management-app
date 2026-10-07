package com.example.taskmanagementbackend.service;

import com.example.taskmanagementbackend.entity.Task;
import com.example.taskmanagementbackend.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    /**
     * 指定したユーザーが所有するタスク一覧を取得する。
     */
    public List<Task> findByUserId(Long userId) {
        return taskRepository.findByUserId(userId);
    }

    /**
     * タスクIDと所有者のユーザーIDが一致するタスクを取得する。
     */
    public Optional<Task> findById(Long taskId, Long userId) {
        return taskRepository.findByTaskIdAndUserId(taskId, userId);
    }

    /**
     * ログインユーザーのタスクとして新規登録する。
     * リクエストに含まれるtaskIdやuserIdは使用しない。
     */
    @Transactional
    public Task create(Task task, Long userId) {
        Task newTask = new Task();

        newTask.setUserId(userId);
        newTask.setTitle(task.getTitle());
        newTask.setStatus(task.getStatus());
        newTask.setDescription(task.getDescription());

        return taskRepository.save(newTask);
    }

    /**
     * 指定したユーザーが所有するタスクだけ更新する。
     * 所有者のuserIdは変更しない。
     */
    @Transactional
    public Optional<Task> update(Long taskId, Task task, Long userId) {
        return taskRepository.findByTaskIdAndUserId(taskId, userId)
                .map(existingTask -> {
                    existingTask.setTitle(task.getTitle());
                    existingTask.setStatus(task.getStatus());
                    existingTask.setDescription(task.getDescription());

                    return taskRepository.save(existingTask);
                });
    }

    /**
     * 指定したユーザーが所有するタスクだけ削除する。
     * 対象が見つからない場合はfalseを返す。
     */
    @Transactional
    public boolean delete(Long taskId, Long userId) {
        Optional<Task> task =
                taskRepository.findByTaskIdAndUserId(taskId, userId);

        if (task.isEmpty()) {
            return false;
        }

        taskRepository.delete(task.get());
        return true;
    }
}