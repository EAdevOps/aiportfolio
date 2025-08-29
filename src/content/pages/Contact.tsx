export default function Contact() {
  return (
    <section className="space-y-3 text-white">
      <h2 className="text-xl font-semibold">Let’s Connect</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Email:{" "}
          <a className="underline" href="mailto:Ehsanaliwalleem@gmail.com">
            Ehsanaliwalleem@gmail.com
          </a>
        </li>
        <li>
          GitHub:{" "}
          <a
            className="underline"
            href="https://github.com/EAdevOps"
            target="_blank"
            rel="noreferrer"
          >
            github.com/EAdevOps
          </a>
        </li>
      </ul>
    </section>
  );
}
