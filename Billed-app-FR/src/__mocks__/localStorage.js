export const localStorageMock = (function() {
  let store = {};
  return {
    getItem: function(key) {
      return (store[key]) //removed JSON.stringify
    },
    setItem: function(key, value) {
      store[key] = value.toString()
    },
    clear: function() {
      store = {}
    },
    removeItem: function(key) {
      delete store[key]
    }
  }
})()