const NOTES_DRAFT_PREFIX = 'validation-notes-draft:';

export function getNotesDraftKey(taskId: string): string {
  return `${NOTES_DRAFT_PREFIX}${taskId}`;
}

function storageAvailable(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readNotesDraft(taskId: string | undefined): string {
  if (!taskId) {
    return '';
  }

  try {
    return storageAvailable()?.getItem(getNotesDraftKey(taskId)) ?? '';
  } catch {
    return '';
  }
}

export function writeNotesDraft(taskId: string | undefined, notes: string): void {
  if (!taskId) {
    return;
  }

  try {
    storageAvailable()?.setItem(getNotesDraftKey(taskId), notes);
  } catch {
    // Draft persistence is best-effort; verification must keep working.
  }
}

export function clearNotesDraft(taskId: string | undefined): void {
  if (!taskId) {
    return;
  }

  try {
    storageAvailable()?.removeItem(getNotesDraftKey(taskId));
  } catch {
    // Draft cleanup is best-effort.
  }
}
