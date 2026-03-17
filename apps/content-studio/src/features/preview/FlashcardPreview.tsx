import { FlashcardExport } from './models';
import { sortFlashcardsForPreview } from './normalizePreviewModel';

type FlashcardPreviewProps = {
  flashcards: FlashcardExport[];
};

export function FlashcardPreview({ flashcards }: FlashcardPreviewProps) {
  const orderedFlashcards = sortFlashcardsForPreview(flashcards);

  if (!orderedFlashcards.length) {
    return <p>No flashcards available.</p>;
  }

  return (
    <section>
      <h3>Flashcards</h3>
      <ol>
        {orderedFlashcards.map((flashcard) => (
          <li key={flashcard.id}>
            <strong>{flashcard.arabic}</strong> ({flashcard.transliteration}) — {flashcard.meaning}
          </li>
        ))}
      </ol>
    </section>
  );
}
