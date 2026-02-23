document.addEventListener("DOMContentLoaded", () => {
  // ===============================
  // CARRUSEL DE TRABAJOS
  // ===============================
  const carousel = document.querySelector(".carousel");
  const indicators = document.getElementById("indicators");
  const items = document.querySelectorAll(".carousel-item");
  let currentIndex = 0;

  // Crear indicadores
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

    // Actualizar indicadores
    document.querySelectorAll(".carousel-indicator").forEach((indicator, i) => {
      indicator.classList.toggle("active", i === currentIndex);
    });
  }

  const fecha = document.getElementById("fecha");
  const fakeFecha = document.getElementById("fakeFecha");

  fecha.addEventListener("change", () => {
    if (fecha.value) {
      fakeFecha.classList.add("has-value");
    } else {
      fakeFecha.classList.remove("has-value");
    }
  });

  // ===============================
  // REFERENCIAS A ELEMENTOS
  // ===============================
  const cards = document.querySelectorAll(".card");
  const dueno = document.getElementById("dueno");
  const mascota = document.getElementById("mascota");
  const telefono = document.getElementById("telefono");
  const fechaInput = document.getElementById("fecha");
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
  // INIT
  // ===============================
  fechaInput.addEventListener("change", generarHorarios);
  servicioSelect.addEventListener("change", () => {
    if (fechaInput.value) {
      generarHorarios();
    }
  });

  // ===============================
  // HORARIOS
  // ===============================

  function generarHorarios() {
    horaSelect.innerHTML = '<option value="">Seleccione hora</option>';
    horaSelect.disabled = false;

    if (!fechaInput.value) return;

    const fecha = new Date(fechaInput.value + "T00:00");
    const dia = fecha.getDay();

    // Domingo cerrado
    if (dia === 0) {
      horaSelect.innerHTML =
        '<option value="">No hay atención los domingos</option>';
      horaSelect.disabled = true;
      return;
    }

    const horaInicio = 9;
    const horaFin = dia === 6 ? 12.5 : 18; // sábado hasta 12:30

    // Si es estetico el la reserva pasa a ser de una hora
    const servicioValue = servicioSelect.value;
    const incremento = servicioValue.toLowerCase() === "baño y corte" ? 1 : 0.5;

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
      document.getElementById("reserva").scrollIntoView({ behavior: "smooth" });
    });
  });

  servicioSelect.addEventListener("change", () => {
    const option = servicioSelect.options[servicioSelect.selectedIndex];
    cargarProfesionales(option?.dataset.tipo);
  });

  function cargarProfesionales(tipo) {
    profesionalSelect.innerHTML = `<option value="">Seleccione profesional</option>`;

    if (!tipo) return;

    profesionales[tipo].forEach((nombre) => {
      profesionalSelect.add(new Option(nombre, nombre));
    });
  }

  // ===============================
  // RESERVA
  // ===============================

  // Función generadora de UUID compatible
  function generarUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  }

  function profesionalDisponible(fecha, hora, profesional) {
    const reservas = JSON.parse(localStorage.getItem("reservas")) || [];

    return !reservas.some(
      (r) =>
        r.fecha === fecha && r.hora === hora && r.profesional === profesional,
    );
  }

  window.confirmarReserva = function () {
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
        profesionalSelect.value,
      )
    ) {
      mostrarAlertaError(
        "El profesional seleccionado no está disponible en la fecha y hora elegidas. Por favor, elija otro horario o profesional.",
      );
      return;
    }

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
    mostrarAlerta();
    document.querySelector(".form").reset();
  };

  window.mostrarAlerta = function () {
    document.getElementById("alerta-overlay").classList.add("active");
  };

  window.cerrarAlerta = function () {
    document.getElementById("alerta-overlay").classList.remove("active");
  };

  window.mostrarAlertaError = function (mensaje) {
    document.getElementById("alerta-error-mensaje").textContent = mensaje;
    document.getElementById("alerta-error-overlay").classList.add("active");
  };

  window.cerrarAlertaError = function () {
    document.getElementById("alerta-error-overlay").classList.remove("active");
  };
});
