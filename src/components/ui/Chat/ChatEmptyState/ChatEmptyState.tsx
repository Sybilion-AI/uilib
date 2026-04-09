import S from './ChatEmptyState.styl';

export function ChatEmptyState() {
  return (
    <div className={S.root}>
      <div className={S.icon} />
      <h2>Chat with a forecast.</h2>
      <p>Instantly get answers about the forecast’s output and reasoning.</p>
    </div>
  );
}
