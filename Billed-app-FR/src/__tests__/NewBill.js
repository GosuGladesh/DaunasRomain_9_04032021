import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import userEvent from "@testing-library/user-event"
import firebase from '../__mocks__/firebase'
import BillsUI from "../views/BillsUI.js"
import mockedFirestore from "../__mocks__/firestore"

describe("Given I am connected as an employee", () => {

  describe("When I am on NewBill Page", () => {
    test("Then NewBill object should be created", () => {
     const html = NewBillUI();
     document.body.innerHTML = html;
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const myNewBill = new NewBill({ document, onNavigate, firestore: null, localStorage: null })
      expect(myNewBill.document).toBe(document);
      expect(myNewBill.onNavigate).toBe(onNavigate);
      expect(myNewBill.firestore).toBe(null);
      expect(myNewBill.fileUrl).toBe(null);
      expect(myNewBill.fileName).toBe(null);
    })
  })

  describe("When i click on submit",() => {
    test("Then a new bill should be created", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      
      window.localStorage.setItem('user', JSON.stringify({email: 'johndoe@email.com'}))
      const html = NewBillUI()
      document.body.innerHTML = html
  
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const firestore = null;
      const myNewBill = new NewBill({ document, onNavigate, firestore, localStorage: window.localStorage })


      screen.getByTestId("expense-type").value = "Transports";
      screen.getByTestId("expense-name").value = "Name";
      screen.getByTestId("datepicker").value = "2021-09-01";
      screen.getByTestId("amount").value = 100;
      screen.getByTestId("vat").value = 10;
      screen.getByTestId("pct").value = 10;
      screen.getByTestId("commentary").value = "Comment";
      screen.getByTestId("file").value = "";

      const spy = jest.spyOn(myNewBill, "createBill").mockImplementation( () => {
         return;
      });
      userEvent.click(document.getElementById("btn-send-bill"))
     

      expect(spy).toHaveBeenCalledWith({
        email : 'johndoe@email.com', 
        type: "Transports",
        name: "Name" ,
        amount: 100,
        date:  "2021-09-01",
        vat: "10",
        pct: 10,
        commentary: "Comment",
        fileUrl: null,
        fileName: null,
        status: 'pending'
      });
    })
  })
  
  
  describe("When I select a file", () => {
    test("It should change file value if the file type is wrong", () => {
      document.body.innerHTML = NewBillUI();
      
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const myNewBill = new NewBill({ document, onNavigate, firestore: mockedFirestore , localStorage: null });

     
      const spyFile = jest.spyOn(myNewBill, "handleChangeFile")

      
      document.querySelector(`input[data-testid="file"]`).addEventListener('change', spyFile);
            
      const badFile = new File(['hello'], 'hello.pdf', {type: 'application/pdf'});
      userEvent.upload(screen.getByTestId("file"),badFile);
      expect(screen.getByTestId("file").value).toBe("");
      expect(myNewBill.fileUrl).toBe(null);
      expect(myNewBill.fileName).toBe(null);
      
    })
    test("It should load the  file", () => {
      document.body.innerHTML = NewBillUI();
      
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const myNewBill = new NewBill({ document, onNavigate, firestore: mockedFirestore , localStorage: null });

      const spyFile = jest.spyOn(myNewBill, "handleChangeFile")

      
      document.querySelector(`input[data-testid="file"]`).addEventListener('change', spyFile);
      const file = new File(['hello'], 'hello.png', {type: 'image/png'});
      userEvent.upload(screen.getByTestId("file"),file);
      expect(spyFile).toHaveBeenCalled();
      expect(screen.getByTestId("file").files[0]).toBe(file);
      setTimeout( () => {
        expect(myNewBill.fileUrl).toBe("someUrl");
        expect(myNewBill.fileName).toBe(document.querySelector(`input[data-testid="file"]`).value.split(/\\/g).length-1);
      }, 500);   
      
    })
  })
  //TEST POST
  //SUBMIT NEW BILL THEN CHECK IF BILLS DOM FORM BILL SUBMITED
  describe("Given I'm a user connected as an Employee", () => {
    describe("When I submit a new bill", () => {
      test("Then firebbase should return", async () => {
        const getSpy = jest.spyOn(firebase, "post")
        const newbill = await firebase.post()
        expect(getSpy).toHaveBeenCalledTimes(1)
        expect(newbill).toEqual({51: [[0,["c","ZjYZeafulpVzpIzN9NpMrA","",8,12,30000]]]});
      })
      test("post bill  and fails with 404 message error", async () => {
        firebase.post.mockImplementationOnce(() =>
          Promise.reject(new Error("Erreur 404"))
        )
        const html = BillsUI({ error: "Erreur 404" })
        document.body.innerHTML = html
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })
      test("fetches messages from an API and fails with 500 message error", async () => {
        firebase.post.mockImplementationOnce(() =>
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

      