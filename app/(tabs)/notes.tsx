import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { Screen } from '../../src/components/Screen';
import { useTheme } from '../../src/constants/theme';
import { addNote, deleteNote, listNotes, updateNote } from '../../src/db/repositories';

export default function NotesScreen() {
  const { colors } = useTheme();
  const [notes, setNotes] = useState<any[]>([]);
  const [chapterId, setChapterId] = useState('c1');
  const [body, setBody] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setNotes(await listNotes());
  }, []);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text }}>Notes</Text>
      <TextInput value={chapterId} onChangeText={setChapterId} placeholder="Chapter id (e.g c1)" placeholderTextColor={colors.muted} style={{ borderWidth: 1, borderColor: colors.border, color: colors.text, padding: 10, borderRadius: 8, backgroundColor: colors.card }} />
      <TextInput value={body} onChangeText={setBody} placeholder="Add your note" placeholderTextColor={colors.muted} multiline style={{ borderWidth: 1, borderColor: colors.border, color: colors.text, padding: 10, borderRadius: 8, minHeight: 80, backgroundColor: colors.card }} />
      <PrimaryButton
        label={editingId ? 'Update Note' : 'Save Note'}
        onPress={async () => {
          if (!body.trim()) return;
          if (editingId) await updateNote(editingId, body.trim());
          else await addNote(chapterId, body.trim());
          setBody('');
          setEditingId(null);
          load();
        }}
      />

      {notes.length === 0 ? <Text style={{ color: colors.muted }}>No notes yet.</Text> : notes.map((note) => (
        <View key={note.id} style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, padding: 12, borderRadius: 8, gap: 6 }}>
          <Text style={{ fontWeight: '700', color: colors.text }}>{note.chapterId}</Text>
          <Text style={{ color: colors.text }}>{note.body}</Text>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <Text style={{ color: colors.link }} onPress={() => { setBody(note.body); setEditingId(note.id); }}>Edit</Text>
            <Text style={{ color: colors.link }} onPress={async () => { await deleteNote(note.id); load(); }}>Delete</Text>
          </View>
        </View>
      ))}
    </Screen>
  );
}
