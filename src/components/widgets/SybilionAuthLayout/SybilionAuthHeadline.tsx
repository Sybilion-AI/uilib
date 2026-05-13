import S from './SybilionAuthHeadline.styl';

export function SybilionAuthHeadline() {
  return (
    <div className={S.root}>
      <div className={S.headline}>
        <p className={S.headlineParagraph}>
          <span>External volatility</span>
          <span></span>
        </p>
        <p className={S.headlineParagraph}>turned into</p>
        <p className={S.headlineParagraph}>
          <span className={S.headlineCyan}>confident decisions</span>
        </p>
      </div>
    </div>
  );
}
