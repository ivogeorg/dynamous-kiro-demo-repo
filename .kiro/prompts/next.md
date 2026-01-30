---
description: "Intelligent feature selector - shows development horizon and recommends next feature to implement"
---

# Next: Smart Feature Selection

Analyze the feature dependency graph, calculate the development horizon (ready-to-implement features), and provide intelligent recommendations based on sprint priorities, dependencies, complexity, and milestone proximity.

## Implementation

Execute the feature analysis script:

```bash
python3 .kiro/scripts/next.py
```

The script outputs:
- Development horizon (ready features)
- Recommended feature with justification
- Other ready features (numbered)
- Blocked features

## User Interaction

After displaying the horizon, **prompt the user for selection:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT FEATURE TO PLAN:

  [R] Recommended: [feature-id]
  [1-N] Other ready features (by number from list above)
  [Q] Quit (return to prompt)

Your choice:
```

**Handle user input:**
- **"R" or "r" or empty (Enter)**: Use recommended feature
- **Number (1-N)**: Use corresponding feature from "OTHER READY FEATURES" list
- **"Q" or "q"**: Exit without planning

**After valid selection:**
1. Extract selected feature ID
2. Display confirmation:
   ```
   📝 CREATING PLAN FOR: [feature-id] - [Feature Name]
   ```
3. **Automatically invoke @plan-feature**:
   ```
   @plan-feature [feature-id]
   ```
4. **After plan is created, prompt for execution:**
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   
   📋 PLAN CREATED: .kiro/plans/[feature-id].md
   
   Execute this plan now? (yes/no)
   ```
   
   **If yes:**
   - Update feature status to 'in-progress' in `.kiro/features.json` and `.kiro/features/[feature-id].md`
   - Set `started_date` to current ISO-8601 timestamp
   - Display:
     ```
     🚀 STARTING IMPLEMENTATION
     
     Feature: [feature-id] - [Feature Name]
     Status: not-started → in-progress
     Started: [timestamp]
     ```
   - **Automatically invoke @execute**:
     ```
     @execute .kiro/plans/[feature-id].md
     ```
   
   **If no:**
   - Display:
     ```
     💡 Plan saved. Execute later with:
        @execute .kiro/plans/[feature-id].md
     ```
   - Return to prompt

**Invalid input:**
```
❌ Invalid selection. Please enter R, a number (1-N), or Q.
```

def calculate_horizon(features):
    """Find features ready to implement."""
    horizon = []
    blocked = []
    
    for fid, f in features.items():
        status = f.get('status', 'not-started')
        
        if status in ['completed', 'in-progress']:
            continue
        
        deps = f.get('dependencies', [])
        if not deps:
            horizon.append(fid)
        else:
            all_complete = all(
                features.get(dep, {}).get('status') == 'completed' 
                for dep in deps
            )
            if all_complete:
                horizon.append(fid)
            else:
                blocked.append((fid, deps))
    
    return horizon, blocked

def count_dependents(features):
    """Count how many features depend on each feature."""
    dependents = defaultdict(int)
    for f in features.values():
        for dep in f.get('dependencies', []):
            dependents[dep] += 1
    return dependents

def infer_complexity(feature):
    """Infer complexity from tasks and keywords."""
    tasks = len(feature.get('tasks', []))
    desc = feature.get('description', '').lower()
    name = feature.get('name', '').lower()
    
    # ML/AI = high complexity
    if any(kw in desc or kw in name for kw in ['ml', 'ai', 'model', 'training', 'inference']):
        return 'High', 1
    
    # Integration = medium
    if any(kw in desc or kw in name for kw in ['integration', 'pipeline', 'workflow']):
        return 'Medium', 2
    
    # Many tasks = higher complexity
    if tasks > 6:
        return 'High', 1
    elif tasks > 4:
        return 'Medium', 2
    else:
        return 'Low', 3

