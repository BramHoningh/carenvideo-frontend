<template>
<div class="calendar">
  <AddCalendar />
</div>
</template>

<script>
import AddCalendar from '../components/calendar/AddCalendarItem'

export default {
  name: 'calendar',
  components: {
    AddCalendar
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

