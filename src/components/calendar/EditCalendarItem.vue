<template>
<div v-show="show" class="modal">
  <label for="title">Title</label>
  <input type="text" id="title" v-model="calendarItem.title">
  
  <label for="description">Description</label>
  <input type="text" id="description" placeholder="description" v-model="calendarItem.description">

  <select v-if="isGroupAdmin" v-model="personInput">
    <option disabled value="">Voor wie wilt u de afspraak inplannen?</option>
    <option v-for="person in getPeople" :key="person.id" :value="person.id">{{person.first_name}}</option>
  </select>
  
  <date-picker v-model="datePickerValue" type="datetime" format="dd-MM-yyyy HH:mm:ss" :minute-step="Number(10)" :lang="datePicker.lang"></date-picker>

  <button class="button-primary" @click="updateCalendarItem">Send</button>
</div>
</template>

<script>
import axios from 'axios'
import moment from 'moment'
import Hashids from 'hashids'
import DatePicker from 'vue2-datepicker'
import variables from '../../variables'

export default {
  name: 'EditCalendarItem',
  components: {
    DatePicker
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    calendarItem: {
      type: Object,
      default: () => {
        return {
          title: '',
          description: ''
        }
      }
    }
  },
  data () {
    return {
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
      datePickerValue: null,
      personInput: '',
      test: ''
    }
  },
  computed: {
    isGroupAdmin () {
      if (this.$store.getters.getCurrentUser._embedded) {
        return this.$store.getters.getCurrentUser._embedded.person.owner_id === null
      }
    },

    getPeople () {
      if (this.$store.getters.getUsersPeople._embedded) {
        return this.$store.getters.getUsersPeople._embedded.items.filter(user => user.id !== this.$store.getters.getCurrentUser.person_id)
      }
    }
  },
  methods: {
    updateCalendarItem () {
      console.log(this.calendarItem)

      let userId = (this.personInput === '') ? this.$store.getters.getCurrentUser.person_id : this.personInput
      
      axios({
        method: 'POST',
        url: variables.updateCalendarItemEndpoint,
        headers: {'Content-Type': 'application/json'},
        data: {
          id: this.calendarItem._id,
          item: {
            user_id: userId,
            title: this.calendarItem.title,
            description: this.calendarItem.description,
            startDate: this.convertDate,
            endDate: moment(this.datePickerValue).add(1, 'hour').format(),
            url: variables.baseUrl + '/room/' + new Hashids().encode(userId),
            added_by: this.$store.getters.getCurrentUser.person_id
          }
        }
      })
      .then(response => {
        console.log(response)
        this.$emit('updatedItem')
      })
      .catch(err => {
        console.error(err)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.modal {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 300px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 3px;
}
</style>

