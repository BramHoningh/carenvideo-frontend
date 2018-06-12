<template>
<div class="calendar-display">
  <div class="calendar-item" v-for="(calendarItem, index) in calendarItems" :key="index">
    {{calendarItem.title}} | {{calendarItem.description}} | {{formatDate(calendarItem.startDate)}} |
    <button class="button-primary">Wijzigen</button> | <button class="button-primary">Verwijderen</button>
  </div>
</div>
</template>

<script>
import axios from 'axios'
import moment from 'moment'
import variables from '../../variables'

export default {
  name: 'DisplayCalendarItems',
  props: ['calendarItems'],
  methods: {
    formatDate (date) {
      return moment(date).format('DD MMMM YYYY, HH:mm')
    }
  },
  created () {
    moment.locale('nl-NL')
  }
}
</script>

<style lang="scss" scoped>

</style>

