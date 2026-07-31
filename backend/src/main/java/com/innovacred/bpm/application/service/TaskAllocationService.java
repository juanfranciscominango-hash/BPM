package com.innovacred.bpm.application.service;

import com.innovacred.bpm.domain.entity.TaskAllocationRule;
import com.innovacred.bpm.infrastructure.adapter.persistence.TaskAllocationRuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.flowable.task.api.Task;
import org.flowable.engine.TaskService;
import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskAllocationService {

    private final TaskAllocationRuleRepository ruleRepository;
    private final TaskService flowableTaskService;
    private final JdbcTemplate jdbcTemplate;

    public void allocateTask(Task task) {
        String procDefId = task.getProcessDefinitionId();
        if (procDefId == null) return;
        String procDefKey = procDefId.split(":")[0];
        String taskDefKey = task.getTaskDefinitionKey();

        ruleRepository.findByProcessDefinitionKeyAndTaskDefinitionKey(procDefKey, taskDefKey)
            .filter(TaskAllocationRule::isActive)
            .ifPresent(rule -> {
                log.info("Applying task allocation rule [{}] to task [{}] in process [{}]", 
                    rule.getAllocationMethod(), taskDefKey, procDefKey);
                try {
                    switch (rule.getAllocationMethod().toUpperCase()) {
                        case "LEAST_LOADED":
                            allocateByLeastLoaded(task, rule.getCandidateGroup());
                            break;
                        case "ROUND_ROBIN":
                            allocateByRoundRobin(task, rule.getCandidateGroup());
                            break;
                        case "SPECIFIC":
                            allocateByExpression(task, rule.getSpecificExpression());
                            break;
                        case "EVERYONE":
                        default:
                            if (rule.getCandidateGroup() != null && !rule.getCandidateGroup().isEmpty()) {
                                flowableTaskService.addCandidateGroup(task.getId(), rule.getCandidateGroup());
                            }
                            break;
                    }
                } catch (Exception e) {
                    log.error("Failed to execute task allocation rule: " + e.getMessage(), e);
                }
            });
    }

    private void allocateByLeastLoaded(Task task, String group) {
        // Consultar usuarios activos del rol
        List<String> usernames = jdbcTemplate.queryForList(
            "SELECT u.username FROM sec_user u " +
            "JOIN sec_user_role ur ON u.id = ur.user_id " +
            "JOIN sec_role r ON ur.role_id = r.id " +
            "WHERE LOWER(r.name) = LOWER(?) AND u.active = true",
            String.class, group
        );

        if (usernames.isEmpty()) {
            log.warn("No active users found with role: {}", group);
            return;
        }

        // Consultar la carga actual (número de tareas asignadas activas)
        String sql = "SELECT COALESCE(assignee_, '') as assignee, COUNT(*) as cnt " +
                     "FROM ACT_RU_TASK " +
                     "WHERE assignee_ IS NOT NULL AND assignee_ != '' " +
                     "GROUP BY assignee_";
        List<Map<String, Object>> activeCounts = jdbcTemplate.queryForList(sql);
        
        String bestUser = usernames.get(0);
        long minCount = Long.MAX_VALUE;

        for (String username : usernames) {
            long count = activeCounts.stream()
                .filter(m -> username.equalsIgnoreCase((String) m.get("assignee")))
                .mapToLong(m -> ((Number) m.get("cnt")).longValue())
                .findFirst()
                .orElse(0L);
            
            if (count < minCount) {
                minCount = count;
                bestUser = username;
            }
        }

        log.info("LEAST_LOADED: Assigning task [{}] to user [{}] with current task count [{}]", 
            task.getId(), bestUser, minCount);
        flowableTaskService.setAssignee(task.getId(), bestUser);
    }

    private void allocateByRoundRobin(Task task, String group) {
        List<String> usernames = jdbcTemplate.queryForList(
            "SELECT u.username FROM sec_user u " +
            "JOIN sec_user_role ur ON u.id = ur.user_id " +
            "JOIN sec_role r ON ur.role_id = r.id " +
            "WHERE LOWER(r.name) = LOWER(?) AND u.active = true " +
            "ORDER BY u.id ASC",
            String.class, group
        );

        if (usernames.isEmpty()) {
            log.warn("No active users found with role: {}", group);
            return;
        }

        // Obtener el último usuario asignado históricamente para este tipo de tarea
        String sql = "SELECT assignee_ FROM ACT_HI_TASKINST " +
                     "WHERE task_def_key_ = ? AND assignee_ IS NOT NULL AND assignee_ != '' " +
                     "ORDER BY end_time_ DESC, start_time_ DESC LIMIT 1";
        List<String> lastAssignees = jdbcTemplate.queryForList(sql, String.class, task.getTaskDefinitionKey());

        String nextUser = usernames.get(0);
        if (!lastAssignees.isEmpty()) {
            String lastAssignee = lastAssignees.get(0);
            int lastIndex = -1;
            for (int i = 0; i < usernames.size(); i++) {
                if (usernames.get(i).equalsIgnoreCase(lastAssignee)) {
                    lastIndex = i;
                    break;
                }
            }
            int nextIndex = (lastIndex + 1) % usernames.size();
            nextUser = usernames.get(nextIndex);
        }

        log.info("ROUND_ROBIN: Assigning task [{}] to user [{}]", task.getId(), nextUser);
        flowableTaskService.setAssignee(task.getId(), nextUser);
    }

    private void allocateByExpression(Task task, String expr) {
        if (expr == null || expr.isEmpty()) return;
        
        Map<String, Object> variables = flowableTaskService.getVariables(task.getId());
        String varName = expr.replace("${", "").replace("}", "").trim();
        Object val = variables.get(varName);
        
        if (val != null) {
            log.info("SPECIFIC: Assigning task [{}] to user [{}] from variable [{}]", task.getId(), val, varName);
            flowableTaskService.setAssignee(task.getId(), val.toString());
        } else {
            log.warn("Expression variable [{}] was not found in task variables", varName);
        }
    }
}
