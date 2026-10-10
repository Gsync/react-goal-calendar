// Text sits in the always-mounted live region only while `live`, so only those changes are spoken.
export function LiveText({ text, live }: { text: string; live: boolean }) {
  return (
    <>
      <span role="status">{live ? text : null}</span>
      {live ? null : text}
    </>
  );
}
