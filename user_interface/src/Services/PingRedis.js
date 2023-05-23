import axios from 'axios';
import { MENUBASEURL } from '../constants.js';

export const pingRedis = () => {
    axios.get(`${MENUBASEURL}/pingRedis`).then((resp)=> console.log("Pings redis"))
  
}