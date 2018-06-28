<template>
<div>
  <h1 class="calendar-title">Kalender</h1>

  <div class="add-appointment">
    <button class="btn-secondary" @click="showCalendarAdd = !showCalendarAdd">Nieuwe afspraak</button>
  </div>

  <transition name="fade">
    <div class="calendar-modal" v-show="showCalendarAdd">
      <div class="calender-add">
        <div class="header">
            <span>Afspraak plannen</span>
        </div>
        <div class="item">
            <label for="title">Waar gaat de afspraak over?</label>
            <input type="text" id="title" v-model="title">
        </div>
        <div class="item">
            <label for="description">Beschrijving</label>
            <input type="text" id="description" v-model="description">  
        </div>
        <div class="item" v-if="isGroupAdmin">
            <label for="personInput">Voor wie is de afspraak?</label>

            <div class="option-group" v-for="(person, index) in getPeople" :key="person.id">
              <input type="radio" :id="index" :value="person.id" v-model="personInput">
              <label class="person-label" :for="index">{{person.first_name}}</label>
            </div>
        </div>
        <div class="item">
            <label for="personInput">Selecteer een tijd & datum:</label>
            <date-picker v-model="datePickerValue" type="datetime" format="dd-MM-yyyy HH:mm:ss" :minute-step="Number(10)" :lang="datePicker.lang"></date-picker>    
        </div>
        <button class="btn-primary" @click="sendCalendarItem">Afspraak opslaan</button>
        <button class="btn-secondary" @click="showCalendarAdd = !showCalendarAdd">Annuleren</button>
      </div>
    </div>
  </transition>
</div>
</template>

<script>
import axios from "axios";
import Hashids from "hashids";
import moment from "moment";
import DatePicker from "vue2-datepicker";

import variables from "../../variables.js";

export default {
  name: "addCalendarItem",
  components: {
    DatePicker
  },
  data() {
    return {
      showCalendarAdd: false,
      title: "",
      description: "",
      personInput: "",
      datePicker: {
        lang: {
          days: ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"],
          months: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "Mei",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Okt",
            "Nov",
            "Dec"
          ],
          pickers: [
            "volgende 7 dagen",
            "volgende 30 dagen",
            "vorige 7 dagen",
            "vorige 30 dagen"
          ],
          placeholder: {
            date: "Maak een keuze",
            dateRange: "Selecteer Periode"
          }
        },
        options: {
          start: "10:00"
        }
      },
      datePickerValue: null
    };
  },
  computed: {
    /**
     * Converts date to the right format
     * @returns {Date} date
     */
    convertDate() {
      return moment(this.datePickerValue).format();
    },

    /**
     * Checks if the current user is an admin
     * @returns {Boolean}
     */
    isGroupAdmin() {
      if (this.$store.getters.getCurrentUser._embedded) {
        return (
          this.$store.getters.getCurrentUser._embedded.person.owner_id === null
        );
      }
    },

    /**
     * Gets current user from store
     * @returns {Object} currentUser
     */
    getCurrentUser() {
      return this.$store.getters.getCurrentUser;
    },

    /**
     * Gets people from the current user's network
     * @returns {Array} people
     */
    getPeople() {
      if (this.$store.getters.getUsersPeople._embedded) {
        return this.$store.getters.getUsersPeople._embedded.items.filter(
          user => user.id !== this.$store.getters.getCurrentUser.person_id
        );
      }
    }
  },
  methods: {
    /**
     * Sends a calendar item to the backend to send it in the database
     * and emits an event back to the parent component.
     */
    sendCalendarItem() {
      let userId =
        this.personInput === ""
          ? this.$store.getters.getCurrentUser.person_id
          : this.personInput;

      axios({
        method: "POST",
        url: variables.icalEndpoint,
        headers: { "Content-Type": "application/json" },
        data: {
          user_id: userId,
          title: this.title,
          description: this.description,
          startDate: this.convertDate,
          endDate: moment(this.datePickerValue)
            .add(1, "hour")
            .format(),
          url: variables.baseUrl + "/room/" + new Hashids().encode(userId),
          added_by: this.$store.getters.getCurrentUser.person_id
        }
      })
        .then(response => {
          console.log(response);
          this.showCalendarAdd =  !this.showCalendarAdd
          this.$emit("itemAdded");
        })
        .catch(err => {
          console.error(err);
        });
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/styles/all";

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

label {
  display: block;
  margin-bottom: 5px;
}

label.person-label {
  display: inline-block;
  margin-left: 0;
  margin-right: 0;
  min-width: auto !important;
}

input {
  width: 100% !important;
  border: 2px solid gray;
  box-sizing: border-box;
}

input[type=radio] {
  width: auto !important;
}

h1.calendar-title {
  text-align: center;
  font-weight: bold;
  color: white;
}

.option-group {
  display: inline-block;
  margin-left: 10px;
}

.calendar-modal {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.add-appointment {
  padding: 20px 40px;
  max-width: 250px;
  text-align: center;
  background-color: white;
  display: block;
  margin: 0 auto;
  border-radius: 5px;
  box-shadow: 0 5px 10px 0 #bababa;
}

.header {
  font-family: "Open Sans";
  font-size: 1.25em;
  font-weight: bold;
  text-align: center;
  margin: 10px 0 15px 0;
}
.calender-add {
  position: absolute;
  padding: 10px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0 auto;
  border-width: thin;
  border-style: solid;
  border-radius: 5px;
  background-color: #fff;
  border: solid 4px #fff;
  max-width: 500px;
  min-width: 350px;

}
.item {
  margin-bottom: 15px;
  font-family: Lato;
}
</style>

