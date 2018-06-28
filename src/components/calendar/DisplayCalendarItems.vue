<template>
<div class="calendar-display">
    <h1 class="title">Jou gemaakte afspraken</h1>
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

  <EditCalendarItems :show="showEdit" :calendarItem="editCalendarItem" @updatedItem="reloadItems" @closeModal="closeEditModal" />
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
    /**
     * Formats date to the right format
     */
    formatDate (date) {
      return moment(date).format('DD MMMM YYYY, HH:mm')
    },

    /**
     * Shows the edit modal
     * @param {Object} calendar item
     */
    openEditModal (item) {
      this.editCalendarItem = item
      this.showEdit = true
    },

    /**
     * Closes edit modal
     */
    closeEditModal () {
      if (this.showEdit) {
        this.showEdit = false
      }
    },

    /**
     * Deletes a calendar item and emits an event back to the parent container
     * @param {String} id
     */
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
          this.$emit('reloadItems')
        })
        .catch(err => {
          console.error(err)
        })
      }
    },

    /**
     * Emits an event to the parent container that will handle the reload of items
     */
    reloadItems () {
      this.showEdit = false
      this.$emit('reloadItems')
    }
  },

  /**
   * Sets the locale of the moment instance. 
   */
  created () {
    moment.locale('nl-NL')
  }
}
</script>

<style lang="scss" scoped>
    @import '../../assets/styles/all';
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

    h1.title {
      text-align: center;
      font-weight: bold;
      color: white;
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

