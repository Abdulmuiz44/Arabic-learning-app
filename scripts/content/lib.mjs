export const CONTENT_KEYS = ['books', 'chapters', 'lesson_sections', 'flashcards', 'listening_items', 'quizzes', 'questions', 'videos'];

const CORRECT_OPTIONS = new Set(['A', 'B', 'C', 'D']);
const LISTENING_DIFFICULTIES = new Set(['easy', 'medium', 'hard']);

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;
const isPositiveInt = (v) => Number.isInteger(v) && v > 0;
const isNonNegativeInt = (v) => Number.isInteger(v) && v >= 0;

const normalizeText = (value) => value.replace(/\s+/g, ' ').trim();

const normalizeEntity = (item) => {
  const out = { ...item };
  for (const [k, v] of Object.entries(out)) if (typeof v === 'string') out[k] = normalizeText(v);
  return out;
};

export function normalizeContent(content) {
  return {
    books: content.books.map(normalizeEntity).sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id)),
    chapters: content.chapters.map(normalizeEntity).sort((a, b) => a.bookId.localeCompare(b.bookId) || a.chapterNumber - b.chapterNumber || a.id.localeCompare(b.id)),
    lesson_sections: content.lesson_sections.map(normalizeEntity).sort((a, b) => a.chapterId.localeCompare(b.chapterId) || a.orderIndex - b.orderIndex || a.id.localeCompare(b.id)),
    flashcards: content.flashcards.map(normalizeEntity).sort((a, b) => a.chapterId.localeCompare(b.chapterId) || a.id.localeCompare(b.id)),
    listening_items: content.listening_items.map(normalizeEntity).sort((a, b) => a.chapterId.localeCompare(b.chapterId) || a.orderIndex - b.orderIndex || a.id.localeCompare(b.id)),
    quizzes: content.quizzes.map(normalizeEntity).sort((a, b) => a.chapterId.localeCompare(b.chapterId) || a.id.localeCompare(b.id)),
    questions: content.questions.map(normalizeEntity).sort((a, b) => a.quizId.localeCompare(b.quizId) || a.id.localeCompare(b.id)),
    videos: content.videos.map(normalizeEntity).sort((a, b) => a.chapterId.localeCompare(b.chapterId) || a.id.localeCompare(b.id)),
  };
}

const duplicateIssues = (items, file) => {
  const seen = new Set();
  const issues = [];
  for (const item of items) {
    if (seen.has(item.id)) issues.push({ file, recordId: item.id, message: `Duplicate id "${item.id}" found` });
    seen.add(item.id);
  }
  return issues;
};

const requireStrings = (record, fields, file, recordId, issues) => {
  for (const field of fields) if (!isNonEmptyString(record[field])) issues.push({ file, recordId, message: `${field} is required and must be a non-empty string` });
};

const validUrl = (value) => {
  if (!isNonEmptyString(value)) return false;
  try { new URL(value); return true; } catch { return false; }
};

const validateOptionalAudio = (record, file, recordId, issues, urlField, keyField) => {
  if (record[urlField] !== undefined && !validUrl(record[urlField])) {
    issues.push({ file, recordId, message: `${urlField} must be a valid URL when provided` });
  }
  if (record[keyField] !== undefined && !isNonEmptyString(record[keyField])) {
    issues.push({ file, recordId, message: `${keyField} must be a non-empty string when provided` });
  }
};

