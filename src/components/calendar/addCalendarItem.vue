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

  <div v-for="person in getPeople" :key="person.id">
    <h4>{{person.first_name}}</h4>
  </div>
  
  <button class="button-primary" @click="sendCalendarItem">Send</button>
</div>
</template>

<script>
import axios from 'axios'
import Hashids from 'hashids'
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
    },

    getPeople () {
      if (this.$store.getters.getUsersPeople._embedded) {
        console.log(this.$store.getters.getUsersPeople._embedded.items.filter(user => user.id !== this.$store.getters.getCurrentUser.person_id))
        return this.$store.getters.getUsersPeople._embedded.items.filter(user => user.id !== this.$store.getters.getCurrentUser.person_id)
      }
    }
  },
  methods: {
    sendCalendarItem () {
      Date.prototype.addHours = function(h){
          this.setHours(this.getHours()+h);
          return this;
      }

      axios({
        method: 'POST',
        url: variables.icalEndpoint,
        headers: {'Content-Type': 'application/json'},
        data: {
          user_id: this.$store.getters.getCurrentUser.person_id,
          title: this.title,
          description: this.description,
          startDate: new Date(this.startDate).addHours(2),
          endDate: new Date(this.endDate).addHours(2),
          url: variables.baseUrl + '/room/' + new Hashids().encode(this.$store.getters.getCurrentUser.person_id)
        }
      })
      .then(response => {
        console.log(response)
      })
      .catch(err => {
        console.error(err)
      })
    },
  }
}
</script>

<style lang="scss" scoped>

</style>

