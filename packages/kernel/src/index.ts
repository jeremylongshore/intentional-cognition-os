// Workspace
export { initWorkspace, type WorkspaceInfo } from './workspace.js';

// Database
export { initDatabase, runMigrations, closeDatabase, type Database } from './state.js';

// Mounts
export { registerMount, listMounts, getMount, getMountByName, removeMount } from './mounts.js';

// Sources
export {
  registerSource,
  getSource,
  listSources,
  isSourceChanged,
  computeFileHash,
  type RegisterSourceParams,
} from './sources.js';

// Provenance
export {
  recordProvenance,
  getProvenance,
  getDerivations,
  type ProvenanceRecord,
} from './provenance.js';

// Traces
export { writeTrace, readTraces, type TraceRecord } from './traces.js';

// Tasks
export { createTask, transitionTask, getTask, listTasks, type TaskRecord } from './tasks.js';

// Wiki
export { rebuildWikiIndex } from './wiki-index.js';

// Audit
export { appendAuditLog } from './audit-log.js';

// Search
export { createSearchIndex, indexCompiledPages, searchPages, type SearchResult } from './search.js';

// Configuration
export { loadConfig, redactSecrets, type IcoConfig } from './config.js';
export { Logger, createLogger } from './logger.js';
export { version } from './version.js';
