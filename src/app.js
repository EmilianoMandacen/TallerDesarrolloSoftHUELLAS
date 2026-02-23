/*
Login
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

/*Admin*/

document.addEventListener("DOMContentLoaded", () => {
  // ===============================
  // SEGURIDAD POR ROL (ADMIN)
  // ===============================
  if (!window.location.pathname.includes("admin.html")) return;

  if (localStorage.getItem("rol") !== "admin") {
    window.location.href = "/index.html";
    return;
  }
  // ===============================
  // DATOS
  // ===============================
  const tablaBody = document.getElementById("tablaBody");
  let reservasActuales = [];
  let mostrarHistorico = false;

  function obtenerReservas() {
    return JSON.parse(localStorage.getItem("reservas")) || [];
  }

  function filtrarPorEstado(reservas) {
    if (mostrarHistorico) {
      return reservas;
    }
    return reservas.filter((r) => r.estado !== "cancelada");
  }

  function renderReservas(reservas = null) {
    let listaReservas = reservas || obtenerReservas();
    listaReservas = filtrarPorEstado(listaReservas);
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

  window.cambiarEstado = function (id) {
    const reservas = obtenerReservas();
    const reserva = reservas.find((r) => r.id === id);

    if (reserva) {
      reserva.estado =
        reserva.estado === "cancelada" ? "confirmada" : "cancelada";
      localStorage.setItem("reservas", JSON.stringify(reservas));
      renderReservas();
    }
  };

  window.filtrarPorFecha = function () {
    const filtroFecha = document.getElementById("filtroFecha").value;
    if (!filtroFecha) {
      renderReservas();
      return;
    }

    const reservas = obtenerReservas();
    const reservasFiltradas = reservas.filter((r) => r.fecha === filtroFecha);
    renderReservas(reservasFiltradas);
  };

  window.toggleHistorico = function () {
    mostrarHistorico = document.getElementById("mostrarHistorico").checked;
    renderReservas();
  };

  window.limpiarFiltro = function () {
    document.getElementById("filtroFecha").value = "";
    renderReservas();
  };

  renderReservas();
});

function logout() {
  localStorage.removeItem("rol");
  window.location.href = "/index.html";
}

// Export functions for testing in Node (Jest)
if (typeof module !== "undefined") {
  module.exports = { login, logout };
}
