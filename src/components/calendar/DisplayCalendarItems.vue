<template>
<div class="calendar-display">
  <div class="calendar-item" v-for="(calendarItem, index) in calendarItems" :key="index">
    {{calendarItem.title}} | {{calendarItem.description}} | {{formatDate(calendarItem.startDate)}} |
    <button class="button-primary" @click="openEditModal(calendarItem)">Wijzigen</button> | <button class="button-primary">Verwijderen</button>
  </div>

  <EditCalendarItems :show="showEdit" :calendarItem="editCalendarItem" />
</div>
</template>

<script>
import axios from 'axios'
import moment from 'moment'
import variables from '../../variables'
import EditCalendarItems from './EditCalendarItem'

export default {
  name: 'DisplayCalendarItems',
  props: ['calendarItems'],
  components: {
    EditCalendarItems
  },
  data () {
    return {
      editCalendarItem: {},
      showEdit: false
    }
  },
  methods: {
    formatDate (date) {
      return moment(date).format('DD MMMM YYYY, HH:mm')
    },

    openEditModal (item) {
      this.editCalendarItem = item
      this.showEdit = true
    }
  },
  created () {
    moment.locale('nl-NL')
  }
}
</script>

<style lang="scss" scoped>

</style>

