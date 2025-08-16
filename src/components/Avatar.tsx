export default function Avatar({
  variant,
}: {
  variant: "small-fixed" | "large-center";
}) {
  if (variant === "small-fixed") {
    return (
      <img
        src="/avatar.png"
        alt="avatar"
        className="w-12 h-12 rounded-full shadow fixed top-16 left-1/2 -translate-x-1/2 z-30"
      />
    );
  }
  // large-center
  return (
    <img
      src="/avatar.png"
      alt="avatar"
      className="w-24 h-24 rounded-full shadow"
    />
  );
}
