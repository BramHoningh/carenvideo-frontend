<template>
<div>
  <label for="title">Title</label>
  <input type="text" id="title" v-model="title">
  
  <label for="description">Description</label>
  <input type="text" id="description" v-model="description" placeholder="description">

  <select v-if="isGroupAdmin" v-model="personInput">
    <option disabled value="">Voor wie wilt u de afspraak inplannen?</option>
    <option v-for="person in getPeople" :key="person.id" :value="person.id">{{person.first_name}}</option>
  </select>
  
  <date-picker v-model="datePickerValue" type="datetime" format="dd-MM-yyyy HH:mm:ss" :minute-step="Number(10)" :lang="datePicker.lang"></date-picker>

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
      personInput: '',
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

    isGroupAdmin () {
      if (this.$store.getters.getCurrentUser._embedded) {
        return this.$store.getters.getCurrentUser._embedded.person.owner_id === null
      }
    },

    getCurrentUser () {
      return this.$store.getters.getCurrentUser
    },

    getPeople () {
      if (this.$store.getters.getUsersPeople._embedded) {
        return this.$store.getters.getUsersPeople._embedded.items.filter(user => user.id !== this.$store.getters.getCurrentUser.person_id)
      }
    }
  },
  methods: {
    sendCalendarItem () {
      let userId = (this.personInput === '') ? this.$store.getters.getCurrentUser.person_id : this.personInput
      
      axios({
        method: 'POST',
        url: variables.icalEndpoint,
        headers: {'Content-Type': 'application/json'},
        data: {
          user_id: userId,
          title: this.title,
          description: this.description,
          startDate: this.convertDate,
          endDate: moment(this.datePickerValue).add(1, 'hour').format(),
          url: variables.baseUrl + '/room/' + new Hashids().encode(userId),
          added_by: this.$store.getters.getCurrentUser.person_id
        }
      })
      .then(response => {
        console.log(response)
        this.$emit('itemAdded')
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

