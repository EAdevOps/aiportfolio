export default function Header() {
  return (
    <header className="fixed z-20 flex items-center h-[10vh] w-full relative">
      <a href="/" className="z-10">
        <img src="/logo1.png" alt="logo1" className="w-15 h-15 m-[10px]" />
      </a>

      <h1
        className="
      font-logo text-xl sm:text-2xl font-semibold
      absolute inset-x-0 mx-auto text-center
    "
      >
        EHSAN AI
      </h1>
    </header>
  );
}
