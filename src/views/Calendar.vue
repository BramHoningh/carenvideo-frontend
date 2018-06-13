<template>
    <div class="calendar">
        <AddCalendar />
        <hr>
        <DisplayCalendarItems :calendarItems="calendarData" />
    </div>
</template>

<script>
import axios from 'axios'
import variables from '../variables'
import AddCalendar from '../components/calendar/AddCalendarItem'
import DisplayCalendarItems from '../components/calendar/DisplayCalendarItems'

export default {
  name: 'calendar',
  data () {
    return {
      calendarData: []
    }
  },
  components: {
    AddCalendar,
    DisplayCalendarItems
  },
  computed: {
    token () {
      return this.$store.getters.getToken
    },
  },
  methods: {
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

    getCalendarItems (id) {
      axios({
        method: 'GET',
          url: variables.getCalendarItemsEndpoint,
          headers: {'Content-Type': 'application/json'},
          params: {
            user_id: id,
          }
      })
      .then(response => {
        console.log(response.data.data.items)
        this.calendarData = response.data.data.items
      })
      .catch(err => {
        console.error('Error getting calendar items: ', err)
      })
    }
  },
  created () {
    if (this.token) {
      axios.all([this.getCurrentUserEndpoint(), this.getPeopleEndpoint()])
      .then(axios.spread((currentUser, people) => {

        this.$store.dispatch('addPeople', {
          currentUser: currentUser.data,
          people: people.data
        })

        this.getCalendarItems(currentUser.data.person_id)
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
    @import '../assets/styles/all';
    .calendar {
        padding-top: 15px;
    }
</style>

