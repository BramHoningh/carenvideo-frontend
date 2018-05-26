import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: '',
    currentUser: {},
    usersPeople: {},
    pusher: null,
    allUsersChannel: null
  },
  getters: {
    getCurrentUser: state => {
      return state.currentUser
    },

    getUsersPeople: state => {
      return state.usersPeople
    },

    getPusherInstance: state => {
      return state.pusher
    },

    getAllUsersChannel: state => {
      return state.allUsersChannel
    }
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
    },

    INIT_PUSHER (state, payload) {
      state.pusher = payload.pusher
    },

    INIT_ALL_USERS_CHANNEL (state, payload) {
      state.allUsersChannel = payload.channel
    }
  },
  actions: {
    addToken ({commit}, payload) {
      commit('ADD_TOKEN', payload)
    },

    addPeople ({commit}, payload) {
      commit('ADD_CURRENT_USER', {
        user: payload.currentUser
      })

      commit('ADD_USERS_PEOPLE', {
        people: payload.people
      })
    },

    initPusher ({commit}, payload) {
      commit('INIT_PUSHER', payload)
    },

    initAllUsersChannel ({commit}, payload) {
      commit('INIT_ALL_USERS_CHANNEL', payload)
    }
  }
})
