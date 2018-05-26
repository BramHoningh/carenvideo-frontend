<template>
  <div class="home">
    <li v-if="usersPeople && index !== 0" v-for="(person, index) in usersPeople" :key="person.id">{{person.first_name}} {{person.last_name}}</li>
  </div>
</template>

<script>
import axios from 'axios'
import Pusher from 'pusher-js'
import variables from '@/variables'

export default {
  name: 'home',
  data () {
    return {
      
    }
  },
  computed: {
    token () {
      return this.$store.state.token
    },

    currentUser () {
      if (this.$store.getters.getCurrentUser._embedded) {
        return this.$store.getters.getCurrentUser._embedded.person
      } else {
        return {
          first_name: '',
          last_name: ''
        }
      }
    },

    usersPeople () {
      if (this.$store.getters.getUsersPeople._embedded) {
        return this.$store.getters.getUsersPeople._embedded.items
      } else {
        return []
      }
    }
  },
  methods: {
    getCurrentUser () {
      return axios.get('https://www.carenzorgt.nl/api/v1/user', {
        headers: { 'Authorization': 'Bearer ' + this.token }
      })
    },

    getPeople () {
      return axios.get('https://www.carenzorgt.nl/api/v1/people', {
        headers: { 'Authorization': 'Bearer ' + this.token }
      })
    },

    initializePusher (id) {
      let presencePusher = new Pusher('8dc95d49e9a8f15e0980', {
        cluster: 'eu',
        encrypted: true,
        authEndpoint: "http://localhost:5000/pusher/auth/presence",
        auth: {
          params: { id: id }
        }
      })

      this.$store.dispatch('initPresencePusher', {
        pusher: presencePusher
      })

      let allUsersChannel = this.$store.getters.getPresencePusherInstance.subscribe('presence-all')

      this.$store.dispatch('initAllUsersChannel', {
        channel: allUsersChannel
      })
    }
  },
  created () {
    if (this.token) {
      axios.all([this.getCurrentUser(), this.getPeople()])
      .then(axios.spread((currentUser, people) => {
        this.$store.dispatch('addPeople', {
          currentUser: currentUser.data,
          people: people.data
        })

        this.initializePusher(currentUser.data._embedded.person.id)
      }))
    }
  }
}
</script>
