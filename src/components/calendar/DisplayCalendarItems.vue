<template>
<div class="calendar-display">
    <span class="title">Uw afspraken:</span>
    <div class="calendar-item" v-for="(calendarItem, index) in calendarItems" :key="index">
        <div class="header">
            {{formatDate(calendarItem.startDate)}}
        </div>
        <div class="">
            <div class="item">
                <label for="title">Afspraak titel:</label>
                <span>{{calendarItem.title}}</span>
            </div>
            <div class="item">
                <label for="title">Afspraak omschrijving:</label>
                <span>{{calendarItem.description}}</span>
            </div>
        </div>  
        <button class="btn-secondary" @click="openEditModal(calendarItem)">Wijzigen</button> 
        <button class="btn-secondary" @click="deleteItem(calendarItem._id)">Verwijderen</button>
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
    },

    deleteItem (id) {
      let confirm = window.confirm("Weet u zeker dat u deze afspraak wilt verwijderen?")

      if (confirm) {
        axios({
          method: 'POST',
          url: variables.deleteCalendarItemEndpoint,
          headers: {'Content-Type': 'application/json'},
          data: {
            id: id,
          }
        })
        .then(response => {
          console.log(response)
        })
        .catch(err => {
          console.error(err)
        })
      }
    }
  },
  created () {
    moment.locale('nl-NL')
  }
}
</script>

<style lang="scss" scoped>
.calendar-display {
    max-width: 500px;
    margin: 0 auto;
    .title {
        font-family: 'Lato';
        font-size: 1.5em;
        font-weight: 600;
        color: white;
    }
}
.header {
    box-shadow: 0 5px 10px 0 #bababa;
    background-color: #e23670;
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
    color: white;
    font-family: 'Open Sans';
    font-weight: 600;
    font-size: 1.25em;
    padding: 3px 15px;
    margin-bottom: 15px;
}
.calendar-item {
    max-width: 500px;
    margin: 15px auto;
    border-width: thin;
    border-style: solid;
    border-radius: 5px;
    background-color: #eaeaea;
    border: solid 4px #bababa;
    max-width: 500px;
}
.item {
    margin-bottom: 15px;
    font-family: Lato;
}
</style>

