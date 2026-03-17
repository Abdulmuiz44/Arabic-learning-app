import { FlashcardPreview } from './FlashcardPreview';
import { LessonPreview } from './LessonPreview';
import { ListeningPreview } from './ListeningPreview';
import { QuizPreview } from './QuizPreview';
import { ChapterPreviewExport } from './models';
import { normalizeChapterPreviewModel } from './normalizePreviewModel';

type ChapterFlowPreviewProps = {
  chapterModel: ChapterPreviewExport;
};

export function ChapterFlowPreview({ chapterModel }: ChapterFlowPreviewProps) {
  const normalized = normalizeChapterPreviewModel(chapterModel);

  return (
    <section>
      <LessonPreview sections={normalized.lessonSections} />
      <FlashcardPreview flashcards={normalized.flashcards} />

      {normalized.quizzes.map((quiz) => (
        <QuizPreview
          key={quiz.id}
          quiz={quiz}
          questions={normalized.questions.filter((question) => question.quizId === quiz.id)}
        />
      ))}

      <ListeningPreview items={normalized.listeningItems} />

      <section>
        <h3>Videos</h3>
        {normalized.videos.length ? (
          <ol>
            {normalized.videos.map((video) => (
              <li key={video.id}>
                {video.title} — {video.youtubeUrl}
              </li>
            ))}
          </ol>
        ) : (
          <p>No videos available.</p>
        )}
      </section>
    </section>
  );
}
