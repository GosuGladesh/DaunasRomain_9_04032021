class Firestore {
    constructor() {
      this.storage = new Storage();
    }
  
  }
class Storage {
    constructor() {}
    ref(path){
        return new Reference();
    }
   
}
class Reference {
    constructor() {}
    put(file) {
        return Promise.resolve(new Snapshot());
    }
    getDownloadURL(){
        
        return Promise.resolve("someUrl");
    }
}
class Snapshot {
    constructor() {}
    ref = new Reference();
}
  export default new Firestore()