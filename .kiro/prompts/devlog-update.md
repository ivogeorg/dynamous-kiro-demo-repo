---
description: "Update development log after feature completion with automated data gathering and AI-generated drafts"
argument-hint: "[feature-id] (optional, auto-detected from context)"
---

# DevLog Update: Document Development Progress

## Mission

Capture comprehensive development progress after feature completion, combining automated data gathering (git activity, feature status, @execute report) with AI-generated narrative drafts that require minimal user review.

**Core Principle**: Make documentation effortless. Auto-generate drafts from context, user only reviews/accepts/edits. Incentivize frequent updates by minimizing effort.

## When to Use

Invoke this command:
- **Automatically after @execute** (recommended - context is fresh)
- **Manually before switching sessions** (if declined during @execute)
- **After completing multiple features** (batch update)

## Input Context

This command receives or gathers:
- **@execute technical report** (tasks, files, tests, validation)
- **Feature ID** (from argument or auto-detected)
- **Git activity** (commits, changes since last DEVLOG entry)
- **Conversation history** (decisions, discussions from session)
- **Feature file data** (status, validation checklists)

## Process

### Phase 1: Automated Data Gathering

**1. Feature Status Analysis**

If feature ID provided or detected:
- Read `.kiro/features/[feature-id].md`
- Extract YAML frontmatter (status, dates, metadata)
- Check validation checklist completion
- Identify related features (dependencies)

If no feature ID:
- Scan `.kiro/features/` for recently modified files
- List features with status changes since last DEVLOG entry

**2. Git Activity Analysis**
```bash
# Get last DEVLOG entry date
last_entry_date=$(grep -E "^## [0-9]{4}-[0-9]{2}-[0-9]{2}" .kiro/DEVLOG.md | tail -1 | cut -d' ' -f2)

# Get commits since last entry
git log --since="$last_entry_date" --oneline --no-merges

# Get detailed changes
git diff --stat $(git log --since="$last_entry_date" --format="%H" | tail -1)..HEAD

# Get current branch
git branch --show-current
```

**3. Session Metadata**
- Current timestamp
- Session duration (time since last DEVLOG entry or feature started_date)
- Files created/modified/deleted
- Lines added/removed

### Phase 2: AI-Generated Drafts with User Review

**Present overview and gathered data:**

```
📊 DEVLOG UPDATE - SESSION SUMMARY

Feature: [feature-id] - [feature-name]
Status: [previous-status] → completed
Duration: [X hours/minutes]
Branch: [branch-name]
Commits: [N]

Files Changed:
  Created: [N files]
  Modified: [M files]
  Deleted: [P files]
  
Stats: +[X] lines, -[Y] lines

---

TECHNICAL REPORT (from @execute):

[Include full @execute report here]
- Completed tasks
- Tests added
- Validation results

---
```

**Generate and present AI draft for overview:**

```
📝 OVERVIEW DRAFT

Based on git commits, feature description, and implementation:

"[AI-generated summary, e.g., 'Successfully implemented user authentication 
with JWT tokens, including login/logout endpoints, password hashing with 
bcrypt, and session management. Added comprehensive unit tests and integration 
tests covering happy path and error cases.']"

Accept this overview? (yes/edit/regenerate)
```

**If edit:** Allow inline editing. **If regenerate:** Ask for guidance and regenerate.

**Generate and present AI draft for technical decisions:**

```
🏗️ TECHNICAL DECISIONS DRAFT

Based on code changes and conversation history:

1. **JWT for Authentication**: Chose JWT over session cookies for stateless 
   API design and easier mobile client integration.
   
2. **Bcrypt for Password Hashing**: Selected bcrypt over argon2 for better 
   Python ecosystem support and proven security track record.

3. **FastAPI Dependency Injection**: Used FastAPI's dependency system for 
   database connections to enable easier testing and connection pooling.

Detected decisions: [N]
Accept these? (yes/edit/add/skip)
```