def is_showable(fid, feature):
    """Check if feature is visible/demonstrable."""
    if fid.startswith('ui-'):
        return True
    
    desc = feature.get('description', '').lower()
    name = feature.get('name', '').lower()
    
    return any(kw in desc or kw in name for kw in [
        'display', 'viewer', 'visualization', 'render', 'interface'
    ])

def score_feature(fid, feature, dependents, current_sprint):
    """Score feature for recommendation."""
    score = 0
    reasons = []
    
    # Unblocking power (most important)
    unblock_count = dependents.get(fid, 0)
    score += unblock_count * 3
    if unblock_count > 0:
        reasons.append(f"Unblocks {unblock_count} feature{'s' if unblock_count != 1 else ''}")
    
    # Complexity (prefer low-hanging fruit)
    complexity, complexity_bonus = infer_complexity(feature)
    score += complexity_bonus
    if complexity == 'Low':
        reasons.append("Low complexity - quick win")
    
    # Sprint priority
    version = feature.get('version', '')
    moscow = feature.get('moscow', '')
    if version == current_sprint:
        score += 5
        if moscow == 'Must-have':
            score += 3
            reasons.append(f"Must-have for {current_sprint}")
    
    # Showability (for Demo)
    if current_sprint == 'Demo' and is_showable(fid, feature):
        score += 2
        reasons.append("Visible to demo judges")
    
    # Foundational (no dependencies)
    if not feature.get('dependencies', []):
        score += 2
        reasons.append("Foundational - no dependencies")
    
    return score, reasons, complexity

def recommend_feature(horizon, features, current_sprint):
    """Find best feature to implement next."""
    if not horizon:
        return None, [], None
    
    dependents = count_dependents(features)
    scored = []
    
    for fid in horizon:
        feature = features[fid]
        score, reasons, complexity = score_feature(fid, feature, dependents, current_sprint)
        scored.append((score, fid, reasons, complexity))
    
    scored.sort(reverse=True, key=lambda x: x[0])
    return scored[0][1], scored[0][2], scored[0][3]

def get_stats(features):
    """Calculate feature statistics."""
    stats = {
        'completed': 0,
        'in_progress': 0,
        'not_started': 0,
        'by_version': defaultdict(lambda: {'total': 0, 'completed': 0})
    }
    
    for f in features.values():
        status = f.get('status', 'not-started')
        version = f.get('version', 'Unknown')
        
        if status == 'completed':
            stats['completed'] += 1
            stats['by_version'][version]['completed'] += 1
        elif status == 'in-progress':
            stats['in_progress'] += 1
        else:
            stats['not_started'] += 1
        
        stats['by_version'][version]['total'] += 1
    
    return stats

