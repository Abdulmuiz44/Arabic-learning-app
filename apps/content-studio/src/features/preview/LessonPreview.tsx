import { LessonSectionExport } from './models';
import { sortLessonSectionsForPreview } from './normalizePreviewModel';

type LessonPreviewProps = {
  sections: LessonSectionExport[];
};

export function LessonPreview({ sections }: LessonPreviewProps) {
  const orderedSections = sortLessonSectionsForPreview(sections);

  if (!orderedSections.length) {
    return <p>No lesson sections available.</p>;
  }

  return (
    <section>
      <h3>Lesson</h3>
      {orderedSections.map((section) => (
        <article key={section.id}>
          <h4>{section.heading}</h4>
          <p>{section.body}</p>
        </article>
      ))}
    </section>
  );
}
