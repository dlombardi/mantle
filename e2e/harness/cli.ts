#!/usr/bin/env bun
/**
 * QA Harness CLI - Command-line interface for Phase 3 verification
 *
 * Usage:
 *   bun run test:qa-harness -- --preview-url=<url> --checklist=<path> --bead-id=<id>
 *
 * Options:
 *   --preview-url  Vercel preview deployment URL (required)
 *   --checklist    Path to qa-checklist.md (required)
 *   --bead-id      Bead ID for artifact output (required)
 *   --iteration    Current iteration 1-3 (default: 1)
 *   --scenario     Override seed scenario (optional)
 *   --headed       Run browser in headed mode (default: headless)
 *   --timeout      Timeout in seconds (default: 300)
 *   --skip-seed    Skip database seeding (for local testing)
 *   --help         Show this help message
 */

import { runQAHarness } from './qa-harness';
import { existsSync } from 'node:fs';

interface ParsedArgs {
  previewUrl?: string;
  checklist?: string;
  beadId?: string;
  iteration: number;
  scenario?: string;
  headed: boolean;
  timeout: number;
  skipSeed: boolean;
  help: boolean;
}

function parseArgs(args: string[]): ParsedArgs {
  const result: ParsedArgs = {
    iteration: 1,
    headed: false,
    timeout: 300,
    skipSeed: false,
    help: false,
  };

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      result.help = true;
    } else if (arg === '--headed') {
      result.headed = true;
    } else if (arg === '--skip-seed') {
      result.skipSeed = true;
    } else if (arg.startsWith('--preview-url=')) {
      result.previewUrl = arg.slice('--preview-url='.length);
    } else if (arg.startsWith('--checklist=')) {
      result.checklist = arg.slice('--checklist='.length);
    } else if (arg.startsWith('--bead-id=')) {
      result.beadId = arg.slice('--bead-id='.length);
    } else if (arg.startsWith('--iteration=')) {
      result.iteration = parseInt(arg.slice('--iteration='.length), 10) || 1;
    } else if (arg.startsWith('--scenario=')) {
      result.scenario = arg.slice('--scenario='.length);
    } else if (arg.startsWith('--timeout=')) {
      result.timeout = parseInt(arg.slice('--timeout='.length), 10) || 300;
    }
  }

  return result;
}

function printHelp(): void {
  console.log(`
QA Harness - Automated verification for the three-phase agentic workflow

Usage:
  bun run test:qa-harness -- [options]

Required:
  --preview-url=<url>   Vercel preview deployment URL
  --checklist=<path>    Path to qa-checklist.md artifact
  --bead-id=<id>        Bead ID for artifact output

Optional:
  --iteration=<n>       Current iteration 1-3 (default: 1)
  --scenario=<name>     Override seed scenario from checklist
  --headed              Run browser in headed mode (default: headless)
  --timeout=<seconds>   Timeout in seconds (default: 300)
  --skip-seed           Skip database seeding (for local testing)
  --help, -h            Show this help message

Examples:
  bun run test:qa-harness -- \\
    --preview-url=https://mantle-abc123.vercel.app \\
    --checklist=.beads/artifacts/bead-001/qa-checklist.md \\
    --bead-id=bead-001

  bun run test:qa-harness -- \\
    --preview-url=http://localhost:3000 \\
    --checklist=.beads/artifacts/bead-002/qa-checklist.md \\
    --bead-id=bead-002 \\
    --iteration=2 \\
    --headed
`);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  // Validate required arguments
  const errors: string[] = [];

  if (!args.previewUrl) {
    errors.push('Missing required argument: --preview-url');
  }

  if (!args.checklist) {
    errors.push('Missing required argument: --checklist');
  } else if (!existsSync(args.checklist)) {
    errors.push(`Checklist file not found: ${args.checklist}`);
  }

  if (!args.beadId) {
    errors.push('Missing required argument: --bead-id');
  }

  if (args.iteration < 1 || args.iteration > 3) {
    errors.push('Iteration must be between 1 and 3');
  }

  if (errors.length > 0) {
    console.error('Error:');
    errors.forEach((e) => console.error(`  ${e}`));
    console.error('\nRun with --help for usage information.');
    process.exit(1);
  }

  // Run the harness
  const result = await runQAHarness({
    previewUrl: args.previewUrl!,
    checklistPath: args.checklist!,
    beadId: args.beadId!,
    iteration: args.iteration,
    scenario: args.scenario,
    headless: !args.headed,
    timeout: args.timeout * 1000,
    skipSeed: args.skipSeed,
  });

  // Exit with appropriate code
  process.exit(result.success ? 0 : 1);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