def main():
    features = load_features()
    horizon, blocked = calculate_horizon(features)
    stats = get_stats(features)
    
    # Determine current sprint
    current_sprint = 'Demo'
    for version in ['Demo', 'Version 1', 'Version 2']:
        if stats['by_version'][version]['completed'] < stats['by_version'][version]['total']:
            current_sprint = version
            break
    
    # Check if all done
    if stats['completed'] == len(features):
        print("🎉 ALL FEATURES COMPLETED!\n")
        print("Sprint Summary:")
        for version in ['Demo', 'Version 1', 'Version 2']:
            v_stats = stats['by_version'][version]
            print(f"  • {version}: {v_stats['completed']} features completed")
        print(f"\nTotal: {stats['completed']} features implemented\n")
        return
    
    # Check if nothing ready
    if not horizon:
        print("⚠️  NO FEATURES READY\n")
        print(f"All features are either:")
        print(f"  • Completed: {stats['completed']} features")
        print(f"  • In Progress: {stats['in_progress']} features")
        print(f"  • Blocked: {len(blocked)} features\n")
        
        if blocked:
            print("Current blockers:")
            for fid, deps in blocked[:5]:
                incomplete = [d for d in deps if features.get(d, {}).get('status') != 'completed']
                print(f"  • {fid}: Waiting for {', '.join(incomplete)}")
        return
    
    # Get recommendation
    rec_id, reasons, complexity = recommend_feature(horizon, features, current_sprint)
    rec_feature = features[rec_id]
    dependents = count_dependents(features)
    
    # Display
    print("🎯 DEVELOPMENT HORIZON\n")
    print(f"Current Sprint: {current_sprint}")
    print(f"Progress: {stats['completed']} completed, {stats['in_progress']} in-progress, {len(horizon)} ready\n")
    
    print("━" * 70)
    print(f"\n⭐ RECOMMENDED: {rec_id}\n")
    print(f"   📋 {rec_feature['name']}")
    print(f"   🎯 Priority: {rec_feature['moscow']} ({rec_feature['version']})")
    print(f"   📊 Complexity: {complexity}")
    unblock_count = dependents.get(rec_id, 0)
    if unblock_count > 0:
        print(f"   🔓 Unblocks: {unblock_count} feature{'s' if unblock_count != 1 else ''}")
    if is_showable(rec_id, rec_feature):
        print(f"   👁️  Showable - visible to demo judges")
    
    print(f"\n   Why recommended:")
    for reason in reasons:
        print(f"   • {reason}")
    
    print("\n" + "━" * 70)
    print(f"\nOTHER READY FEATURES ({len(horizon) - 1} available):\n")
    
    for i, fid in enumerate(horizon, 1):
        if fid == rec_id:
            continue
        
        f = features[fid]
        _, _, comp = infer_complexity(f)
        
        print(f"{i}. {fid}")
        print(f"   📋 {f['name']}")
        print(f"   🎯 {f['moscow']} ({f['version']})")
        print(f"   📊 Complexity: {comp}")
        
        deps = f.get('dependencies', [])
        if deps:
            print(f"   🔗 Dependencies: {', '.join(deps)} ✓")
        else:
            print(f"   🔗 Dependencies: None")
        
        if is_showable(fid, f):
            print(f"   👁️  Showable")
        print()
    
    if blocked:
        print("━" * 70)
        print(f"\nBLOCKED FEATURES ({len(blocked)} waiting):\n")
        for fid, deps in blocked[:5]:
            incomplete = [d for d in deps if features.get(d, {}).get('status') != 'completed']
            print(f"• {fid}: Waiting for {', '.join(incomplete)}")
    
    print("\n" + "━" * 70)

if __name__ == '__main__':
    main()
```

Execute this script to show the development horizon and recommended next feature.

## User Interaction

After displaying the horizon, **prompt the user for selection:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT FEATURE TO PLAN:

  [R] Recommended: [feature-id]
  [1-N] Other ready features (by number from list above)
  [Q] Quit (return to prompt)

Your choice:
```

**Handle user input:**
- **"R" or "r" or empty (Enter)**: Use recommended feature
- **Number (1-N)**: Use corresponding feature from "OTHER READY FEATURES" list
- **"Q" or "q"**: Exit without planning

**After valid selection:**
1. Extract selected feature ID
2. Display confirmation:
   ```
   📝 CREATING PLAN FOR: [feature-id] - [Feature Name]
   ```
3. **Automatically invoke @plan-feature**:
   ```
   @plan-feature [feature-id]
   ```
4. **After plan is created, prompt for execution:**
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   
   📋 PLAN CREATED: .kiro/plans/[feature-id].md
   
   Execute this plan now? (yes/no)
   ```
   
   **If yes:**
   - Update feature status to 'in-progress' in `.kiro/features.json` and `.kiro/features/[feature-id].md`
   - Set `started_date` to current ISO-8601 timestamp
   - Display:
     ```
     🚀 STARTING IMPLEMENTATION
     
     Feature: [feature-id] - [Feature Name]
     Status: not-started → in-progress
     Started: [timestamp]
     ```
   - **Automatically invoke @execute**:
     ```
     @execute .kiro/plans/[feature-id].md
     ```
   
   **If no:**
   - Display:
     ```
     💡 Plan saved. Execute later with:
        @execute .kiro/plans/[feature-id].md
     ```
   - Return to prompt

**Invalid input:**
```
❌ Invalid selection. Please enter R, a number (1-N), or Q.
```
