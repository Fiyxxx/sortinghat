const STORAGE_KEY = 'sortinghat_quiz_draft';

export function saveFormDraft(data: any) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save form draft:', error);
  }
}

export function loadFormDraft(): any | null {
  if (typeof window === 'undefined') return null;
  try {
    const draft = localStorage.getItem(STORAGE_KEY);
    return draft ? JSON.parse(draft) : null;
  } catch (error) {
    console.error('Failed to load form draft:', error);
    return null;
  }
}

export function clearFormDraft() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear form draft:', error);
  }
}
