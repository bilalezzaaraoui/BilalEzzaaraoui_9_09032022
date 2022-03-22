/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import {
  screen,
  fireEvent,
  getByTestId,
  getByText,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/dom";
import store from "../__mocks__/store.js";
import NewBillUI from "../views/NewBillUI.js";
import BillsUI from "../views/BillsUI.js";
import NewBill from "../containers/NewBill.js";
import apiStore from "../app/Store";
import { bills } from "../fixtures/bills";
import { setSessionStorage } from "../../setup-jest";
import Router from "../app/Router";
import { ROUTES, ROUTES_PATH } from "../constants/routes";

// Session storage - Employee
setSessionStorage("Employee");

const newBillMock = [
  {
    id: "47qAXb6fIm2zOKkLzMro",
    vat: "80",
    fileUrl:
      "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
    status: "pending",
    type: "Hôtel et logement",
    commentary: "séminaire billed",
    name: "encore",
    fileName: "preview-facture-free-201801-pdf-1.jpg",
    date: "2004-04-04",
    amount: 400,
    commentAdmin: "ok",
    email: "a@a",
    pct: 20,
  },
];

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the envelope icon in the left menu should be highlighted", () => {
      // Get the path to newBill page
      // const pathname = ROUTES_PATH["NewBill"];
      // //define window.location to pathname : #employee/bills
      // location.assign(pathname);
      // window.location.pathname = ROUTES_PATH["NewBill"];

      //to-do write assertion
      // Mock - parameters for bdd Firebase & data fetching
      apiStore.bills = () => ({ bills, get: jest.fn().mockResolvedValue() });

      // Create Dom HTML
      document.body.innerHTML = `<div id="root"></div>`;

      // Trigger the router to set up the page
      Router();
      window.onNavigate(ROUTES_PATH.NewBill);

      //Get icon-mail element
      const iconMail = getByTestId(document.body, "icon-mail");

      //Check if exist
      expect(iconMail).toBeTruthy();
      //Check class value
      expect(iconMail).toHaveClass("active-icon");
    });
  });

  describe("When I choose an wrong file to upload", () => {
    test("Then an error message is displayed", async () => {
      // Init onNavigate
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      onNavigate(ROUTES_PATH["NewBill"]);

      // Create Dom HTML
      const newBill = new NewBill({
        document,
        onNavigate,
        apiStore,
        localStorage: window.localStorage,
      });

      // Mock handleChangeFile
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile);

      //Get input element
      const inputFile = getByTestId(document.body, "file");
      //Add event on change
      inputFile.addEventListener("change", handleChangeFile);
      const windowValue = spyOn(window, "alert");

      //Launch file
      fireEvent.change(inputFile, {
        target: {
          files: [
            new File(["document.txt"], "document.txt", {
              type: "document/txt",
            }),
          ],
        },
      });
      expect(handleChangeFile).toBeCalled();
      expect(windowValue).toHaveBeenCalledWith(
        "Choose a jpg, jpeg, or png format"
      );
    });
  });

  describe("When I choose an image to upload ", () => {
    test("Then the file input should get the file name", () => {
      /**
       * Control upload file format
       * If good format
       * UI Construction
       * Create DOM HTML
       * Mock handleChangeFile function
       * Launch File with good Format
       * Check if not displayed error message
       */

      // Init onNavigate
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      onNavigate(ROUTES_PATH["NewBill"]);

      // Create Dom HTML
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      // Mock function handleChangeFile
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile);

      // Add Event and fire
      const inputFile = screen.getByTestId("file");
      inputFile.addEventListener("change", handleChangeFile);

      inputFile.value = "";

      // Launch file
      fireEvent.change(inputFile, {
        target: {
          files: [new File(["image.png"], "image.png", { type: "image/png" })],
        },
      });

      expect(
        getByText(document.body, "Envoyer une note de frais")
      ).toBeTruthy();
      expect(handleChangeFile).toBeCalled();
      expect(inputFile.files[0].name).toBe("image.png");
    });
  });

  // TEST API resonse

  describe("When I am on NewBill Page and submit the form", () => {
    test("Then it should create a new bill", async () => {
      // Mock Firebase Post method
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      const postSpy = jest.spyOn(newBill, "updateBill");

      // Post new Bills
      await newBill.updateBill(newBillMock);
      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(screen.getByText("Mes notes de frais")).toBeTruthy();
    });
    test("Then throw 404 message error, if it fails to add a new bill ", async () => {
      // UI creation with error code
      const html = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = html;

      // Await for response
      const errorMessage = await getByText(document.body, "Erreur 404");
      expect(errorMessage).toBeTruthy();
    });

    test("Then add a new bills, if API fails with 500 message error", async () => {
      // UI creation with error code
      const html = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = html;

      // Await for response
      const errorMessage = await getByText(document.body, "Erreur 500");
      expect(errorMessage).toBeTruthy();
    });
  });
});
