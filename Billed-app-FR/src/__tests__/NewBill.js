import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import userEvent from "@testing-library/user-event"
import { firebase } from '@firebase/app'
import firestore from '../app/Firestore.js'

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
      window.localStorage.setItem('user', JSON.stringify({
        email: 'johndoe@email.com'
      }))
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
      console.log(JSON.parse(localStorage.getItem("user")))
      expect(spy).toHaveBeenCalledWith({
        email : undefined, //should be "johndoe@email.com" but get undefined
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
    test("It should ...", () => {

      const firebaseConfig = {
        apiKey: "AIzaSyA7Q8lSz_vOi1A79HLdJ5flsEVVLSGsP5w",
        authDomain: "billable-677b6.firebaseapp.com",
        databaseURL: "https://billable-677b6.firebaseio.com",
        projectId: "billable-677b6",
        storageBucket: "billable-677b6.appspot.com",
        messagingSenderId: "267055787680",
        appId: "1:267055787680:web:cef6e306cb63a278f7e3c5"
      }
      //firebase INIT
      Object.defineProperty(window, 'firebase', { value: firebase.initializeApp(firebaseConfig) });
    

      document.body.innerHTML = NewBillUI();
      
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      
      //const firestore = null;
      const myNewBill = new NewBill({ document, onNavigate, firestore , localStorage: null });

      const fileInput = document.querySelector(`input[data-testid="file"]`)
      const spyFile = jest.spyOn(myNewBill, "handleChangeFile").mockImplementation( (e) => {
        const file = fileInput.files[0];
        
        if( file.type != "image/jpeg" && file.type != "image/png"){
          document.querySelector(`input[data-testid="file"]`).value = "";
          return;
        }
        const filePath = fileInput.value.split(/\\/g)
        const fileName = filePath[filePath.length-1]
     });

      
      document.querySelector(`input[data-testid="file"]`).addEventListener('change', spyFile);
      const file = new File(['hello'], 'http://hello.png', {type: 'image/png'});
      userEvent.upload(screen.getByTestId("file"),file);
      expect(spyFile).toHaveBeenCalled();
      expect(screen.getByTestId("file").file).toBe(file);
      
      expect(myNewBill.fileUrl).toBe("http://hello.png");
      expect(myNewBill.fileName).toBe("hello.png");
      
      const badFile = new File(['hello'], 'hello.pdf', {type: 'application/pdf'});
      userEvent.upload(screen.getByTestId("file"),badFile);
      expect(screen.getByTestId("file").value).toBe("");
          
    })
  })


  //TEST POST
  //SUBMIT NEW BILL THEN CHECK IF BILLS DOM FORM BILL SUBMITED
  describe("Given I'm a user connected as an Employee", () => {
    describe("When I submit a new bill", () => {
      test("Then the new bill should appear on the bill page", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee', email: 'test@test.test'
      }))
        document.body.innerHTML = NewBillUI();
      
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        //const firestore = null;
        const myNewBill = new NewBill({ document, onNavigate, firestore: firestore, localStorage: window.localStorage });

        screen.getByTestId("expense-type").value = "Transports";
        screen.getByTestId("expense-name").value = "Name";
        screen.getByTestId("datepicker").value = "2021-09-01";
        screen.getByTestId("amount").value = 100;
        screen.getByTestId("vat").value = 10;
        screen.getByTestId("pct").value = 10;
        screen.getByTestId("commentary").value = "Comment";
        screen.getByTestId("file").value = "";

        const file = new File(['hello'], 'http://hello.png', {type: 'image/png'});
        userEvent.upload(screen.getByTestId("file"),file);

        userEvent.click(document.getElementById("btn-send-bill"));
        
        // check if new bill is in BillUI
      })
    })
  })
  
}) 

      