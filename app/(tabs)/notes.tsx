import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { addNote, deleteNote, listNotes, updateNote } from '../../src/db/repositories';
import { seed } from '../../src/data/seed';
import { getChapterById } from '../../src/features/chapters/selectors';

const MIN_NOTE_LENGTH = 5;

export default function NotesScreen() {
  const chapterOptions = useMemo(
    () => [...seed.chapters].sort((a, b) => a.chapterNumber - b.chapterNumber),
    [],
  );
  const [notes, setNotes] = useState<any[]>([]);
  const [chapterId, setChapterId] = useState(chapterOptions[0]?.id ?? '');
  const [body, setBody] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [chapterError, setChapterError] = useState('');
  const [bodyError, setBodyError] = useState('');
  const [pendingAction, setPendingAction] = useState<'save' | 'delete' | null>(null);

  const isPending = pendingAction !== null;

  const load = useCallback(async () => {
    setNotes(await listNotes());
  }, []);

  useFocusEffect(useCallback(() => {
    void load();
  }, [load]));

  const validate = () => {
    const chapterValid = Boolean(chapterId && getChapterById(chapterId));
    const trimmedBody = body.trim();
    const noteValid = trimmedBody.length >= MIN_NOTE_LENGTH;

    setChapterError(chapterValid ? '' : 'Please choose a valid chapter.');
    setBodyError(noteValid ? '' : `Note must be at least ${MIN_NOTE_LENGTH} characters long.`);

    return { chapterValid, noteValid, trimmedBody };
  };

  const handleSave = async () => {
    if (isPending) return;

    const { chapterValid, noteValid, trimmedBody } = validate();
    if (!chapterValid || !noteValid) return;

    setPendingAction('save');
    try {
      if (editingId) await updateNote(editingId, trimmedBody);
      else await addNote(chapterId, trimmedBody);
      setBody('');
      setEditingId(null);
      await load();
    } finally {
      setPendingAction(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (isPending) return;

    setPendingAction('delete');
    try {
      await deleteNote(id);
      if (editingId === id) {
        setEditingId(null);
        setBody('');
      }
      await load();
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>Notes</Text>

      <Text style={{ fontWeight: '600' }}>Choose chapter</Text>
      <View style={{ borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8 }}>
        {chapterOptions.map((chapter) => {
          const selected = chapter.id === chapterId;
          return (
            <Pressable
              key={chapter.id}
              disabled={isPending || editingId !== null}
              onPress={() => {
                setChapterId(chapter.id);
                setChapterError('');
              }}
              style={{
                padding: 10,
                backgroundColor: selected ? '#DBEAFE' : '#fff',
                borderBottomWidth: 1,
                borderBottomColor: '#E2E8F0',
                opacity: isPending || editingId !== null ? 0.6 : 1,
              }}
            >
              <Text>{`Chapter ${chapter.chapterNumber}: ${chapter.title}`}</Text>
            </Pressable>
          );
        })}
      </View>
      {chapterError ? <Text style={{ color: '#DC2626' }}>{chapterError}</Text> : null}

      <TextInput
        value={body}
        onChangeText={(value) => {
          setBody(value);
          if (bodyError) setBodyError('');
        }}
        placeholder="Add your note"
        multiline
        editable={!isPending}
        style={{ borderWidth: 1, borderColor: '#CBD5E1', padding: 10, borderRadius: 8, minHeight: 80 }}
      />
      {bodyError ? <Text style={{ color: '#DC2626' }}>{bodyError}</Text> : null}

      <Pressable
        onPress={handleSave}
        disabled={isPending}
        style={{ backgroundColor: '#2563EB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, alignItems: 'center', opacity: isPending ? 0.6 : 1 }}
      >
        <Text style={{ color: '#fff', fontWeight: '700' }}>
          {pendingAction === 'save' ? 'Saving...' : editingId ? 'Update Note' : 'Save Note'}
        </Text>
      </Pressable>

      {notes.length === 0 ? <Text>No notes yet.</Text> : notes.map((note) => (
        <View key={note.id} style={{ backgroundColor: '#fff', padding: 12, borderRadius: 8, gap: 6 }}>
          <Text style={{ fontWeight: '700' }}>{note.chapterId}</Text>
          <Text>{note.body}</Text>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <Text
              onPress={() => {
                if (isPending) return;
                setBody(note.body);
                setEditingId(note.id);
              }}
              style={{ opacity: isPending ? 0.5 : 1 }}
            >
              Edit
            </Text>
            <Text
              onPress={() => void handleDelete(note.id)}
              style={{ opacity: isPending ? 0.5 : 1 }}
            >
              {pendingAction === 'delete' ? 'Deleting...' : 'Delete'}
            </Text>
          </View>
        </View>
      ))}
    </Screen>
  );
}
