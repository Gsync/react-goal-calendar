// The live region is always mounted but holds the text only when `live`, so only changes made
// while live are announced. Otherwise the text sits beside it, read once either way.
export function LiveText({ text, live }: { text: string; live: boolean }) {
  return (
    <>
      <span role="status">{live ? text : null}</span>
      {live ? null : text}
    </>
  );
}
