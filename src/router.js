import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import GetAccessToken from './components/GetAccessToken.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/oauth',
      name: 'oauth',
      component: GetAccessToken
    }
  ]
})