**Generate and present AI draft for challenges:**

```
🚧 CHALLENGES & SOLUTIONS DRAFT

Based on error messages, git history, and conversation:

1. **Challenge**: JWT token expiration handling in frontend
   **Solution**: Implemented automatic token refresh with 401 interceptor
   **Impact**: Improved user experience, no forced re-login during active sessions

2. **Challenge**: Bcrypt hashing slowing down tests
   **Solution**: Added test-only fast hash mode with environment variable
   **Impact**: Test suite runtime reduced from 45s to 12s

Detected challenges: [N]
Accept these? (yes/edit/add/skip)
```

**Generate and present AI draft for Kiro usage:**

```
🤖 KIRO CLI USAGE DRAFT

Based on conversation history:

- **@plan-feature**: Generated comprehensive implementation plan with security 
  considerations and testing strategy. Helped identify edge cases early.
  
- **@execute**: Systematic task execution prevented missing validation steps. 
  Caught type errors before manual testing.
  
- **@code-review**: Identified potential SQL injection vulnerability in raw 
  query. Fixed before deployment.

Detected Kiro usage: [N commands]
Accept this? (yes/edit/add/skip)
```

**Generate and present AI draft for insights:**

```
💡 INSIGHTS & LEARNINGS DRAFT

Based on implementation patterns and discoveries:

- FastAPI's dependency injection system is more powerful than initially 
  thought - enables elegant testing patterns
  
- JWT refresh token rotation adds complexity but significantly improves 
  security posture
  
- Bcrypt work factor of 12 provides good security/performance balance for 
  our use case

Detected insights: [N]
Accept these? (yes/edit/add/skip)
```

**Prompt for time breakdown:**

```
⏱️ TIME TRACKING

Session duration: [X hours Y minutes]

Estimated time breakdown (or 'auto' to use session duration as total):

Planning/Design: [auto-suggest based on conversation]
Implementation: [auto-suggest based on commits]
Testing/Debugging: [auto-suggest based on test files]
Documentation: [auto-suggest based on doc changes]
Research: [auto-suggest based on web searches]

Accept estimates? (yes/edit)
```

### Phase 3: Generate DEVLOG Entry

**Combine all elements into structured entry:**

```markdown
## [YYYY-MM-DD] - [User-approved overview summary]

**Feature**: [`[feature-id]`](.kiro/features/[feature-id].md) - [feature-name]
**Session Duration**: [X hours Y minutes]
**Branch**: [branch-name]
**Commits**: [N]
**Status**: [previous-status] → completed

### Overview

[User-approved overview paragraph]

### Technical Report (from @execute)

#### Completed Tasks
[From @execute report]
- Task 1
- Task 2
- Task 3

#### Tests Added
[From @execute report]
- Test file 1: [N test cases]
- Test file 2: [M test cases]

#### Validation Results
[From @execute report]
```bash
✓ All unit tests passed (45/45)
✓ Integration tests passed (12/12)
✓ Linting passed
✓ Type checking passed
```

### Technical Decisions

[User-approved decisions]

### Challenges & Solutions

[User-approved challenges]

### Kiro CLI Usage

[User-approved Kiro usage notes]

### Code Changes

**Files Created** ([N]):
- `path/to/file1.py`
- `path/to/file2.py`

**Files Modified** ([M]):
- `path/to/file3.py` (+[X] lines, -[Y] lines)
- `path/to/file4.py` (+[A] lines, -[B] lines)

**Files Deleted** ([P]):
- `path/to/old_file.py`

**Total Changes**: +[total-added] lines, -[total-removed] lines

### Git Activity

**Commits** ([N] commits):
```
[hash] - [commit message]
[hash] - [commit message]
[hash] - [commit message]
```

### Time Breakdown

- **Planning/Design**: [X hours]
- **Implementation**: [Y hours]
- **Testing/Debugging**: [Z hours]
- **Documentation**: [A hours]
- **Research**: [B hours]
- **Total Session Time**: [Total hours]

### Insights & Learnings

[User-approved insights]

### Next Steps

[Auto-generated from .kiro/features.json dependencies]
- [ ] [`[next-feature-id]`](.kiro/features/[next-feature-id].md) - [Unblocked by this feature]
- [ ] [Other pending tasks]

---
```

