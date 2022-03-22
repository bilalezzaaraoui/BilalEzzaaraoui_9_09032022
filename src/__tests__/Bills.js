/**
 * @jest-environment jsdom
 */

import { screen, waitFor, getByText } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { fireEvent } from "@testing-library/dom";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });

  // test d'intégration GET
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "a@a",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
    });

    test("fetches bills from mock API GET", async () => {
      const mockReturned = mockStore.bills();
      const getSpy = jest.spyOn(mockReturned, "list");

      const html = BillsUI({ data: mockReturned.list() });
      document.body.innerHTML = html;

      expect(getSpy).toHaveBeenCalled();
      expect(screen.getByText("Mes notes de frais")).toBeTruthy();
      expect(bills.length).toBe(4);
    });

    // Vérifie si l'erreur 404 s'affiche bien
    test("Then fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });
      const html = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });
    // Vérifie si l'erreur 500 s'affiche bien
    test("Then fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
        };
      });
      const html = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
  // describe("Given I am a user connected as an Employee", () => {
  //   describe("When I am on Bills Page", () => {
  //     test("fetches bills from mock API GET", async () => {
  //       const mockReturned = mockStore.bills();
  //       const getSpy = jest.spyOn(mockReturned, "list");

  //       const bills = await mockReturned.list();

  //       expect(getSpy).toHaveBeenCalled();
  //       expect(screen.getByText("Mes notes de frais")).toBeTruthy();
  //       expect(bills.length).toBe(4);
  //     });

  //     describe("When an error occurs on API", () => {
  //       test("fetches bills from an API and fails with 404 message error", async () => {
  //         const mockReturned = mockStore.bills();

  //         mockReturned.list.mockImplementationOnce(() => {
  //           Promise.reject(new Error("Erreur 404"));
  //         });

  //         const html = BillsUI({ error: "Erreur 404" });
  //         document.body.innerHTML = html;

  //         const errorMessage = getByText(document.body, "Erreur 404");
  //         expect(errorMessage).toBeTruthy();
  //       });

  //       test("fetches messages from an API and fails with 500 message error", async () => {
  //         const mockReturned = mockStore.bills();

  //         mockReturned.list.mockImplementationOnce(() => {
  //           Promise.reject(new Error("Erreur 500"));
  //         });

  //         const html = BillsUI({ error: "Erreur 500" });
  //         document.body.innerHTML = html;

  //         const errorMessage = getByText(document.body, "Erreur 500");
  //         expect(errorMessage).toBeTruthy();
  //       });
  //     });
  //   });
  // });
});

describe("when i click on the eye icon button", () => {
  test("then a modal should open", async () => {
    document.body.innerHTML = BillsUI({ data: bills });
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };
    const bill = new Bills({
      document,
      onNavigate,
      store: null,
      localStorage: window.localStorage,
    });

    $.fn.modal = jest.fn();
    const button = screen.getAllByTestId("icon-eye")[0];
    const handleClickIconEye = jest.fn((e) => {
      e.preventDefault();
      bill.handleClickIconEye(button);
    });
    button.addEventListener("click", handleClickIconEye);
    fireEvent.click(button);
    const modal = document.getElementById("modaleFile");
    expect(handleClickIconEye).toHaveBeenCalled();
    expect(modal).toBeTruthy();
  });
});

describe("when i click on the make new Bill Button", () => {
  test("a new bill modal should open", () => {
    Object.defineProperty(window, "local storage", {
      value: localStorageMock,
    });
    window.localStorage.setItem("user", JSON.stringify({ type: "employee" }));
    document.body.innerHTML = BillsUI({ data: [] });
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };
    const bills = new Bills({
      document,
      onNavigate,
      store: null,
      localStorage: window.localStorage,
    });
    const button = screen.getByTestId("btn-new-bill");
    const handleClickNewBill = jest.fn((e) => bills.handleClickNewBill(e));
    button.click("click", handleClickNewBill);
    fireEvent.click(button);
    expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
  });
});
