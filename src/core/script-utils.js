// ===============================
// FUNCIONES EXTRAÍDAS PARA TESTING
// ===============================

/**
 * Genera un UUID compatible
 * @returns {string} UUID generado
 */
function generarUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Verifica si un profesional está disponible en una fecha y hora específica
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @param {string} hora - Hora en formato HH:MM
 * @param {string} profesional - Nombre del profesional
 * @param {Array} reservas - Array de reservas existentes
 * @returns {boolean} true si está disponible, false si no
 */
function profesionalDisponible(fecha, hora, profesional, reservas = []) {
  return !reservas.some(
    (r) =>
      r.fecha === fecha && r.hora === hora && r.profesional === profesional
  );
}

/**
 * Genera horarios disponibles según el día y tipo de servicio
 * @param {string} fechaString - Fecha en formato YYYY-MM-DD
 * @param {string} servicioType - Tipo de servicio: 'baño y corte' o similar
 * @returns {Array<string>} Array de horas disponibles en formato HH:MM
 */
function generarHorariosDisponibles(fechaString, servicioType = "baño y corte") {
  const horarios = [];
  
  if (!fechaString) return horarios;

  const fecha = new Date(fechaString + "T00:00");
  const dia = fecha.getDay();

  // Domingo cerrado
  if (dia === 0) {
    return horarios;
  }

  const horaInicio = 9;
  const horaFin = dia === 6 ? 12.5 : 18; // sábado hasta 12:30

  // Si es estetica la reserva pasa a ser de una hora
  const incremento = servicioType.toLowerCase() === "baño y corte" ? 1 : 0.5;

  for (let hora = horaInicio; hora <= horaFin; hora += incremento) {
    const h = Math.floor(hora);
    const m = hora % 1 === 0 ? 0 : 30;
    const hStr = String(h).padStart(2, "0");
    const mStr = String(m).padStart(2, "0");
    horarios.push(`${hStr}:${mStr}`);
  }

  return horarios;
}

/**
 * Obtiene los profesionales disponibles según el tipo
 * @param {string} tipo - Tipo de servicio: 'veterinaria' o 'estetica'
 * @param {Object} profesionalesData - Objeto con datos de profesionales
 * @returns {Array<string>} Array de profesionales
 */
function obtenerProfesionales(tipo, profesionalesData) {
  if (!tipo || !profesionalesData[tipo]) {
    return [];
  }
  return profesionalesData[tipo];
}

/**
 * Valida si todos los campos obligatorios están completos
 * @param {Object} datos - Objeto con los datos del formulario
 * @returns {boolean} true si todos los campos están completos
 */
function telefonoEsNumerico(telefono) {
  // acepta sólo dígitos (0-9), sin espacios ni símbolos
  return typeof telefono === "string" && /^\d+$/.test(telefono);
}

function validarFormulario(datos) {
  return (
    datos.dueno &&
    datos.mascota &&
    datos.telefono &&
    telefonoEsNumerico(datos.telefono) &&
    datos.fecha &&
    datos.hora &&
    datos.servicio &&
    datos.profesional
  );
}

/**
 * Crea un objeto de reserva
 * @param {Object} datos - Datos de la reserva
 * @returns {Object} Objeto de reserva con ID generado
 */
function crearReserva(datos) {
  return {
    id: datos.id || generarUUID(),
    dueno: datos.dueno,
    mascota: datos.mascota,
    telefono: datos.telefono,
    fecha: datos.fecha,
    hora: datos.hora,
    servicio: datos.servicio,
    profesional: datos.profesional,
  };
}

// Exportar para Node.js/Jest
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    generarUUID,
    profesionalDisponible,
    generarHorariosDisponibles,
    obtenerProfesionales,
    validarFormulario,
    crearReserva,
    // nuevo helper para validación de teléfono
    telefonoEsNumerico,
  };
}
