import { LLMFactory } from './llm/llm.factory.js';
import { AnalyzeRequest, CodePreset, ReviewResult } from '../types/review.types.js';

interface StoredReviewRecord {
  id: string;
  timestamp: string;
  language: string;
  focus: string;
  score: number;
  summary: string;
  issuesCount: number;
  codeSnippet: string;
}

// In-memory fallback cache for reviews when Prisma DB is not connected
const inMemoryHistory: StoredReviewRecord[] = [];

export class ReviewService {
  public static async analyze(request: AnalyzeRequest): Promise<ReviewResult> {
    const provider = LLMFactory.getProvider(request);

    // Timeout guard (30 seconds)
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('LLM request timed out after 30 seconds')), 30000)
    );

    const result = await Promise.race([provider.analyze(request), timeoutPromise]);

    // Save to history
    const record: StoredReviewRecord = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      language: request.language,
      focus: request.focus,
      score: result.score,
      summary: result.summary,
      issuesCount: result.issues.length,
      codeSnippet: request.code.slice(0, 150) + (request.code.length > 150 ? '...' : ''),
    };

    inMemoryHistory.unshift(record);
    if (inMemoryHistory.length > 50) {
      inMemoryHistory.pop();
    }

    return result;
  }

  public static getHistory(): StoredReviewRecord[] {
    return inMemoryHistory;
  }

  public static getPresets(): CodePreset[] {
    return [
      {
        id: 'python-sql-security',
        title: 'Python: SQL Injection & Resource Leak',
        language: 'python',
        focus: 'security',
        description: 'Vulnerable Flask route with dynamic SQL formatting, unclosed file handler, and hardcoded secret.',
        code: `import sqlite3
import os

SECRET_API_KEY = "sk-live-99238472918471203"

def get_user_profile(user_id: str):
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    
    # Critical security vulnerability: dynamic SQL interpolation
    query = f"SELECT * FROM users WHERE id = '{user_id}' AND is_active = 1"
    cursor.execute(query)
    user = cursor.fetchone()
    
    # Resource leak: open file without context manager
    log_file = open("audit.log", "a")
    log_file.write(f"Accessed user {user_id}\\n")
    
    return user

def append_to_cache(item, cache_list=[]):
    # Python mutable default argument antipattern
    cache_list.append(item)
    return cache_list
`,
      },
      {
        id: 'ts-memory-perf',
        title: 'TypeScript: Memory Leak & Race Condition',
        language: 'typescript',
        focus: 'performance',
        description: 'React/Node hook with uncleaned global listener, unsound `any` types, and quadratic nested filtering.',
        code: `import { useEffect, useState } from 'react';

export function useDataProcessor(items: any[]) {
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    // Memory leak: window event listener added without cleanup function
    window.addEventListener('resize', () => {
      console.log('Window resized, re-evaluating data');
    });

    // O(N^2) Performance bottleneck: nested loop search
    const filtered: any[] = [];
    for (let i = 0; i < items.length; i++) {
      for (let j = 0; j < items.length; j++) {
        if (i !== j && items[i].id === items[j].parentId) {
          filtered.push({ parent: items[i], child: items[j] });
        }
      }
    }

    setResults(filtered);
  }, [items]);

  return results;
}
`,
      },
      {
        id: 'go-concurrency-bug',
        title: 'Go: Goroutine Leak & Swallowed Error',
        language: 'go',
        focus: 'bug_prevention',
        description: 'Go service with unbuffered channel deadlock risk, ignored error return, and race condition.',
        code: `package main

import (
	"fmt"
	"net/http"
	"os"
)

func FetchMetric(url string) string {
	ch := make(chan string) // Unbuffered channel can lead to goroutine leak

	go func() {
		resp, err := http.Get(url)
		_, err = fmt.Println("Fetching url: ", url) // Swallowed error

		if err != nil {
			return // ch is never closed or written to, goroutine hangs forever
		}
		defer resp.Body.Close()
		ch <- resp.Status
	}()

	return <-ch
}

func main() {
	metric := FetchMetric("https://api.internal/metrics")
	fmt.Println("Result:", metric)
}
`,
      },
      {
        id: 'rust-clean-code',
        title: 'Rust: Idiomatic Refactoring & Safety',
        language: 'rust',
        focus: 'clean_code',
        description: 'Rust code with unnecessary clones, unwrap() panics, and lack of Result error propagation.',
        code: `pub struct Config {
    pub host: String,
    pub port: u16,
}

pub fn parse_port(port_str: &str) -> u16 {
    // Anti-pattern in production Rust: unwrap() causes panic on invalid input
    port_str.parse::<u16>().unwrap()
}

pub fn clone_records(records: Vec<String>) -> Vec<String> {
    let mut result = Vec::new();
    for item in records.iter() {
        // Redundant clone when ownership or borrowing could suffice
        result.push(item.clone());
    }
    result
}
`,
      },
    ];
  }
}
