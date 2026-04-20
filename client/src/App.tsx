import ProtectedRoute from "@/features/auth/ProtectedRoute";
import { Route, Switch } from "wouter";

import Corporativo from "@/pages/Corporativo";
import EventosExclusivos from "@/pages/EventosExclusivos";
import Formatura from "@/pages/Formatura";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";

import Comercial from "@/features/comercial/pages/Comercial";
import Marketing from "@/features/marketing/pages/Marketing";

import SplashScreen from "@/components/SplashScreen";

export default function App() {
  return (
    <>
      {/* Global Splash Screen */}
      <SplashScreen />

      {/* Routes */}
      <Switch>
        {/* ── Públicas ──────────────────────────────────────────────────── */}
        <Route path="/"                   component={Home}             />
        <Route path="/corporativo"        component={Corporativo}      />
        <Route path="/formatura"          component={Formatura}        />
        <Route path="/eventos-exclusivos" component={EventosExclusivos}/>
        <Route path="/login"              component={Login}            />

        {/* ── Dashboard Comercial ───────────────────────────────────────── */}
        <Route path="/comercial">
          <ProtectedRoute allowedRoles={["comercial"]}>
            <Comercial />
          </ProtectedRoute>
        </Route>

        {/* ── Dashboard Marketing ───────────────────────────────────────── */}
        <Route path="/marketing">
          <ProtectedRoute allowedRoles={["marketing"]}>
            <Marketing />
          </ProtectedRoute>
        </Route>

        {/* ── 404 ───────────────────────────────────────────────────────── */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}
