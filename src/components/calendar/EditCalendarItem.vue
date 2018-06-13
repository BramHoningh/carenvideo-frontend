<template>
<div v-show="show" class="modal">
    <div class="modal-content">
        <div class="header">
            <span>Afspraak bewerken:</span>
        </div>
        <div class="item">
            <label for="title">Afspraak titel:</label>
            <input type="text" id="title" v-model="calendarItem.title">
        </div>
        <div class="item">
            <label for="description">Afspraak omschrijving:</label>
            <input type="text" id="description" placeholder="description" v-model="calendarItem.description"> 
        </div>
        <div class="item">
            <label for="personInput">Selecteer een gebruiker:</label>
            <select v-if="isGroupAdmin" v-model="personInput">
                <option disabled value="">Voor wie wilt u de afspraak inplannen?</option>
                <option v-for="person in getPeople" :key="person.id" :value="person.id">{{person.first_name}}</option>
            </select>
        </div>
        <div class="item">
            <label for="personInput">Selecteer een tijd & datum:</label>
            <date-picker v-model="datePickerValue" type="datetime" format="dd-MM-yyyy HH:mm:ss" :minute-step="Number(10)" :lang="datePicker.lang"></date-picker>    
        </div>
        <button class="btn-primary" @click="updateCalendarItem">Wijzigingen opslaan</button>
    </div>
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
    convertDate () {
      return moment(this.datePickerValue).format()
    },

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
    @import '../../assets/styles/all';
    .modal {
        position: absolute;
        top: 50%;
        left: 50%;
        -webkit-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
        width: 100vw;
        height: 100vh;
        border-radius: 6px;
        z-index: 1;
        overflow: auto; 
        background-color: rgb(0,0,0);
        background-color: rgba(0,0,0,0.4);
    }
    .modal-content {
        margin: 4% auto;
        background-color: #eaeaea;
        border: solid 4px #bababa;
        width: 40%;
        height: 40%;
        font-family: 'Lato';
        color: $white;
        grid-template-columns: repeat(2, 1fr);
        grid-gap: 10px;
        grid-auto-rows: minmax(100px, auto);
        border: solid 1px;
        border-radius: 6px;
        box-shadow: 10px 10px 10px 0 rgba(0, 0, 0, 0.12);
    }
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
        background-color: #e23670;
        border-top-left-radius: 6px;
        border-top-right-radius: 6px;
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

