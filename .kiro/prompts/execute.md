---
description: Execute an implementation plan
argument-hint: [path-to-plan]
---

# Execute: Implement from Plan

## Plan to Execute

Read plan file: `$ARGUMENTS`

## Execution Instructions

### 1. Read and Understand

- Read the ENTIRE plan carefully
- Understand all tasks and their dependencies
- Note the validation commands to run
- Review the testing strategy

### 2. Execute Tasks in Order

For EACH task in "Step by Step Tasks":

#### a. Navigate to the task
- Identify the file and action required
- Read existing related files if modifying

#### b. Implement the task
- Follow the detailed specifications exactly
- Maintain consistency with existing code patterns
- Include proper type hints and documentation
- Add structured logging where appropriate

#### c. Verify as you go
- After each file change, check syntax
- Ensure imports are correct
- Verify types are properly defined

### 3. Implement Testing Strategy

After completing implementation tasks:

- Create all test files specified in the plan
- Implement all test cases mentioned
- Follow the testing approach outlined
- Ensure tests cover edge cases

### 4. Run Validation Commands

Execute ALL validation commands from the plan in order:

```bash
# Run each command exactly as specified in plan
```

If any command fails:
- Fix the issue
- Re-run the command
- Continue only when it passes

### 5. Final Verification

Before completing:

- ✅ All tasks from plan completed
- ✅ All tests created and passing
- ✅ All validation commands pass
- ✅ Code follows project conventions
- ✅ Documentation added/updated as needed

### 6. Update Feature Status

**Identify the feature** from plan filename or content:
- Extract feature ID from plan (if named like `[feature-id].md` or mentioned in plan)
- Locate feature file: `.kiro/features/[feature-id].md`

**Prompt for status update:**
```
✅ FEATURE VALIDATION COMPLETE

Feature: [feature-id] - [feature-name]
All validation checks passed!

Update feature status to 'completed'? (yes/no)
```

**If yes:**
- Update YAML frontmatter:
  ```yaml
  status: completed
  completed_date: [current ISO-8601 timestamp]
  ```
- Update markdown status field:
  ```markdown
  **Status**: completed
  ```
- Check off validation checklist items in feature file

### 7. Update Development Log

**Prompt for DEVLOG update:**
```
📝 UPDATE DEVELOPMENT LOG

Feature implementation complete! Would you like to update the DEVLOG now?
(Recommended: capture context while fresh)

Update DEVLOG? (yes/no/later)
```

**If yes:**
- Invoke `@devlog-update` with execution context:
  - Feature ID and name
  - Technical report (from Phase 8 below)
  - Conversation history from this session
  - Git activity during implementation

**If no/later:**
- Remind: "Run @devlog-update before switching sessions to capture context"

### 8. Generate Technical Report

Provide summary:

### Completed Tasks
- List of all tasks completed
- Files created (with paths)
- Files modified (with paths)

### Tests Added
- Test files created
- Test cases implemented
- Test results

### Validation Results
```bash
# Output from each validation command
```

### Ready for Commit
- Confirm all changes are complete
- Confirm all validations pass
- Ready for `/commit` command

## Notes

- If you encounter issues not addressed in the plan, document them
- If you need to deviate from the plan, explain why
- If tests fail, fix implementation until they pass
- Don't skip validation steps