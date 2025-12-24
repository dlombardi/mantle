const YAML = require("yaml");
const fs = require("fs");
const { execFileSync } = require("child_process");

// Load spec
const specContent = fs.readFileSync("docs/reasoning-substrate-project-spec.yaml", "utf8");
const spec = YAML.parse(specContent);

// Get all existing beads
console.log("=== Loading existing beads ===");
const beadsJson = execFileSync("bd", ["list", "--json"], { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
const beads = JSON.parse(beadsJson);
console.log(`Found ${beads.length} beads`);

// Build title -> bead_id map
const titleToBeadId = {};
for (const bead of beads) {
    titleToBeadId[bead.title] = bead.id;
}

// Build task_id -> title map from spec
const taskIdToTitle = {};
const taskDeps = {}; // task_id -> [blocked_by_task_ids]

for (const epic of spec.epics || []) {
    for (const story of epic.stories || []) {
        for (const task of story.tasks || []) {
            taskIdToTitle[task.id] = task.title;
            if (task.blocked_by && task.blocked_by.length) {
                taskDeps[task.id] = task.blocked_by;
            }
        }
    }
}

// Compose: task_id -> bead_id
const taskIdToBeadId = {};
for (const [taskId, title] of Object.entries(taskIdToTitle)) {
    const beadId = titleToBeadId[title];
    if (beadId) {
        taskIdToBeadId[taskId] = beadId;
    } else {
        console.log(`Warning: No bead found for task "${taskId}" with title "${title}"`);
    }
}

console.log(`\nMatched ${Object.keys(taskIdToBeadId).length} tasks to beads`);

// Add dependencies
console.log("\n=== Adding dependencies ===");
let depCount = 0;
let errorCount = 0;

for (const [taskId, blockedByIds] of Object.entries(taskDeps)) {
    const beadId = taskIdToBeadId[taskId];
    if (!beadId) {
        console.log(`Skipping ${taskId}: no bead found`);
        continue;
    }

    for (const blockedById of blockedByIds) {
        const blockerBeadId = taskIdToBeadId[blockedById];
        if (!blockerBeadId) {
            console.log(`Warning: blocker ${blockedById} not found for ${taskId}`);
            continue;
        }

        try {
            // bd dep add [issue-id] [depends-on-id] --type blocks
            // Meaning: beadId depends on blockerBeadId (blockerBeadId blocks beadId)
            execFileSync("bd", ["dep", "add", beadId, blockerBeadId, "--type", "blocks"], { encoding: "utf8" });
            depCount++;
            console.log(`Linked: ${beadId} blocked by ${blockerBeadId}`);
        } catch (e) {
            errorCount++;
            console.error(`Error linking ${beadId} <- ${blockerBeadId}: ${e.message}`);
        }
    }
}

console.log("\n=== Summary ===");
console.log(`Dependencies added: ${depCount}`);
console.log(`Errors: ${errorCount}`);
