import { useState } from "react";

export default function ConfiguradorTipografias() {
  const [draft, setDraft] = useState({ titulo: 24, subtitulo: 18, parrafo: 14 });
  const [preview, setPreview] = useState(draft);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDraft((prev) => ({ ...prev, [name]: Number(value) || 0 }));
  };

  return (
    <section className="overflow-hidden rounded-md border border-default-secondary bg-default-neutral text-default-background">
      <header className="bg-default-primary px-4 py-3 text-3xl font-bold text-default-background md:text-4xl">
        A Configurador de Tipografías
      </header>

      <div className="grid gap-5 p-3 lg:grid-cols-[420px_1fr]">
        <aside className="rounded-lg bg-default-neutral p-2">
          <h3 className="mb-3 text-2xl font-semibold">↥ Cargar Tipografías</h3>

          <label className="mb-4 block w-full cursor-pointer rounded-md border border-dashed border-default-secondary bg-default-secondary/20 p-4">
            Seleccionar fuente para TÍTULO (.ttf)
            <input type="file" accept=".ttf" hidden />
          </label>

          <label className="mb-4 block w-full cursor-pointer rounded-md border border-dashed border-default-secondary bg-default-secondary/20 p-4">
            Seleccionar fuente para SUBTÍTULO y PÁRRAFO (.ttf)
            <input type="file" accept=".ttf" hidden />
          </label>

          <div className="rounded-lg bg-white p-3">
            <h3 className="mb-3 text-2xl font-semibold">T Tamaños de Fuente</h3>

            <label className="mb-1 block font-medium">Título (px)</label>
            <input
              name="titulo"
              type="number"
              value={draft.titulo}
              onChange={handleChange}
              className="mb-3 w-full rounded-md border border-default-secondary bg-white px-3 py-2 outline-none focus:border-default-accent focus:ring-2 focus:ring-default-accent/30"
            />

            <label className="mb-1 block font-medium">Subtítulo (px)</label>
            <input
              name="subtitulo"
              type="number"
              value={draft.subtitulo}
              onChange={handleChange}
              className="mb-3 w-full rounded-md border border-default-secondary bg-white px-3 py-2 outline-none focus:border-default-accent focus:ring-2 focus:ring-default-accent/30"
            />

            <label className="mb-1 block font-medium">Párrafo (px)</label>
            <input
              name="parrafo"
              type="number"
              value={draft.parrafo}
              onChange={handleChange}
              className="w-full rounded-md border border-default-secondary bg-white px-3 py-2 outline-none focus:border-default-accent focus:ring-2 focus:ring-default-accent/30"
            />

            <button
              type="button"
              onClick={() => setPreview(draft)}
              className="mt-4 w-full rounded-md bg-default-primary px-4 py-2.5 font-semibold text-default-background transition hover:bg-default-secondary"
            >
              ⦿ Aplicar Cambios
            </button>
          </div>
        </aside>

        <main className="rounded-lg bg-default-neutral p-2">
          <h3 className="mb-3 text-2xl font-semibold">◉ Vista Previa</h3>

          <div className="min-h-[430px] rounded-lg border border-default-secondary bg-white p-5">
            <h1 style={{ fontSize: `${preview.titulo}px` }} className="mb-2 font-bold">
              Título de Ejemplo
            </h1>
            <h2
              style={{ fontSize: `${preview.subtitulo}px` }}
              className="mb-3 font-semibold text-default-secondary"
            >
              Subtítulo de Ejemplo
            </h2>
            <p style={{ fontSize: `${preview.parrafo}px` }} className="mb-5 max-w-3xl leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>

            <button
              type="button"
              className="rounded-md bg-default-accent px-4 py-2 text-sm font-semibold text-default-background transition hover:bg-default-secondary"
            >
              ↧ Botón de Ejemplo
            </button>
          </div>
        </main>
      </div>
    </section>
  );
}