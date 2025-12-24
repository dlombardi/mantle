const YAML = require("yaml");
const fs = require("fs");
const { execFileSync } = require("child_process");

// Load cleaned spec
const specContent = fs.readFileSync("docs/reasoning-substrate-project-spec.yaml", "utf8");
const spec = YAML.parse(specContent);

// Track created beads for dependency resolution
const createdBeads = {};  // task_id -> bead_id
const tasksWithDeps = [];

console.log("=== Pass 1: Creating beads ===");
let count = 0;

for (const epic of spec.epics || []) {
    for (const story of epic.stories || []) {
        for (const task of story.tasks || []) {
            const taskId = task.id;

            // Build description with acceptance criteria
            const descParts = [(task.description || "").trim()];

            if (task.prd_refs && task.prd_refs.length) {
                descParts.push("\n## PRD References\n- " + task.prd_refs.join("\n- "));
            }

            if (task.acceptance_criteria && task.acceptance_criteria.length) {
                descParts.push("\n## Acceptance Criteria");
                for (const ac of task.acceptance_criteria) {
                    descParts.push("- [ ] " + ac);
                }
            }

            if (task.effort_hours) {
                descParts.push("\n## Effort\n" + task.effort_hours + " hours");
            }

            const description = descParts.join("\n");
            const priority = String(task.priority ?? 2);
            const taskType = task.type || "task";

            try {
                // Use execFileSync with array of arguments (safe from injection)
                const result = execFileSync("bd", [
                    "create", task.title,
                    "--type", taskType,
                    "--priority", priority,
                    "--description", description,
                    "--json"
                ], { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });

                const beadData = JSON.parse(result);
                const beadId = beadData.id;
                if (beadId) {
                    createdBeads[taskId] = beadId;
                    count++;
                    console.log(`Created: ${beadId} <- ${taskId}`);

                    if (task.blocked_by && task.blocked_by.length) {
                        tasksWithDeps.push({
                            taskId,
                            beadId,
                            blockedBy: task.blocked_by
                        });
                    }
                }
            } catch (e) {
                console.error("Error creating bead for " + taskId + ": " + e.message);
            }
        }
    }
}

console.log("\nCreated " + count + " beads");

console.log("\n=== Pass 2: Adding dependencies ===");
let depCount = 0;

for (const taskInfo of tasksWithDeps) {
    for (const blockedById of taskInfo.blockedBy) {
        const blockerBeadId = createdBeads[blockedById];
        if (blockerBeadId) {
            try {
                execFileSync("bd", ["dep", "add", taskInfo.beadId, blockerBeadId, "--type", "blocks"], { encoding: "utf8" });
                depCount++;
                console.log(`Linked: ${taskInfo.beadId} blocked by ${blockerBeadId}`);
            } catch (e) {
                console.error("Error linking: " + e.message);
            }
        } else {
            console.log("Warning: blocker " + blockedById + " not found for " + taskInfo.taskId);
        }
    }
}

console.log("\n=== Summary ===");
console.log("Beads created: " + count);
console.log("Dependencies linked: " + depCount);
