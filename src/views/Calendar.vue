<template>
<div class="calendar">
  <button class="button-primary calendar-button" @click="$router.push('/')">Home</button>

  <AddCalendar @itemAdded="reload" />
  <hr>
  <DisplayCalendarItems :calendarItems="calendarData" @reloadItems="reload" />
</div>
</template>

<script>
import axios from "axios";
import variables from "../variables";
import AddCalendar from "../components/calendar/AddCalendarItem";
import DisplayCalendarItems from "../components/calendar/DisplayCalendarItems";

export default {
  name: "calendar",
  data() {
    return {
      calendarData: []
    };
  },
  components: {
    AddCalendar,
    DisplayCalendarItems
  },
  computed: {
    /**
     * Gets token from the store
     * @returns {String} token
     */
    token() {
      return this.$store.getters.getToken;
    }
  },
  methods: {
    /**
     * @returns {Axios} get request with userEndpoint
     */
    getCurrentUserEndpoint() {
      return axios.get(variables.userEndpoint, {
        headers: { Authorization: "Bearer " + this.token }
      });
    },

    /**
     * @returns {Axios} get request with peopleEndpoint
     */
    getPeopleEndpoint() {
      return axios.get(variables.peopleEndpoint, {
        headers: { Authorization: "Bearer " + this.token }
      });
    },

    /**
     * Gets calendar items from database
     * @param {Number} id
     */
    getCalendarItems(id) {
      axios
        .get(variables.getCalenderItemsEndpoint, {
          headers: { "Content-Type": "application/json" },
          params: {
            user_id: id
          }
        })
        .then(response => {
          console.log(response);
          this.calendarData = response.data.data.items;
        })
        .catch(error => {
          console.log(error);
        });
    },

    /**
     * Reloads calendar items by doing another request
     */
    reload() {
      this.getCalendarItems(this.$store.getters.getCurrentUser.person_id);
    }
  },

  /**
   * If token is set, get data from Carenzorgt.nl.
   * If no token is set, redirect to Carenzorgt.nl to authenticate.
   */
  created() {
    if (this.token) {
      axios
        .all([this.getCurrentUserEndpoint(), this.getPeopleEndpoint()])
        .then(
          axios.spread((currentUser, people) => {
            this.$store.dispatch("addPeople", {
              currentUser: currentUser.data,
              people: people.data
            });

            this.getCalendarItems(currentUser.data.person_id);
          })
        )
        .catch(err => {
          console.log("err", err);
          window.location =
            "https://www.carenzorgt.nl/login/oauth/authorize?response_type=token&client_id=" +
            variables.clientId +
            "&redirect_uri=" +
            variables.redirectUri +
            "&scope=user.read+calendar.read+care_givers.read";
        });
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../assets/styles/all";
.calendar {
  padding-top: 15px;

  .calendar-button {
    position: absolute;
    top: 20px;
    right: 20px;
  }
}
</style>

