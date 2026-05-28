import { createBrowserRouter } from "react-router";
import { SplashScreen } from "./screens/SplashScreen";
import { Login } from "./screens/Login";
import { Dashboard } from "./screens/Dashboard";
import { RegistroInsumos } from "./screens/RegistroInsumos";
import { ReporteFaltantes } from "./screens/ReporteFaltantes";
import { RegistroOrdenes } from "./screens/RegistroOrdenes";
import { ConsultaOrdenes } from "./screens/ConsultaOrdenes";
import { GestionProduccion } from "./screens/GestionProduccion";
import { PriorizacionOrdenes } from "./screens/PriorizacionOrdenes";
import { ProduccionSedes } from "./screens/ProduccionSedes";
import { EliminacionOrdenes } from "./screens/EliminacionOrdenes";
import { InventarioAutomatico } from "./screens/InventarioAutomatico";
import { HistorialMovimientos } from "./screens/HistorialMovimientos";
import { EditarInsumo } from "./screens/EditarInsumo";
import { EditarOrden } from "./screens/EditarOrden";

export const router = createBrowserRouter([
  { path: "/", Component: SplashScreen },
  { path: "/login", Component: Login },
  { path: "/dashboard", Component: Dashboard },
  { path: "/insumos/registro", Component: RegistroInsumos },
  { path: "/insumos/faltantes", Component: ReporteFaltantes },
  { path: "/insumos/editar/:id", Component: EditarInsumo },
  { path: "/ordenes/registro", Component: RegistroOrdenes },
  { path: "/ordenes/consulta", Component: ConsultaOrdenes },
  { path: "/ordenes/editar/:id", Component: EditarOrden },
  { path: "/produccion/gestion", Component: GestionProduccion },
  { path: "/ordenes/priorizacion", Component: PriorizacionOrdenes },
  { path: "/produccion/sedes", Component: ProduccionSedes },
  { path: "/ordenes/eliminacion", Component: EliminacionOrdenes },
  { path: "/insumos/inventario", Component: InventarioAutomatico },
  { path: "/insumos/historial", Component: HistorialMovimientos },
]);
