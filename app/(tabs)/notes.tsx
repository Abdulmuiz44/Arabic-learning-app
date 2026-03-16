import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { addNote, deleteNote, listNotes, updateNote } from '../../src/db/repositories';

export default function NotesScreen() {
  const [notes, setNotes] = useState<any[]>([]);
  const [chapterId, setChapterId] = useState('c1');
  const [body, setBody] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setNotes(await listNotes());
  }, []);

  useFocusEffect(load);

  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>Notes</Text>
      <TextInput value={chapterId} onChangeText={setChapterId} placeholder="Chapter id (e.g c1)" style={{ borderWidth: 1, borderColor: '#CBD5E1', padding: 10, borderRadius: 8 }} />
      <TextInput value={body} onChangeText={setBody} placeholder="Add your note" multiline style={{ borderWidth: 1, borderColor: '#CBD5E1', padding: 10, borderRadius: 8, minHeight: 80 }} />
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

      {notes.length === 0 ? <Text>No notes yet.</Text> : notes.map((note) => (
        <View key={note.id} style={{ backgroundColor: '#fff', padding: 12, borderRadius: 8, gap: 6 }}>
          <Text style={{ fontWeight: '700' }}>{note.chapterId}</Text>
          <Text>{note.body}</Text>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <Text onPress={() => { setBody(note.body); setEditingId(note.id); }}>Edit</Text>
            <Text onPress={async () => { await deleteNote(note.id); load(); }}>Delete</Text>
          </View>
        </View>
      ))}
    </Screen>
  );
}
