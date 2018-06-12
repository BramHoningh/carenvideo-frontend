<template>
<div>
  <label for="title">Title</label>
  <input type="text" id="title" v-model="title">
  
  <label for="description">Description</label>
  <input type="text" id="description" v-model="description" placeholder="description">

  <div v-for="person in getPeople" :key="person.id">
    <h4>{{person.first_name}}</h4>
  </div>
  
  <date-picker v-model="datePickerValue" @change="datePickerChange" type="datetime" format="dd-MM-yyyy HH:mm:ss" :minute-step="Number(10)" :lang="datePicker.lang"></date-picker>

  <button class="button-primary" @click="sendCalendarItem">Send</button>
</div>
</template>

<script>
import axios from 'axios'
import Hashids from 'hashids'
import moment from 'moment'
import DatePicker from 'vue2-datepicker'

import variables from '../../variables.js'

export default {
  name: 'addCalendarItem',
  components: {
    DatePicker
  },
  data () {
    return {
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      datePicker: {
        lang: {
          days: ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'],
          months: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'],
          pickers: ['volgende 7 dagen', 'volgende 30 dagen', 'vorige 7 dagen', 'vorige 30 dagen'],
          placeholder: {
            date: 'Selecteer Datum',
            dateRange: 'Selecteer Periode'
          }
        },
        options: {
          start: "10:00"
        }
      },
      datePickerValue: null
    }
  },
  computed: {
    convertDate () {
      return moment(this.datePickerValue).format()
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
    datePickerChange () {

      console.log(this.convertDate)
    }, 

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
          startDate: this.convertDate,
          endDate: moment(this.datePickerValue).add(1, 'hour').format(),
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

