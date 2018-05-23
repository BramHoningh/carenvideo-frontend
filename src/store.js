import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: '',
    currentUser: '',
    usersPeople: ''
  },
  mutations: {
    ADD_TOKEN (state, payload) {
      state.token = payload.token
    },

    ADD_CURRENT_USER (state, payload) {
      state.currentUser = payload.user
    },

    ADD_USERS_PEOPLE (state, payload) {
      state.usersPeople = payload.people
    }
  },
  actions: {
    addToken ({commit}, payload) {
      commit('ADD_TOKEN', payload)
    },

    getUsers ({commit, state}) {
      function getCurrentUser() {
        return axios.get('https://www.carenzorgt.nl/api/v1/user', {
          headers: { 'Authorization': 'Bearer ' + state.token }
        })
      }

      function getPeople() {
        return axios.get('https://www.carenzorgt.nl/api/v1/people', {
          headers: { 'Authorization': 'Bearer ' + state.token }
        })
      }

      axios.all([getCurrentUser(), getPeople()])
      .then(axios.spread((currentUser, people) => {
        commit('ADD_CURRENT_USER', {
          user: currentUser.data
        })

        commit('ADD_USERS_PEOPLE', {
          people: people.data
        })
      }))
    }
  }
})
