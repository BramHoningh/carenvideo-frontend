import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: ''
  },
  mutations: {
    ADD_TOKEN (state, payload) {
      state.token = payload.token
    }
  },
  actions: {
    addToken ({commit}, payload) {
      commit('ADD_TOKEN', payload)
    }
  }
})
