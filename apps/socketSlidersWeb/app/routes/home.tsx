import type { Route } from "./+types/home";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "SocketSliders - 3D Printable Socket Holders" },
    {
      name: "description",
      content: "Generate custom 3D printable socket holders",
    },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">SocketSliders</h1>
        <p className="text-xl text-gray-700 mb-8">
          Generate custom 3D printable socket holders for your workshop.
          Parametric designs for metric and imperial sockets, vertical or
          horizontal orientations.
        </p>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Features
          </h2>
          <ul className="text-left space-y-2 text-gray-600">
            <li>✓ Vertical and horizontal socket holder designs</li>
            <li>✓ Support for metric and imperial measurements</li>
            <li>✓ Parametric OpenSCAD generation</li>
            <li>✓ Custom labels embossed on holders</li>
            <li>✓ Download ready-to-print STL files</li>
          </ul>
        </div>

        <Link
          to="/generators"
          className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
        >
          Generate Socket Holder
        </Link>
      </div>
    </div>
  );
}
