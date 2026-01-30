#!/usr/bin/env python3
"""Analyze feature graph and recommend next feature."""

import json
import sys
from collections import defaultdict

def load_features():
    """Load .kiro/features.json."""
    try:
        with open('.kiro/features.json', 'r') as f:
            return json.load(f)['features']
    except FileNotFoundError:
        print("❌ ERROR: .kiro/features.json not found\n")
        print("Run @design-digest first to generate feature roadmap.\n")
        sys.exit(1)

def calculate_horizon(features):
    """Calculate ready-to-implement features (horizon) and blocked features."""
    horizon = []
    blocked = []
    
    for fid, feature in features.items():
        status = feature.get('status', 'not-started')
        
        # Skip completed or in-progress
        if status in ['completed', 'in-progress']:
            continue
        
        # Check dependencies
        deps = feature.get('dependencies', [])
        if not deps:
            # No dependencies - ready
            horizon.append(fid)
        else:
            # Check if all dependencies completed
            incomplete_deps = [d for d in deps if features.get(d, {}).get('status') != 'completed']
            if not incomplete_deps:
                horizon.append(fid)
            else:
                blocked.append((fid, incomplete_deps))
    
    return horizon, blocked

def infer_complexity(feature):
    """Infer complexity from task count and description."""
    task_count = len(feature.get('tasks', []))
    description = feature.get('description', '').lower()
    
    # Simple heuristics
    if task_count <= 3:
        return 'Low', 1, 'Low'
    elif task_count <= 6:
        return 'Medium', 2, 'Medium'
    else:
        return 'High', 3, 'High'

def count_dependents(features):
    """Count how many features depend on each feature."""
    dependents = defaultdict(int)
    for feature in features.values():
        for dep in feature.get('dependencies', []):
            dependents[dep] += 1
    return dependents

def is_showable(fid, feature):
    """Check if feature is showable (visible to demo judges)."""
    # UI features are showable
    if fid.startswith('ui-'):
        return True
    # Features that produce visible output
    showable_keywords = ['display', 'render', 'visualize', 'show', 'overlay']
    desc = feature.get('description', '').lower()
    return any(kw in desc for kw in showable_keywords)

def recommend_feature(horizon, features, current_sprint):
    """Recommend best feature to implement next."""
    if not horizon:
        return None, [], None
    
    dependents = count_dependents(features)
    scores = []
    
    for fid in horizon:
        feature = features[fid]
        score = 0
        reasons = []
        
        # Priority: Must-have > Should-have > Could-have
        moscow = feature.get('moscow', 'Should-have')
        if moscow == 'Must-have':
            score += 10
            reasons.append("Must-have priority")
        elif moscow == 'Should-have':
            score += 5
        
        # Sprint alignment
        if feature.get('version') == current_sprint:
            score += 8
            reasons.append(f"Aligned with {current_sprint} sprint")
        
        # Unblocking power
        unblock_count = dependents.get(fid, 0)
        if unblock_count > 0:
            score += unblock_count * 3
            reasons.append(f"Unblocks {unblock_count} feature{'s' if unblock_count != 1 else ''}")
        
        # Showable features (visible progress)
        if is_showable(fid, feature):
            score += 4
            reasons.append("Showable - visible to judges")
        
        # Complexity (prefer simpler first)
        _, complexity_score, complexity = infer_complexity(feature)
        score += (4 - complexity_score)  # Lower complexity = higher score
        if complexity == 'Low':
            reasons.append("Low complexity - quick win")
        
        scores.append((fid, score, reasons, complexity))
    
    # Sort by score descending
    scores.sort(key=lambda x: x[1], reverse=True)
    
    return scores[0][0], scores[0][2], scores[0][3]

def get_stats(features):
    """Calculate feature statistics."""
    stats = {
        'completed': 0,
        'in_progress': 0,
        'not_started': 0,
        'blocked': 0,
        'by_version': {
            'Demo': {'total': 0, 'completed': 0},
            'Version 1': {'total': 0, 'completed': 0},
            'Version 2': {'total': 0, 'completed': 0}
        }
    }
    
    for feature in features.values():
        status = feature.get('status', 'not-started')
        version = feature.get('version', 'Demo')
        
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
    
    # Output recommended feature ID for @next to use
    print(f"\n__RECOMMENDED_FEATURE__:{rec_id}")
    print(f"__HORIZON__:{','.join(horizon)}")

if __name__ == '__main__':
    main()
