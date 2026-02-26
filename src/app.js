/*
====================================
LOGIN
====================================
*/

function login() {
  const user = document.getElementById("usuario").value;
  const pass = document.getElementById("password").value;
  const error = document.getElementById("loginError");

  if (user === "admin" && pass === "admin123") {
    localStorage.setItem("rol", "admin");
    window.location.href = "/admin.html";
  } else {
    error.textContent = "Usuario o contraseña incorrectos";
  }
}

/*
====================================
ADMIN PANEL
====================================
*/

document.addEventListener("DOMContentLoaded", () => {
  // ===============================
  // SEGURIDAD POR ROL
  // ===============================

  if (!window.location.pathname.includes("admin.html")) return;

  if (localStorage.getItem("rol") !== "admin") {
    window.location.href = "/index.html";
    return;
  }

  // ===============================
  // REFERENCIAS
  // ===============================

  const tablaBody = document.getElementById("tablaBody");
  const filtroFechaInput = document.getElementById("filtroFecha");
  let reservasActuales = [];
  let mostrarHistorico = false;

  // ===============================
  // UTILIDADES
  // ===============================

  function obtenerReservas() {
    return JSON.parse(localStorage.getItem("reservas")) || [];
  }

  function filtrarPorEstado(reservas) {
    if (mostrarHistorico) {
      return reservas;
    }
    return reservas.filter((r) => r.estado !== "cancelada");
  }

  // ===============================
  // RENDER
  // ===============================

  function renderReservas(reservas = null) {
    let listaReservas = reservas || obtenerReservas();
    listaReservas = filtrarPorEstado(listaReservas);

    // Ordenar por fecha y hora
    listaReservas.sort((a, b) => {
      if (a.fecha === b.fecha) {
        return a.hora.localeCompare(b.hora);
      }
      return a.fecha.localeCompare(b.fecha);
    });

    reservasActuales = listaReservas;
    tablaBody.innerHTML = "";

    if (listaReservas.length === 0) {
      tablaBody.innerHTML = `
        <tr>
          <td colspan="9">No hay reservas registradas</td>
        </tr>
      `;
      return;
    }

    listaReservas.forEach((reserva) => {
      const fila = document.createElement("tr");
      const estado = reserva.estado || "confirmada";
      const claseEstado = estado === "cancelada" ? "cancelada" : "confirmada";

      fila.innerHTML = `
        <td>${reserva.dueno}</td>
        <td>${reserva.mascota}</td>
        <td>${reserva.telefono}</td>
        <td>${reserva.fecha}</td>
        <td>${reserva.hora}</td>
        <td>${reserva.servicio}</td>
        <td>${reserva.profesional}</td>
        <td><span class="estado ${claseEstado}">${estado}</span></td>
        <td>
          <button onclick="cambiarEstado('${reserva.id}')" class="btn-estado">
            ${estado === "cancelada" ? "Restaurar" : "Cancelar"}
          </button>
        </td>
      `;

      tablaBody.appendChild(fila);
    });
  }

  // ===============================
  // CAMBIAR ESTADO
  // ===============================

  window.cambiarEstado = function (id) {
    const reservas = obtenerReservas();
    const reserva = reservas.find((r) => r.id === id);

    if (reserva) {
      reserva.estado =
        reserva.estado === "cancelada" ? "confirmada" : "cancelada";

      localStorage.setItem("reservas", JSON.stringify(reservas));
      filtrarPorFecha();
    }
  };

  // ===============================
  // FILTRO POR FECHA
  // ===============================

  window.filtrarPorFecha = function () {
    const filtroFecha = filtroFechaInput.value;

    if (!filtroFecha) {
      renderReservas();
      return;
    }

    const reservas = obtenerReservas();
    const reservasFiltradas = reservas.filter((r) => r.fecha === filtroFecha);

    renderReservas(reservasFiltradas);
  };

  window.limpiarFiltro = function () {
    filtroFechaInput.value = "";
    renderReservas();
  };

  // ===============================
  // HISTÓRICO
  // ===============================

  window.toggleHistorico = function () {
    mostrarHistorico = document.getElementById("mostrarHistorico").checked;

    filtrarPorFecha();
  };

  // ===============================
  // FECHA POR DEFECTO = HOY
  // ===============================

  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, "0");
  const dd = String(hoy.getDate()).padStart(2, "0");
  const fechaHoy = `${yyyy}-${mm}-${dd}`;

  if (filtroFechaInput) {
    filtroFechaInput.value = fechaHoy;
  }

  // Render inicial filtrando por hoy
  filtrarPorFecha();
});

/*
====================================
LOGOUT
====================================
*/

function logout() {
  localStorage.removeItem("rol");
  window.location.href = "/index.html";
}

/*
====================================
EXPORT PARA TESTING (JEST)
====================================
*/

if (typeof module !== "undefined") {
  module.exports = { login, logout };
}
