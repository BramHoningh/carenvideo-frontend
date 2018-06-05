import Vue from 'vue'
import Router from 'vue-router'
import store from './store'
import variables from './variables'

import Home from './views/Home.vue'
import Room from './views/Room.vue'

import GetAccessToken from './components/oauth/GetAccessToken.vue'
import SSO from './components/oauth/SSO.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      beforeEnter: (to, from, next) => {
        if (!store.getters.getToken) {
          window.location = "https://www.carenzorgt.nl/login/oauth/authorize?response_type=token&client_id=" + variables.clientId + "&redirect_uri=" + variables.redirectUri + "&scope=user.read+calendar.read+care_givers.read"
        } else {
          next()
        }
      }
    },
    {
      path: '/room/:roomId',
      name: 'room',
      component: Room
    },
    {
      path: '/oauth',
      name: 'oauth',
      component: GetAccessToken
    },
    {
      path: '/oauth/sso',
      name: 'sso',
      component: SSO
    }
  ]
})
