import { useEffect, useState } from "react";
import Papa from "papaparse";

const sheetUrl =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vR_lN4MQGP2PigjKJFOV8ZK92MvfpQWj8aH7qqntBJHOKv6XsvLAxriHmjU3WcD7kafNvNbj3pTFqND/pub?gid=0&single=true&output=csv";

export default function App() {
  const [libros, setLibros] = useState([]);
  const [generoSeleccionado, setGeneroSeleccionado] = useState("");
  const [libroRandom, setLibroRandom] = useState(null);
  const [libroSeleccionado, setLibroSeleccionado] = useState(null);

  useEffect(() => {
    Papa.parse(sheetUrl, {
      download: true,
      header: true,
      complete: (results) => {
        const data = results.data.filter((r) => r.Título);
        data.sort((a, b) => a.Título.localeCompare(b.Título));
        setLibros(data);
      },
    });
  }, []);

  const generos = [...new Set(libros.flatMap((l) => l.Género?.split(",") || []))].map((g) =>
    g.trim()
  );

  const filtrados = generoSeleccionado
    ? libros.filter((l) => l.Género?.includes(generoSeleccionado))
    : libros;

  const handleRandom = () => {
    if (libros.length > 0) {
      const random = libros[Math.floor(Math.random() * libros.length)];
      setLibroRandom(random);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-200 to-blue-200 text-gray-800 p-6">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2">📚 Biblioteca Fátima</h1>
        <p className="text-lg">Encuentra recomendaciones de libros y su información</p>
      </header>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Listado de Libros</h2>
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-purple-300">
              <tr>
                <th className="px-4 py-2">Título</th>
                <th className="px-4 py-2">Autor</th>
                <th className="px-4 py-2">Género</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((libro, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-purple-100 cursor-pointer"
                  onClick={() => setLibroSeleccionado(libro)}
                >
                  <td className="px-4 py-2">{libro.Título}</td>
                  <td className="px-4 py-2">{libro.Autor}</td>
                  <td className="px-4 py-2">{libro.Género}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Filtrar por Género</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {generos.map((g, idx) => (
            <button
              key={idx}
              onClick={() => setGeneroSeleccionado(g)}
              className={`px-3 py-1 rounded-full ${
                generoSeleccionado === g
                  ? "bg-purple-600 text-white"
                  : "bg-purple-200 hover:bg-purple-300"
              }`}
            >
              {g}
            </button>
          ))}
          <button
            onClick={() => setGeneroSeleccionado("")}
            className="px-3 py-1 rounded-full bg-gray-300 hover:bg-gray-400"
          >
            Todos
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtrados.map((libro, idx) => (
            <div key={idx} className="bg-white p-4 rounded shadow">
              <h3 className="font-bold text-lg mb-2">{libro.Título}</h3>
              <p><strong>Autor:</strong> {libro.Autor}</p>
              <p><strong>Género:</strong> {libro.Género}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10 text-center">
        <h2 className="text-2xl font-semibold mb-4">Libro al Azar</h2>
        <button
          onClick={handleRandom}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Dame un libro random
        </button>
        {libroRandom && (
          <div className="mt-4 bg-white p-4 rounded shadow inline-block">
            <strong>{libroRandom.Título}</strong> — {libroRandom.Autor} ({libroRandom.Género})
          </div>
        )}
      </section>

      {libroSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow max-w-lg w-full relative">
            <button
              onClick={() => setLibroSeleccionado(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold mb-4">{libroSeleccionado.Título}</h3>
            <p><strong>Autor:</strong> {libroSeleccionado.Autor}</p>
            <p><strong>Género:</strong> {libroSeleccionado.Género}</p>
            <p><strong>Tono:</strong> {libroSeleccionado.Tono}</p>
            <p><strong>Ritmo:</strong> {libroSeleccionado.Ritmo}</p>
            <p><strong>Público:</strong> {libroSeleccionado.Público}</p>
            <p><strong>Etiquetas:</strong> {libroSeleccionado.Etiquetas}</p>
            <p><strong>Flags:</strong> {libroSeleccionado.Flags}</p>
            <p className="mt-2"><strong>Reseña:</strong> {libroSeleccionado.Reseña}</p>
          </div>
        </div>
      )}
    </div>
  );
}