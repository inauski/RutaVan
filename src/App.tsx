import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import MyRoutes from "./pages/MyRoutes";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 pt-8 sm:px-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/entrar" element={<Auth />} />
          <Route path="/mis-rutas" element={<MyRoutes />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <footer className="border-t border-slate-200 px-4 py-8 text-center text-base text-slate-600">
        RutaVan · Las rutas las genera una IA y pueden contener errores. Comprueba siempre la
        normativa local.
      </footer>
    </div>
  );
}
