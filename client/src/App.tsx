import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminCorretores from "./pages/AdminCorretores";
import PainelCorretor from "./pages/PainelCorretor";
import VisualizarProposta from "./pages/VisualizarProposta";
import PaginaCorretor from "./pages/PaginaCorretor";
function Router() {
  return (
    <Switch>
      {/* Rotas fixas — sempre têm prioridade sobre /:slug */}
      <Route path={"/"}>{() => <Home />}</Route>
      <Route path={"/login"} component={Login} />
      <Route path={"/admin/corretores"} component={AdminCorretores} />
      <Route path={"/corretor"} component={PainelCorretor} />
      <Route path="/proposta/:codigo" component={VisualizarProposta} />
      <Route path={"/404"} component={NotFound} />
      {/* Link público do corretor: /:slug — captura apenas após todas as rotas fixas */}
      <Route path="/:slug" component={PaginaCorretor} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
