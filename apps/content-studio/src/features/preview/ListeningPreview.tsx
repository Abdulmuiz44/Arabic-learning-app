import { ListeningExport } from './models';
import { sortListeningItemsForPreview } from './normalizePreviewModel';

type ListeningPreviewProps = {
  items: ListeningExport[];
};

const getAudioMetadataState = (item: ListeningExport) => {
  if (item.audioUrl) {
    return `Remote audio (${item.audioUrl})`;
  }
  if (item.localAudioKey) {
    return `Local audio key (${item.localAudioKey})`;
  }
  return 'Audio unavailable';
};

export function ListeningPreview({ items }: ListeningPreviewProps) {
  const orderedItems = sortListeningItemsForPreview(items);

  if (!orderedItems.length) {
    return <p>No listening items available.</p>;
  }

  return (
    <section>
      <h3>Listening</h3>
      {orderedItems.map((item) => (
        <article key={item.id}>
          <p>
            <strong>Prompt:</strong> {item.promptText}
          </p>
          <p>
            <strong>Text:</strong> {item.arabic}
          </p>
          <p>
            <strong>Translation:</strong> {item.translation}
          </p>
          <p>
            <strong>Audio metadata:</strong> {getAudioMetadataState(item)}
          </p>
        </article>
      ))}
    </section>
  );
}
