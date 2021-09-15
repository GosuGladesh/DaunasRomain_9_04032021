import { screen } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import LoadingPage from "../views/LoadingPage.js"
import ErrorPage from "../views/ErrorPage.js"
import Bills from "../containers/Bills.js"
import Router from "../app/Router.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import firebase from "../__mocks__/firebase"
import firestore from '../app/Firestore.js'


describe("Given I am connected as an employee", () => {

  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      
      
      document.body.innerHTML =`<div id="root"></div>`;

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify(
        {type:"Employee"}
      ))
     
      window.location.hash = '#employee/bills';
      Router();
      const icon = screen.getByTestId('icon-window')
      expect(icon.className).toBe('active-icon')

    })
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  describe("When I navigate to Bills Page", () => {
    test("Then Loading page should have been called", () => {
      const Ui = BillsUI( {data: [], loading: true , error : false});
      expect(Ui).toBe(LoadingPage());
    })
    test("Then Error page should have been called on error", () => {
      const Ui = BillsUI( {data: [], loading: false , error : "ErrorMessage"});
      expect(Ui).toBe(ErrorPage("ErrorMessage"));
    })
  })

  describe("When I click Icon", () => {
    test("Then Modal should render",  () => {
        const ui = BillsUI({data : bills});
        document.body.innerHTML = ui;
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        const myBill = new Bills({
          document, onNavigate, firestore: firestore, localStorage: window.localStorage
        })
        //mock boostrap .modal("show") function
        $.fn.modal = jest.fn().mockImplementation( () => {$('#modaleFile').css("display", "block");});

        const spy = jest.spyOn(myBill, "handleClickIconEye")
        const icon = document.querySelector(`[data-testid="icon-eye"]`);
        userEvent.click(icon);

        const modal = document.getElementById("modaleFile");
        expect(spy).toHaveBeenCalled();
        expect(modal.style.display).toBe("block");
        const imgWidth = Math.floor($('#modaleFile').width() * 0.5);
        const billUrl = "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&amp;token=c1640e12-a24b-4b11-ae52-529112e9602a";
        const modalHtml = document.querySelector(".modal-body").querySelector("div").innerHTML;
        expect(modalHtml).toBe(`<img width="${imgWidth}" src="${billUrl}">`);
    })
  })

  describe("When I click New bill button", () => {
    test("Then New bill page should render", () => {
        const html = BillsUI({ data: [] })
        document.body.innerHTML = html

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        const mybills = new Bills({
          document, onNavigate, firestore: firestore, localStorage: window.localStorage
        })

        const handleClickNewBill = jest.fn((e) => mybills.handleClickNewBill(e))
        const button = screen.getByTestId('btn-new-bill')
        button.addEventListener('click', handleClickNewBill)
        userEvent.click(button)
        expect(handleClickNewBill).toHaveBeenCalled()
        expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    })
  })

  describe("When I navigate to Bills page" , () => {
    test("Then Bills object shoud be instanciated", () => {

      const ui = BillsUI({data : bills});
      document.body.innerHTML = ui;

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const myBill = new Bills({document , onNavigate , firestore: null , localStorage: null});
      expect(myBill.document).toBe(document);
      expect(myBill.onNavigate).toBe(onNavigate);
      expect(myBill.firestore).toBe(null);

      
    })
    test("Then empty html", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      document.body.innerHTML = "<div></div>";
      const myBill = new Bills({document , onNavigate , firestore: null , localStorage: null});
      expect(myBill.document).toBe(document);
      expect(myBill.onNavigate).toBe(onNavigate);
      expect(myBill.firestore).toBe(null);
    })
  })
 
  //TEST GET 
  // GET BILLS FROM FIREBASE OR FIXTURES THEN CHECK IF BILLS DISPLAYED MATCH
  describe("Given I am a user connected as Employee", () => {
    describe("When I navigate to Bills", () => {
      test("fetches bills from mock API GET", async () => {
         const getSpy = jest.spyOn(firebase, "get")
         const bills = await firebase.get()
         expect(getSpy).toHaveBeenCalledTimes(1)
         expect(bills.data.length).toBe(4)
         const ui = BillsUI(bills);
         document.body.innerHTML = ui;
         const lines = document.querySelectorAll("tr");
         
         expect(lines.length).toBe(5) //TH + 4 bills
      })
      test("fetches bills from an API and fails with 404 message error", async () => {
        firebase.get.mockImplementationOnce(() =>
          Promise.reject(new Error("Erreur 404"))
        )
        const html = BillsUI({ error: "Erreur 404" })
        document.body.innerHTML = html
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })
      test("fetches messages from an API and fails with 500 message error", async () => {
        firebase.get.mockImplementationOnce(() =>
          Promise.reject(new Error("Erreur 500"))
        )
        const html = BillsUI({ error: "Erreur 500" })
        document.body.innerHTML = html
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })
  })
})

