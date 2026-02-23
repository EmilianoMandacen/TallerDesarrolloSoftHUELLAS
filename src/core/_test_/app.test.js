let login, logout;

describe("app.js - login y logout (sin jsdom)", () => {
  let elements;
  let mockLocalStorage;

  beforeEach(() => {
    // Mock minimal DOM API
    elements = {};
    global.document = {
      getElementById: (id) => {
        if (!elements[id]) elements[id] = { value: "", textContent: "" };
        return elements[id];
      },
      addEventListener: () => {},
      body: { innerHTML: "" },
    };

    // Mock localStorage
    mockLocalStorage = (() => {
      let store = {};
      return {
        getItem: (k) => (k in store ? store[k] : null),
        setItem: (k, v) => {
          store[k] = String(v);
        },
        removeItem: (k) => {
          delete store[k];
        },
        clear: () => {
          store = {};
        },
      };
    })();
    global.localStorage = mockLocalStorage;

    // Mock window.location
    global.window = { location: { href: "" } };

    // Require app after mocks are in place (clear cache to reload)
    delete require.cache[require.resolve("../../app")];
    const app = require("../../app");
    login = app.login;
    logout = app.logout;
  });

  afterEach(() => {
    delete global.document;
    delete global.localStorage;
    delete global.window;
  });

  test("login exitoso establece rol y redirige a admin.html", () => {
    document.getElementById("usuario").value = "admin";
    document.getElementById("password").value = "admin123";

    login();

    expect(localStorage.getItem("rol")).toBe("admin");
    expect(window.location.href).toBe("/admin.html");
  });

  test("login fallido muestra mensaje de error y no establece rol", () => {
    document.getElementById("usuario").value = "usuario";
    document.getElementById("password").value = "incorrecto";

    login();

    expect(localStorage.getItem("rol")).toBeNull();
    expect(document.getElementById("loginError").textContent).toBe(
      "Usuario o contraseña incorrectos",
    );
  });

  test("logout elimina rol y redirige a index.html", () => {
    localStorage.setItem("rol", "admin");

    logout();

    expect(localStorage.getItem("rol")).toBeNull();
    expect(window.location.href).toBe("/index.html");
  });
});
