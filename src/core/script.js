document.addEventListener("DOMContentLoaded", () => {

  // ===============================
  // CARRUSEL DE TRABAJOS
  // ===============================

  const carousel = document.querySelector(".carousel");
  const indicators = document.getElementById("indicators");
  const items = document.querySelectorAll(".carousel-item");
  let currentIndex = 0;

  if (items.length > 0) {
    items.forEach((_, index) => {
      const indicator = document.createElement("div");
      indicator.className = "carousel-indicator";
      if (index === 0) indicator.classList.add("active");
      indicator.onclick = () => mostrarDiapositiva(index);
      indicators.appendChild(indicator);
    });
  }

  window.cambiarDiapositiva = function (direction) {
    currentIndex += direction;
    if (currentIndex >= items.length) currentIndex = 0;
    if (currentIndex < 0) currentIndex = items.length - 1;
    mostrarDiapositiva(currentIndex);
  };

  function mostrarDiapositiva(index) {
    currentIndex = index;
    carousel.style.transform = `translateX(-${currentIndex * 100}%)`;

    document.querySelectorAll(".carousel-indicator").forEach((indicator, i) => {
      indicator.classList.toggle("active", i === currentIndex);
    });
  }

  // ===============================
  // FECHA VISUAL
  // ===============================

  const fechaInput = document.getElementById("fecha");
  const fakeFecha = document.getElementById("fakeFecha");

  fechaInput.addEventListener("change", () => {
    if (fechaInput.value) {
      fakeFecha.classList.add("has-value");
    } else {
      fakeFecha.classList.remove("has-value");
    }
  });

  // ===============================
  // REFERENCIAS
  // ===============================

  const cards = document.querySelectorAll(".card");
  const dueno = document.getElementById("dueno");
  const mascota = document.getElementById("mascota");
  const telefono = document.getElementById("telefono");
  const horaSelect = document.getElementById("hora");
  const servicioSelect = document.getElementById("serviciosSelect");
  const profesionalSelect = document.getElementById("profesionalSelect");

  // ===============================
  // DATOS FIJOS
  // ===============================

  const profesionales = {
    veterinaria: ["Dr. López", "Dra. Martínez", "Dr. Rodríguez"],
    estetica: ["Lucía", "María", "Claudio"],
  };

  // ===============================
  // GENERAR HORARIOS
  // ===============================

  fechaInput.addEventListener("change", generarHorarios);
  servicioSelect.addEventListener("change", () => {
    if (fechaInput.value) generarHorarios();
  });

  function generarHorarios() {
    horaSelect.innerHTML = '<option value="">Seleccione hora</option>';
    horaSelect.disabled = false;

    if (!fechaInput.value) return;

    const fecha = new Date(fechaInput.value + "T00:00");
    const dia = fecha.getDay();

    if (dia === 0) {
      horaSelect.innerHTML =
        '<option value="">No hay atención los domingos</option>';
      horaSelect.disabled = true;
      return;
    }

    const horaInicio = 9;
    const horaFin = dia === 6 ? 12.5 : 18;

    const servicioValue = servicioSelect.value;
    const incremento =
      servicioValue.toLowerCase() === "baño y corte" ? 1 : 0.5;

    for (let hora = horaInicio; hora <= horaFin; hora += incremento) {
      const h = Math.floor(hora);
      const m = hora % 1 === 0 ? 0 : 30;
      agregarOpcionHora(h, m);
    }
  }

  function agregarOpcionHora(hora, minutos) {
    const h = String(hora).padStart(2, "0");
    const m = String(minutos).padStart(2, "0");
    horaSelect.add(new Option(`${h}:${m}`, `${h}:${m}`));
  }

  // ===============================
  // SERVICIOS
  // ===============================

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      servicioSelect.value = card.dataset.servicio;
      cargarProfesionales(card.dataset.tipo);
      document
        .getElementById("reserva")
        .scrollIntoView({ behavior: "smooth" });
    });
  });

  servicioSelect.addEventListener("change", () => {
    const option = servicioSelect.options[servicioSelect.selectedIndex];
    cargarProfesionales(option?.dataset.tipo);
  });

  function cargarProfesionales(tipo) {
    profesionalSelect.innerHTML =
      '<option value="">Seleccione profesional</option>';

    if (!tipo) return;

    profesionales[tipo].forEach((nombre) => {
      profesionalSelect.add(new Option(nombre, nombre));
    });
  }

  // ===============================
  // UTILIDADES
  // ===============================

  function generarUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  function profesionalDisponible(fecha, hora, profesional) {
    const reservas = JSON.parse(localStorage.getItem("reservas")) || [];

    return !reservas.some(
      (r) =>
        r.fecha === fecha &&
        r.hora === hora &&
        r.profesional === profesional
    );
  }

  // ===============================
  // MODAL CONFIRMACIÓN
  // ===============================

  window.abrirModalConfirmacion = function () {
    if (
      !dueno.value ||
      !mascota.value ||
      !telefono.value ||
      !fechaInput.value ||
      !horaSelect.value ||
      !servicioSelect.value ||
      !profesionalSelect.value
    ) {
      mostrarAlertaError("Complete todos los campos obligatorios.");
      return;
    }

    if (
      !profesionalDisponible(
        fechaInput.value,
        horaSelect.value,
        profesionalSelect.value
      )
    ) {
      mostrarAlertaError(
        "El profesional seleccionado no está disponible."
      );
      return;
    }

    const resumen = `
      <strong>Dueño:</strong> ${dueno.value}<br>
      <strong>Mascota:</strong> ${mascota.value}<br>
      <strong>Teléfono:</strong> ${telefono.value}<br>
      <strong>Fecha:</strong> ${fechaInput.value}<br>
      <strong>Hora:</strong> ${horaSelect.value}<br>
      <strong>Servicio:</strong> ${servicioSelect.value}<br>
      <strong>Profesional:</strong> ${profesionalSelect.value}
    `;

    document.getElementById("confirmarReserva").innerHTML = resumen;
    document
      .getElementById("modal-confirmacion")
      .classList.add("active");
  };

  window.cerrarModalConfirmacion = function () {
    document
      .getElementById("modal-confirmacion")
      .classList.remove("active");
  };

  // ===============================
  // GUARDAR RESERVA
  // ===============================

  window.guardarReserva = function () {
    const reservas = JSON.parse(localStorage.getItem("reservas")) || [];

    reservas.push({
      id: crypto.randomUUID ? crypto.randomUUID() : generarUUID(),
      dueno: dueno.value,
      mascota: mascota.value,
      telefono: telefono.value,
      fecha: fechaInput.value,
      hora: horaSelect.value,
      servicio: servicioSelect.value,
      profesional: profesionalSelect.value,
    });

    localStorage.setItem("reservas", JSON.stringify(reservas));

    cerrarModalConfirmacion();
    mostrarModalExito();

    document.querySelector(".form").reset();
    fakeFecha.classList.remove("has-value");
  };

  // ===============================
  // MODAL ÉXITO
  // ===============================

  function mostrarModalExito() {
    document.getElementById("modal-exito").classList.add("active");
  }

  window.cerrarModalExito = function () {
    document.getElementById("modal-exito").classList.remove("active");
  };

  // ===============================
  // ERROR
  // ===============================

  function mostrarAlertaError(mensaje) {
    document.getElementById("alerta-error-mensaje").textContent = mensaje;
    document
      .getElementById("alerta-error-overlay")
      .classList.add("active");
  }

  window.cerrarAlertaError = function () {
    document
      .getElementById("alerta-error-overlay")
      .classList.remove("active");
  };

});