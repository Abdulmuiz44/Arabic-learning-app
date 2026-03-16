import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { EmptyStateCard } from '../../src/components/EmptyStateCard';
import { LoadingCard } from '../../src/components/LoadingCard';
import { Screen } from '../../src/components/Screen';
import { SectionCard } from '../../src/components/SectionCard';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { addNote, deleteNote, listNotes, updateNote } from '../../src/db/repositories';

export default function NotesScreen() {
  const [notes, setNotes] = useState<any[]>([]);
  const [chapterId, setChapterId] = useState('c1');
  const [body, setBody] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    setNotes(await listNotes());
    setIsLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

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

      {isLoading ? (
        <>
          <LoadingCard />
          <LoadingCard />
        </>
      ) : notes.length === 0 ? (
        <EmptyStateCard
          title="No notes yet"
          message="Capture vocabulary, grammar tips, and reflections as you learn."
          ctaLabel="Open books"
          ctaHref="/(tabs)/books"
        />
      ) : notes.map((note) => (
        <SectionCard key={note.id} title={note.chapterId}>
          <Text>{note.body}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <PrimaryButton label="Edit" onPress={() => { setBody(note.body); setEditingId(note.id); }} />
            <PrimaryButton label="Delete" onPress={async () => { await deleteNote(note.id); load(); }} />
          </View>
        </SectionCard>
      ))}
    </Screen>
  );
}