### Phase 4: Update Files

**1. Append to `.kiro/DEVLOG.md`**
- Add entry at the end (chronological, newest last)
- Maintain consistent formatting
- Preserve all previous entries

**2. Update `.kiro/features.json`** (if not already updated by @execute)
- Ensure status is "completed"
- Add/verify completed_date timestamp

**3. Confirm Updates**
```
✅ DEVLOG UPDATED

Updated files:
- .kiro/DEVLOG.md (new entry added)
- .kiro/features.json (status confirmed)

Entry Summary:
- Feature: [feature-id]
- Session Duration: [X hours]
- Commits: [N]
- AI-generated drafts: [N accepted, M edited]

DEVLOG update complete!
```

## DEVLOG File Structure

The `.kiro/DEVLOG.md` file should follow this structure:

```markdown
# Development Log - [Project Name]

> Comprehensive development timeline documenting progress, decisions, challenges, and learnings.

**Project**: [Project Name from product.md]
**Started**: [First entry date]
**Last Updated**: [Most recent entry date]

---

## [YYYY-MM-DD] - [Session Summary]

[Entry content as structured above]

---

## [YYYY-MM-DD] - [Session Summary]

[Next entry...]

---

[Continue chronologically...]
```

## AI Draft Generation Guidelines

When generating drafts, use:

### For Overview
- Git commit messages (extract key actions)
- Feature description from feature file
- Files changed (infer functionality)
- @execute report (completed tasks)

### For Technical Decisions
- Conversation history (discussions about choices)
- Code patterns (technology usage)
- Import statements (library choices)
- Configuration changes (architectural decisions)

### For Challenges
- Error messages in git history
- Reverted commits or fixes
- Conversation about debugging
- Multiple attempts at same task

### For Kiro Usage
- Conversation history (which @ commands were used)
- Context about how they helped
- Specific examples from session

### For Insights
- New patterns discovered
- Performance observations
- Security considerations
- Future improvement notes

**Draft Quality**: Drafts should be specific and actionable, not generic. Use actual file names, technologies, and decisions from the session.

## Success Criteria

- [ ] All git activity since last entry captured
- [ ] Feature statuses updated in .kiro/features.json
- [ ] User-provided qualitative input captured
- [ ] Technical decisions documented with rationale
- [ ] Challenges and solutions clearly described
- [ ] Kiro CLI usage tracked and evaluated
- [ ] Time breakdown recorded
- [ ] Code changes summarized with statistics
- [ ] Entry appended to DEVLOG.md chronologically
- [ ] Consistent markdown formatting maintained

## Quality Checklist

### Completeness
- [ ] Quantitative data (git stats, file changes, time)
- [ ] Qualitative insights (decisions, challenges, learnings)
- [ ] Feature linkage (IDs, status updates)
- [ ] Kiro CLI usage documentation

### Clarity
- [ ] Summary is concise and descriptive
- [ ] Technical decisions include rationale
- [ ] Challenges include solutions or status
- [ ] Insights are actionable for future work

### Consistency
- [ ] Markdown formatting matches previous entries
- [ ] Feature IDs properly linked
- [ ] Timestamps and durations accurate
- [ ] Git metadata correctly captured

## Notes

- **Timing is critical**: Run this before context is lost or switching sessions
- **Be honest about challenges**: Document blockers and partial solutions
- **Track Kiro usage**: This is valuable for hackathon evaluation (20% of score)
- **Link to features**: Maintains traceability between work and roadmap
- **Preserve history**: Never delete or modify previous entries, only append
- **Use for retrospectives**: Review DEVLOG periodically to identify patterns and improvements
