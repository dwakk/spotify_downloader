import './assets/main.css'
import './assets/pico.min.css'

import { createApp } from 'vue'
import App from './App.vue'

import {library} from "@fortawesome/fontawesome-svg-core"
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome"
import { faMoon, faSun } from '@fortawesome/free-regular-svg-icons'
import {faGear, faDownload, faSpinner} from "@fortawesome/free-solid-svg-icons"

library.add(faMoon, faSun, faDownload, faSpinner)

const app = createApp(App);

app.component('font-awesome-icon', FontAwesomeIcon);
app.mount('#app');