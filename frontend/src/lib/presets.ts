import { CodePreset } from '../types/review.types';

export const CODE_PRESETS: CodePreset[] = [
  {
    id: 'python-security-flaw',
    title: 'Python: SQL Injection & Credentials',
    language: 'python',
    focus: 'security',
    description: 'Direct SQL string concatenation, hardcoded secret tokens, and unclosed file handlers.',
    code: `import sqlite3
import os

# Hardcoded production credentials antipattern
ADMIN_SECRET_KEY = "sk-live-99238472918471203"

def fetch_user_data(user_id: str):
    conn = sqlite3.connect("production.db")
    cursor = conn.cursor()
    
    # CRITICAL: Dynamic SQL query injection vulnerability
    query = f"SELECT * FROM users WHERE id = '{user_id}' AND is_active = 1"
    cursor.execute(query)
    record = cursor.fetchone()
    
    # Resource leak: open file without context manager
    audit_file = open("access_audit.log", "a")
    audit_file.write(f"Access granted for user_id={user_id}\\n")
    
    return record

def append_to_cache(item, cache_list=[]):
    # Python mutable default argument antipattern
    cache_list.append(item)
    return cache_list
`,
  },
  {
    id: 'ts-perf-leak',
    title: 'TypeScript: Memory Leak & O(N²)',
    language: 'typescript',
    focus: 'performance',
    description: 'React hook missing event cleanup, quadratic array comparison, and unsafe any typing.',
    code: `import { useEffect, useState } from 'react';

interface Entity {
  id: string;
  parentId: string;
  name: string;
}

export function useRelationshipTree(items: any[]) {
  const [hierarchy, setHierarchy] = useState<any[]>([]);

  useEffect(() => {
    // Memory leak: window resize listener attached without cleanup return
    window.addEventListener('resize', () => {
      console.log('Window resized - triggering full re-evaluation');
    });

    // O(N^2) Performance bottleneck: nested loop over array
    const linkedPairs: any[] = [];
    for (let i = 0; i < items.length; i++) {
      for (let j = 0; j < items.length; j++) {
        if (i !== j && items[i].id === items[j].parentId) {
          linkedPairs.push({ parent: items[i], child: items[j] });
        }
      }
    }

    setHierarchy(linkedPairs);
  }, [items]);

  return hierarchy;
}
`,
  },
  {
    id: 'go-deadlock-error',
    title: 'Go: Deadlock & Swallowed Errors',
    language: 'go',
    focus: 'bug_prevention',
    description: 'Unbuffered channel deadlock hazard, swallowed error return value, and missing context cancel.',
    code: `package main

import (
	"fmt"
	"net/http"
	"time"
)

func FetchMetrics(endpoint string) string {
	// Bug: unbuffered channel blocks indefinitely if goroutine fails
	ch := make(chan string)

	go func() {
		resp, err := http.Get(endpoint)
		// Warning: error return value ignored completely
		_, err = fmt.Println("Querying external telemetry...")

		if err != nil {
			return // ch is never sent to, caller hangs forever!
		}
		defer resp.Body.Close()
		ch <- resp.Status
	}()

	return <-ch
}

func main() {
	result := FetchMetrics("https://telemetry.internal/health")
	fmt.Println("Metric:", result)
}
`,
  },
  {
    id: 'rust-safety-unwrap',
    title: 'Rust: Panic Risk & Redundant Clones',
    language: 'rust',
    focus: 'clean_code',
    description: 'Dangerous unwrap() in parser causing panics, along with inefficient heap vector clones.',
    code: `pub struct ServerConfig {
    pub address: String,
    pub port: u16,
}

pub fn parse_port(raw_port: &str) -> u16 {
    // Unsafe: unwrap() on untrusted input causes thread panic
    raw_port.parse::<u16>().unwrap()
}

pub fn duplicate_identifiers(identifiers: Vec<String>) -> Vec<String> {
    let mut clones = Vec::new();
    for id in identifiers.iter() {
        // Redundant clone when ownership or reference borrowing could suffice
        clones.push(id.clone());
    }
    clones
}
`,
  },
];
