const {
  generarUUID,
  profesionalDisponible,
  generarHorariosDisponibles,
  obtenerProfesionales,
  validarFormulario,
  crearReserva,
  telefonoEsNumerico,
} = require("../script-utils");

if (typeof module !== "undefined") {
  module.exports = {
    generarUUID,
    profesionalDisponible,
    generarHorariosDisponibles,
    obtenerProfesionales,
    validarFormulario,
    crearReserva,
  };
}

// ===============================
// TESTS - generarUUID
// ===============================
describe("generarUUID", () => {
  test("debe generar un UUID válido", () => {
    const uuid = generarUUID();
    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  test("debe generar UUIDs únicos", () => {
    const uuid1 = generarUUID();
    const uuid2 = generarUUID();
    expect(uuid1).not.toBe(uuid2);
  });

  test("debe tener formato correcto con guiones", () => {
    const uuid = generarUUID();
    const partes = uuid.split("-");
    expect(partes).toHaveLength(5);
    expect(partes[0]).toHaveLength(8);
    expect(partes[1]).toHaveLength(4);
    expect(partes[2]).toHaveLength(4);
    expect(partes[3]).toHaveLength(4);
    expect(partes[4]).toHaveLength(12);
  });
});

// ===============================
// TESTS - profesionalDisponible
// ===============================
describe("profesionalDisponible", () => {
  const reservasExistentes = [
    {
      fecha: "2026-02-14",
      hora: "09:00",
      profesional: "Dr. López",
    },
    {
      fecha: "2026-02-14",
      hora: "10:00",
      profesional: "Dra. Martínez",
    },
  ];

  test("debe retornar true si el profesional está disponible", () => {
    const disponible = profesionalDisponible(
      "2026-02-14",
      "11:00",
      "Dr. López",
      reservasExistentes,
    );
    expect(disponible).toBe(true);
  });

  test("debe retornar false si el profesional NO está disponible", () => {
    const disponible = profesionalDisponible(
      "2026-02-14",
      "09:00",
      "Dr. López",
      reservasExistentes,
    );
    expect(disponible).toBe(false);
  });

  test("debe considerar disponible si no hay reservas", () => {
    const disponible = profesionalDisponible(
      "2026-02-14",
      "09:00",
      "Dr. López",
      [],
    );
    expect(disponible).toBe(true);
  });

  test("debe retornar true si la fecha es diferente", () => {
    const disponible = profesionalDisponible(
      "2026-02-15",
      "09:00",
      "Dr. López",
      reservasExistentes,
    );
    expect(disponible).toBe(true);
  });

  test("debe retornar true si la hora es diferente", () => {
    const disponible = profesionalDisponible(
      "2026-02-14",
      "12:00",
      "Dr. López",
      reservasExistentes,
    );
    expect(disponible).toBe(true);
  });

  test("debe retornar true si el profesional es diferente", () => {
    const disponible = profesionalDisponible(
      "2026-02-14",
      "09:00",
      "Dr. Rodríguez",
      reservasExistentes,
    );
    expect(disponible).toBe(true);
  });
});

// ===============================
// TESTS - generarHorariosDisponibles
// ===============================
describe("generarHorariosDisponibles", () => {
  test("debe retornar array vacío si la fecha es vacía", () => {
    const horarios = generarHorariosDisponibles("", "baño y corte");
    expect(horarios).toEqual([]);
  });

  test("debe retornar array vacío si la fecha es domingo", () => {
    // 2026-02-08 es un domingo
    const horarios = generarHorariosDisponibles("2026-02-08", "baño y corte");
    expect(horarios).toEqual([]);
  });

  test("debe generar horarios para un día laboral con servicio 'baño y corte'", () => {
    // 2026-02-09 es un lunes
    const horarios = generarHorariosDisponibles("2026-02-09", "baño y corte");
    expect(horarios.length).toBeGreaterThan(0);
    expect(horarios[0]).toBe("09:00");
  });

  test("debe generar horarios con incrementos de 1 hora para 'baño y corte'", () => {
    // 2026-02-09 es un lunes
    const horarios = generarHorariosDisponibles("2026-02-09", "baño y corte");
    expect(horarios).toContain("09:00");
    expect(horarios).toContain("10:00");
    expect(horarios).toContain("11:00");
  });

  test("debe generar horarios con incrementos de 0.5 horas para otros servicios", () => {
    // 2026-02-09 es un lunes
    const horarios = generarHorariosDisponibles("2026-02-09", "consulta");
    expect(horarios).toContain("09:00");
    expect(horarios).toContain("09:30");
    expect(horarios).toContain("10:00");
  });

  test("debe terminar a las 12:30 para sábado", () => {
    // 2026-02-14 es un sábado
    const horarios = generarHorariosDisponibles("2026-02-14", "baño y corte");
    const ultimaHora = horarios[horarios.length - 1];
    expect(ultimaHora).toBe("12:00");
  });

  test("debe terminar a las 18:00 para días de semana", () => {
    // 2026-02-09 es un lunes
    const horarios = generarHorariosDisponibles("2026-02-09", "baño y corte");
    const ultimaHora = horarios[horarios.length - 1];
    expect(ultimaHora).toBe("18:00");
  });
});

// ===============================
// TESTS - obtenerProfesionales
// ===============================
describe("obtenerProfesionales", () => {
  const profesionalesData = {
    veterinaria: ["Dr. López", "Dra. Martínez", "Dr. Rodríguez"],
    estetica: ["Lucía", "María", "Claudio"],
  };

  test("debe retornar array vacío si el tipo no existe", () => {
    const profesionales = obtenerProfesionales("invalido", profesionalesData);
    expect(profesionales).toEqual([]);
  });

  test("debe retornar profesionales de veterinaria", () => {
    const profesionales = obtenerProfesionales(
      "veterinaria",
      profesionalesData,
    );
    expect(profesionales).toEqual([
      "Dr. López",
      "Dra. Martínez",
      "Dr. Rodríguez",
    ]);
  });

  test("debe retornar profesionales de estetica", () => {
    const profesionales = obtenerProfesionales("estetica", profesionalesData);
    expect(profesionales).toEqual(["Lucía", "María", "Claudio"]);
  });

  test("debe retornar array vacío si tipo es null", () => {
    const profesionales = obtenerProfesionales(null, profesionalesData);
    expect(profesionales).toEqual([]);
  });

  test("debe retornar array vacío si tipo es undefined", () => {
    const profesionales = obtenerProfesionales(undefined, profesionalesData);
    expect(profesionales).toEqual([]);
  });
});

// ===============================
// TESTS - validarFormulario & teléfono numérico
// ===============================
describe("telefonoEsNumerico", () => {
  test("acepta sólo dígitos", () => {
    expect(telefonoEsNumerico("1234567890")).toBe(true);
    expect(telefonoEsNumerico("0987654321")).toBe(true);
  });

  test("rechaza cadenas con letras o símbolos", () => {
    expect(telefonoEsNumerico("123-456")).toBe(false);
    expect(telefonoEsNumerico("abc123")).toBe(false);
    expect(telefonoEsNumerico("123 456")).toBe(false);
    expect(telefonoEsNumerico(123456)).toBe(false); // no es string
  });
});

describe("validarFormulario", () => {
  const datosValidos = {
    dueno: "Juan",
    mascota: "Pelusa",
    telefono: "1234567890",
    fecha: "2026-02-14",
    hora: "09:00",
    servicio: "Baño y Corte",
    profesional: "Dr. López",
  };

  test("retorna true con datos completos y teléfono numérico", () => {
    expect(validarFormulario(datosValidos)).toBe(true);
  });

  test("retorna false si falta algún campo", () => {
    const copia = { ...datosValidos, dueno: "" };
    expect(validarFormulario(copia)).toBe(false);
  });

  test("retorna false si el teléfono no es numérico", () => {
    const copia = { ...datosValidos, telefono: "123abc" };
    expect(validarFormulario(copia)).toBe(false);
  });
});
// ===============================
// TESTS - crearReserva
// ===============================
describe("crearReserva", () => {
  const datosReserva = {
    dueno: "Juan",
    mascota: "Pelusa",
    telefono: "1234567890",
    fecha: "2026-02-14",
    hora: "09:00",
    servicio: "Baño y Corte",
    profesional: "Dr. López",
  };

  test("debe crear una reserva con todos los datos", () => {
    const reserva = crearReserva(datosReserva);
    expect(reserva.dueno).toBe("Juan");
    expect(reserva.mascota).toBe("Pelusa");
    expect(reserva.telefono).toBe("1234567890");
    expect(reserva.fecha).toBe("2026-02-14");
    expect(reserva.hora).toBe("09:00");
    expect(reserva.servicio).toBe("Baño y Corte");
    expect(reserva.profesional).toBe("Dr. López");
  });

  test("debe generar un ID si no se proporciona uno", () => {
    const reserva = crearReserva(datosReserva);
    expect(reserva.id).toBeDefined();
    expect(typeof reserva.id).toBe("string");
    expect(reserva.id.length).toBeGreaterThan(0);
  });

  test("debe usar el ID proporcionado si existe", () => {
    const idPersonalizado = "mi-id-unico";
    const datos = { ...datosReserva, id: idPersonalizado };
    const reserva = crearReserva(datos);
    expect(reserva.id).toBe(idPersonalizado);
  });

  test("debe tener la estructura correcta", () => {
    const reserva = crearReserva(datosReserva);
    expect(reserva).toHaveProperty("id");
    expect(reserva).toHaveProperty("dueno");
    expect(reserva).toHaveProperty("mascota");
    expect(reserva).toHaveProperty("telefono");
    expect(reserva).toHaveProperty("fecha");
    expect(reserva).toHaveProperty("hora");
    expect(reserva).toHaveProperty("servicio");
    expect(reserva).toHaveProperty("profesional");
    expect(Object.keys(reserva).length).toBe(8);
  });
});