export function validateContent(raw) {
  const issues = [];
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { content: null, issues: [{ file: 'content', message: 'Content root must be an object' }] };

  const canonical = {
    books: [], chapters: [], lesson_sections: [], flashcards: [], listening_items: [], quizzes: [], questions: [], videos: [],
  };

  for (const [file, key] of [['books.json', 'books'], ['chapters.json', 'chapters'], ['lesson_sections.json', 'lesson_sections'], ['flashcards.json', 'flashcards'], ['listening_items.json', 'listening_items'], ['quizzes.json', 'quizzes'], ['questions.json', 'questions'], ['videos.json', 'videos']]) {
    if (!Array.isArray(raw[key])) issues.push({ file, message: 'Expected top-level array' });
  }

  for (const item of raw.books || []) {
    const file='books.json'; if (!item || typeof item !== 'object' || Array.isArray(item)) { issues.push({file,message:'Each record must be an object'}); continue; }
    const recordId = typeof item.id === 'string' ? item.id : undefined;
    requireStrings(item,['id','slug','title','subtitle','description','coverColor'],file,recordId,issues);
    if (!isNonNegativeInt(item.sortOrder)) issues.push({file,recordId,message:'sortOrder must be a non-negative integer'});
    if (!isNonEmptyString(item.coverColor) || !/^#[0-9A-Fa-f]{6}$/.test(item.coverColor)) issues.push({file,recordId,message:'coverColor must be hex like #AABBCC'});
    if (isNonEmptyString(item.id)) canonical.books.push(item);
  }

  for (const item of raw.chapters || []) {
    const file='chapters.json'; if (!item || typeof item !== 'object' || Array.isArray(item)) { issues.push({file,message:'Each record must be an object'}); continue; }
    const recordId=typeof item.id==='string'?item.id:undefined;
    requireStrings(item,['id','bookId','title','description'],file,recordId,issues);
    if (!isPositiveInt(item.chapterNumber)) issues.push({file,recordId,message:'chapterNumber must be a positive integer'});
    if (!isPositiveInt(item.estimatedMinutes)) issues.push({file,recordId,message:'estimatedMinutes must be a positive integer'});
    validateOptionalAudio(item, file, recordId, issues, 'chapterAudioUrl', 'chapterLocalAudioKey');
    if (isNonEmptyString(item.id)) canonical.chapters.push(item);
  }

  for (const item of raw.lesson_sections || []) {
    const file='lesson_sections.json'; if (!item || typeof item !== 'object' || Array.isArray(item)) { issues.push({file,message:'Each record must be an object'}); continue; }
    const recordId=typeof item.id==='string'?item.id:undefined;
    requireStrings(item,['id','chapterId','heading','body'],file,recordId,issues);
    if (!isPositiveInt(item.orderIndex)) issues.push({file,recordId,message:'orderIndex must be a positive integer'});
    if (isNonEmptyString(item.id)) canonical.lesson_sections.push(item);
  }

  for (const item of raw.flashcards || []) {
    const file='flashcards.json'; if (!item || typeof item !== 'object' || Array.isArray(item)) { issues.push({file,message:'Each record must be an object'}); continue; }
    const recordId=typeof item.id==='string'?item.id:undefined;
    requireStrings(item,['id','chapterId','arabic','transliteration','meaning','example'],file,recordId,issues);
    validateOptionalAudio(item, file, recordId, issues, 'audioUrl', 'localAudioKey');
    if (isNonEmptyString(item.id)) canonical.flashcards.push(item);
  }

  for (const item of raw.listening_items || []) {
    const file='listening_items.json'; if (!item || typeof item !== 'object' || Array.isArray(item)) { issues.push({file,message:'Each record must be an object'}); continue; }
    const recordId=typeof item.id==='string'?item.id:undefined;
    requireStrings(item,['id','chapterId','promptText','arabic','transliteration','translation'],file,recordId,issues);
    if (!isPositiveInt(item.orderIndex)) issues.push({file,recordId,message:'orderIndex must be a positive integer'});
    if (!isNonEmptyString(item.difficulty) || !LISTENING_DIFFICULTIES.has(item.difficulty)) issues.push({file,recordId,message:'difficulty must be one of easy, medium, hard'});
    validateOptionalAudio(item, file, recordId, issues, 'audioUrl', 'localAudioKey');
    if (isNonEmptyString(item.id)) canonical.listening_items.push(item);
  }

  for (const item of raw.quizzes || []) {
    const file='quizzes.json'; if (!item || typeof item !== 'object' || Array.isArray(item)) { issues.push({file,message:'Each record must be an object'}); continue; }
    const recordId=typeof item.id==='string'?item.id:undefined;
    requireStrings(item,['id','chapterId','title'],file,recordId,issues);
    if (isNonEmptyString(item.id)) canonical.quizzes.push(item);
  }

  for (const item of raw.questions || []) {
    const file='questions.json'; if (!item || typeof item !== 'object' || Array.isArray(item)) { issues.push({file,message:'Each record must be an object'}); continue; }
    const recordId=typeof item.id==='string'?item.id:undefined;
    requireStrings(item,['id','quizId','prompt','optionA','optionB','optionC','optionD','explanation'],file,recordId,issues);
    if (!isNonEmptyString(item.correctOption) || !CORRECT_OPTIONS.has(item.correctOption)) issues.push({file,recordId,message:'correctOption must be one of A, B, C, D'});
    if (isNonEmptyString(item.id)) canonical.questions.push(item);
  }

  for (const item of raw.videos || []) {
    const file='videos.json'; if (!item || typeof item !== 'object' || Array.isArray(item)) { issues.push({file,message:'Each record must be an object'}); continue; }
    const recordId=typeof item.id==='string'?item.id:undefined;
    requireStrings(item,['id','chapterId','title','youtubeUrl'],file,recordId,issues);
    if (!validUrl(item.youtubeUrl)) issues.push({file,recordId,message:'youtubeUrl must be a valid URL'});
    if (isNonEmptyString(item.id)) canonical.videos.push(item);
  }

  const normalized = normalizeContent(canonical);
  issues.push(...duplicateIssues(normalized.books,'books.json'));
  issues.push(...duplicateIssues(normalized.chapters,'chapters.json'));
  issues.push(...duplicateIssues(normalized.lesson_sections,'lesson_sections.json'));
  issues.push(...duplicateIssues(normalized.flashcards,'flashcards.json'));
  issues.push(...duplicateIssues(normalized.listening_items,'listening_items.json'));
  issues.push(...duplicateIssues(normalized.quizzes,'quizzes.json'));
  issues.push(...duplicateIssues(normalized.questions,'questions.json'));
  issues.push(...duplicateIssues(normalized.videos,'videos.json'));

  const bookIds = new Set(normalized.books.map((x)=>x.id));
  const chapterIds = new Set(normalized.chapters.map((x)=>x.id));
  const quizIds = new Set(normalized.quizzes.map((x)=>x.id));

  for (const x of normalized.chapters) if (!bookIds.has(x.bookId)) issues.push({file:'chapters.json',recordId:x.id,message:`Missing parent book "${x.bookId}"`});
  for (const x of normalized.lesson_sections) if (!chapterIds.has(x.chapterId)) issues.push({file:'lesson_sections.json',recordId:x.id,message:`Missing parent chapter "${x.chapterId}"`});
  for (const x of normalized.flashcards) if (!chapterIds.has(x.chapterId)) issues.push({file:'flashcards.json',recordId:x.id,message:`Missing parent chapter "${x.chapterId}"`});
  for (const x of normalized.listening_items) if (!chapterIds.has(x.chapterId)) issues.push({file:'listening_items.json',recordId:x.id,message:`Missing parent chapter "${x.chapterId}"`});
  for (const x of normalized.quizzes) if (!chapterIds.has(x.chapterId)) issues.push({file:'quizzes.json',recordId:x.id,message:`Missing parent chapter "${x.chapterId}"`});
  for (const x of normalized.questions) if (!quizIds.has(x.quizId)) issues.push({file:'questions.json',recordId:x.id,message:`Missing parent quiz "${x.quizId}"`});
  for (const x of normalized.videos) if (!chapterIds.has(x.chapterId)) issues.push({file:'videos.json',recordId:x.id,message:`Missing parent chapter "${x.chapterId}"`});

  const chapterNumbersByBook = new Map();
  for (const chapter of normalized.chapters) {
    const set = chapterNumbersByBook.get(chapter.bookId) || new Set();
    if (set.has(chapter.chapterNumber)) issues.push({file:'chapters.json',recordId:chapter.id,message:`Duplicate chapterNumber ${chapter.chapterNumber} inside book "${chapter.bookId}"`});
    set.add(chapter.chapterNumber);
    chapterNumbersByBook.set(chapter.bookId,set);
  }

  return { content: normalized, issues };
}

export const formatIssues = (issues) => issues.map((issue) => `- ${issue.file}${issue.recordId ? ` [${issue.recordId}]` : ''}: ${issue.message}`).join('\n');
