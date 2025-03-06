import express from "express";
//
const app = express();
const port = 4000;
//
const handleListening = () => console.log(`server listening ${port}`);
//
const axios = require('axios');

let config = {
  method: 'get',
  maxBodyLength: Infinity,
  url: 'https://healingpaper.testrail.io//index.php?/api/v2/get_runs/1',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ZW1tYS5tb29uQGhlYWxpbmdwYXBlci5jb206MzAvWkNrM1VmVVdSY0pvVXVyQ0wtbTZkNk96WW11azZWOG5BR1dLQko=',
    'Cookie': 'tr_session=cf95e203-2e80-43ac-b7e8-7b1b639d75fe'
  }
};

const data = axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});
console.log(data);

//
// //
app.listen(port, handleListening)