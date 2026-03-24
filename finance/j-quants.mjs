import axios from "axios";
import { config } from "dotenv";

config();

const apiKey = process.env.J_QUANTS_API_KEY;

const client = axios.create({
  baseURL: "https://api.jquants.com",
  headers: { "x-api-key": apiKey },
})

// const result = await client.get('/v2/equities/bars/daily', {
//   params: {
//     code: "7203",
//     // date: "20251230",
//     from: "20250930",
//     to: "20251230",
//   },
// });

const result = await client.get('/v2/equities/master', {
  params: {
    code: '4661',
    date: '20251230',
  },
})

// console.log(result.data.data[3]);
console.log(result.data.data[0].CoNameEn);