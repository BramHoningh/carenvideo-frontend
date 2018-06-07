<template>
<div>
  <label for="title">Title</label>
  <input type="text" id="title" v-model="title">
  
  <label for="description">Description</label>
  <input type="text" id="description" v-model="description" placeholder="description">
  
  <label for="startDate">StartDate</label>
  <input type="datetime-local" id="startDate" v-model="startDate">

  <label for="endDate">EndDate</label>
  <input type="datetime-local" id="endDate" v-model="endDate">
  
  <button class="button-primary" @click="sendCalendarItem">Send</button>
</div>
</template>

<script>
import axios from 'axios'
import variables from '../../variables.js'

export default {
  name: 'addCalendarItem',
  data () {
    return {
      title: '',
      description: '',
      startDate: '',
      endDate: ''
    }
  },
  computed: {
    token () {
      return this.$store.getters.getToken
    },

    getCurrentUser () {
      return this.$store.getters.getCurrentUser
    }
  },
  methods: {
    sendCalendarItem () {
      axios({
        method: 'POST',
        url: variables.icalEndpoint,
        headers: {'Content-Type': 'application/json'},
        data: {
          user_id: this.$store.getters.getCurrentUser.person_id,
          title: this.title,
          description: this.description,
          startDate: new Date(this.startDate),
          endDate: new Date(this.endDate)
        }
      })
      .then(response => {
        console.log(response)
      })
      .catch(err => {
        console.error(err)
      })
    },

    getCurrentUserEndpoint () {
      return axios.get(variables.userEndpoint, {
        headers: { 'Authorization': 'Bearer ' + this.token }
      })
    },

    getPeopleEndpoint () {
      return axios.get(variables.peopleEndpoint, {
        headers: { 'Authorization': 'Bearer ' + this.token }
      })
    },
  },
  created () {
    if (this.token) {
      axios.all([this.getCurrentUserEndpoint(), this.getPeopleEndpoint()])
      .then(axios.spread((currentUser, people) => {

        this.$store.dispatch('addPeople', {
          currentUser: currentUser.data,
          people: people.data
        })
      }))
      .catch(err => {
        console.log('err', err)
        window.location = "https://www.carenzorgt.nl/login/oauth/authorize?response_type=token&client_id=" + variables.clientId + "&redirect_uri=" + variables.redirectUri + "&scope=user.read+calendar.read+care_givers.read"
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>

