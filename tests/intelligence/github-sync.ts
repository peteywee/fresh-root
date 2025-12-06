/**
 * GitHub Repository Sync and Indexing
 * Syncs repos, indexes tests, tracks changes
 */

import * as fs from "fs";
import * as path from "path";
import { safeExec, commandExists } from "./platform";

interface GitHubRepo {
  name: string;
  owner: string;
  branch: string;
  lastSync: number;
  testCount: number;
  lastCommit: string;
  url: string;
}

interface RepoIndex {
  repos: GitHubRepo[];
  lastUpdate: number;
}

export class GitHubSync {
  private indexFile = "tests/intelligence/github-index.json";
  private index: RepoIndex = { repos: [], lastUpdate: 0 };

  constructor() {
    this.loadIndex();
  }

  /**
   * Sync current repository
   */
  async syncCurrentRepo(): Promise<GitHubRepo | null> {
    const hasGit = await commandExists("git");
    if (!hasGit) return null;

    try {
      // Get remote URL
      const remoteResult = await safeExec("git remote get-url origin", {
        timeout: 5000,
        ignoreErrors: true,
      });

      if (!remoteResult.success) return null;

      const url = remoteResult.stdout.trim();
      const match = url.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
      if (!match) return null;

      const [, owner, name] = match;

      // Get current branch
      const branchResult = await safeExec("git rev-parse --abbrev-ref HEAD", {
        timeout: 5000,
        ignoreErrors: true,
      });
      const branch = branchResult.success ? branchResult.stdout.trim() : "main";

      // Get last commit
      const commitResult = await safeExec("git rev-parse --short HEAD", {
        timeout: 5000,
        ignoreErrors: true,
      });
      const lastCommit = commitResult.success ? commitResult.stdout.trim() : "";

      // Count tests
      const testCountResult = await safeExec('find tests -name "*.test.ts" | wc -l', {
        timeout: 5000,
        ignoreErrors: true,
      });
      const testCount = testCountResult.success ? parseInt(testCountResult.stdout.trim()) || 0 : 0;

      const repo: GitHubRepo = {
        name,
        owner,
        branch,
        lastSync: Date.now(),
        testCount,
        lastCommit,
        url: `https://github.com/${owner}/${name}`,
      };

      // Update index
      const existingIndex = this.index.repos.findIndex((r) => r.name === name && r.owner === owner);
      if (existingIndex >= 0) {
        this.index.repos[existingIndex] = repo;
      } else {
        this.index.repos.push(repo);
      }

      this.index.lastUpdate = Date.now();
      this.saveIndex();

      return repo;
    } catch {
      return null;
    }
  }

  /**
   * Get all synced repositories
   */
  getRepos(): GitHubRepo[] {
    return this.index.repos;
  }

  /**
   * Get repository stats
   */
  getStats(): {
    totalRepos: number;
    totalTests: number;
    lastSync: number;
  } {
    return {
      totalRepos: this.index.repos.length,
      totalTests: this.index.repos.reduce((sum, r) => sum + r.testCount, 0),
      lastSync: this.index.lastUpdate,
    };
  }

  /**
   * Pull latest changes from origin
   */
  async pullLatest(): Promise<{ success: boolean; message: string }> {
    const hasGit = await commandExists("git");
    if (!hasGit) {
      return { success: false, message: "Git not installed" };
    }

    try {
      const result = await safeExec("git pull origin", {
        timeout: 30000,
        retries: 2,
      });

      return {
        success: result.success,
        message: result.success ? "✅ Pulled latest changes" : `❌ ${result.stderr}`,
      };
    } catch (err: any) {
      return { success: false, message: `❌ ${err.message}` };
    }
  }

  /**
   * Get recent commits
   */
  async getRecentCommits(count: number = 10): Promise<
    Array<{
      hash: string;
      author: string;
      date: string;
      message: string;
    }>
  > {
    const hasGit = await commandExists("git");
    if (!hasGit) return [];

    try {
      const result = await safeExec(
        `git log -${count} --pretty=format:"%h|%an|%ar|%s"`,
        {
          timeout: 5000,
          ignoreErrors: true,
        },
      );

      if (!result.success) return [];

      return result.stdout.split("\n").filter(Boolean).map((line) => {
        const [hash, author, date, message] = line.split("|");
        return { hash, author, date, message };
      });
    } catch {
      return [];
    }
  }

  /**
   * Get files changed in last commit
   */
  async getChangedFiles(): Promise<string[]> {
    const hasGit = await commandExists("git");
    if (!hasGit) return [];

    try {
      const result = await safeExec("git diff --name-only HEAD~1 HEAD", {
        timeout: 5000,
        ignoreErrors: true,
      });

      return result.success ? result.stdout.split("\n").filter(Boolean) : [];
    } catch {
      return [];
    }
  }

  private loadIndex(): void {
    try {
      if (fs.existsSync(this.indexFile)) {
        this.index = JSON.parse(fs.readFileSync(this.indexFile, "utf-8"));
      }
    } catch {
      this.index = { repos: [], lastUpdate: 0 };
    }
  }

  private saveIndex(): void {
    try {
      fs.mkdirSync(path.dirname(this.indexFile), { recursive: true });
      fs.writeFileSync(this.indexFile, JSON.stringify(this.index, null, 2));
    } catch {
      // Ignore save errors
    }
  }
}

export const githubSync = new GitHubSync();
