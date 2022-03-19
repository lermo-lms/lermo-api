
// User instructor1
import fetch from 'node-fetch'
// const fetch = require("node-fetch");

const videos = [
  {
    "view" : 0,
    "userId" : "6067f760a10c875dcdb8d7c7",
    "title" : "SME ยุคดิจิตอล ค้าคล่องด้วยออนไลน์",
    "description" : "",
    "price" : 0,
    "status" : "completed",
    "videoName" : "SME",
    "videoPath" : "6067f760a10c875dcdb8d7c7/SME-1619670657",
    "category" : "Business",
    "": ""
  },
  {
    "view" : 0,
    "userId" : "6067f760a10c875dcdb8d7c7",
    "title" : "รู้รอบเรื่องภาษี",
    "description" : "รู้รอบเรื่องภาษี",
    "price" : 0,
    "status" : "completed",
    "videoName" : "SME",
    "videoPath" : "6067f760a10c875dcdb8d7c7/SME-1619670657",
    "category" : "Business",
    "": ""
  },
  {
    "view" : 0,
    "userId" : "6067f760a10c875dcdb8d7c7",
    "title" : "ยอดขายพุ่งด้วย Social Media",
    "description" : "ยอดขายพุ่งด้วย Social Media",
    "price" : 0,
    "status" : "completed",
    "videoName" : "SME",
    "videoPath" : "6067f760a10c875dcdb8d7c7/SME-1619670657",
    "category" : "Business",
    "": ""
  },
  {
    "view" : 0,
    "userId" : "6067f760a10c875dcdb8d7c7",
    "title" : "ยอดขายพุ่งด้วย Social Media",
    "description" : "ยอดขายพุ่งด้วย Social Media",
    "price" : 0,
    "status" : "completed",
    "videoName" : "SME",
    "videoPath" : "6067f760a10c875dcdb8d7c7/SME-1619670657",
    "category" : "Business",
    "": ""
  },
  {
    "view" : 0,
    "userId" : "6067f760a10c875dcdb8d7c7",
    "title" : "ปรับฮวงจุ้ย รับธุรกิจเฮง",
    "description" : "ปรับฮวงจุ้ย รับธุรกิจเฮง",
    "price" : 0,
    "status" : "completed",
    "videoName" : "SME",
    "videoPath" : "6067f760a10c875dcdb8d7c7/SME-1619670657",
    "category" : "Business",
    "": ""
  },
  {
    "view" : 0,
    "userId" : "6067f760a10c875dcdb8d7c7",
    "title" : "ทำโปรโมชั่นอย่างไรให้มีแต่รวย",
    "description" : "ทำโปรโมชั่นอย่างไรให้มีแต่รวย",
    "price" : 0,
    "status" : "completed",
    "videoName" : "SME",
    "videoPath" : "6067f760a10c875dcdb8d7c7/SME-1619670657",
    "category" : "Business",
    "": ""
  },
  {
    "view" : 0,
    "userId" : "6067f760a10c875dcdb8d7c7",
    "title" : "บริหารคนอย่างรู้ใจ ในภาวะวิกฤต",
    "description" : "บริหารคนอย่างรู้ใจ ในภาวะวิกฤต",
    "price" : 0,
    "status" : "completed",
    "videoName" : "SME",
    "videoPath" : "6067f760a10c875dcdb8d7c7/SME-1619670657",
    "category" : "Business",
    "": ""
  },
  {
    "view" : 0,
    "userId" : "6067f760a10c875dcdb8d7c7",
    "title" : "LEAN ลดต้นทุนสู่กำไรที่ยิ่งใหญ่กว่า",
    "description" : "LEAN ลดต้นทุนสู่กำไรที่ยิ่งใหญ่กว่า",
    "price" : 0,
    "status" : "completed",
    "videoName" : "SME",
    "videoPath" : "6067f760a10c875dcdb8d7c7/SME-1619670657",
    "category" : "Business",
    "": ""
  },
  {
    "view" : 0,
    "userId" : "608f972268578764370cab9a",
    "title" : "LEAN ลดต้นทุนสู่กำไรที่ยิ่งใหญ่กว่า",
    "description" : "LEAN ลดต้นทุนสู่กำไรที่ยิ่งใหญ่กว่า",
    "price" : 0,
    "status" : "completed",
    "videoName" : "SME",
    "videoPath" : "6067f760a10c875dcdb8d7c7/SME-1619670657",
    "category" : "Business",
    "": ""
  },
  {
    "view" : 0,
    "userId" : "608f972268578764370cab9a",
    "title" : "Introduction to Startup โดย โบ๊ท Builk",
    "description" : "Introduction to Startup โดย โบ๊ท Builk",
    "price" : 0,
    "status" : "completed",
    "videoName" : "Startup",
    "videoPath" : "6067f760a10c875dcdb8d7c7/Startup-1619670657",
    "category" : "Business",
    "": ""
  },
  {
    "view" : 0,
    "userId" : "608f972268578764370cab9a",
    "title" : "Idea Formation โดย พอล SpotOn",
    "description" : "Idea Formation โดย พอล SpotOn",
    "price" : 0,
    "status" : "completed",
    "videoName" : "Startup",
    "videoPath" : "6067f760a10c875dcdb8d7c7/Startup-1619670657",
    "category" : "Business",
    "": ""
  },
  {
    "view" : 0,
    "userId" : "608f972268578764370cab9a",
    "title" : "Go to Market โดย บอย ShopSpot",
    "description" : "Go to Market โดย บอย ShopSpot",
    "price" : 0,
    "status" : "completed",
    "videoName" : "Startup",
    "videoPath" : "6067f760a10c875dcdb8d7c7/Startup-1619670657",
    "category" : "Business",
    "": ""
  },
  {
    "view" : 0,
    "userId" : "608f972268578764370cab9a",
    "title" : "Product Design โดย ต้อง UX Academy",
    "description" : "Product Design โดย ต้อง UX Academy",
    "price" : 0,
    "status" : "completed",
    "videoName" : "Startup",
    "videoPath" : "6067f760a10c875dcdb8d7c7/Startup-1619670657",
    "category" : "Business",
    "": ""
  },
  {
    "view" : 0,
    "userId" : "608f972268578764370cab9a",
    "title" : "Growth โดย ป๊อบ GetLinks",
    "description" : "Growth โดย ป๊อบ GetLinks",
    "price" : 0,
    "status" : "completed",
    "videoName" : "Startup",
    "videoPath" : "6067f760a10c875dcdb8d7c7/Startup-1619670657",
    "category" : "Business",
    "": ""
  },
  {
    "view" : 0,
    "userId" : "608f972268578764370cab9a",
    "title" : "Raising Money โดย มะเหมี่ยว 500 Startups",
    "description" : "Raising Money โดย มะเหมี่ยว 500 Startups",
    "price" : 0,
    "status" : "completed",
    "videoName" : "Startup",
    "videoPath" : "6067f760a10c875dcdb8d7c7/Startup-1619670657",
    "category" : "Business",
    "": ""
  },
  {
    "view" : 0,
    "userId" : "608f972268578764370cab9a",
    "title" : "Pitching โดย แซม Stylehunt",
    "description" : "Pitching โดย แซม Stylehunt",
    "price" : 0,
    "status" : "completed",
    "videoName" : "Startup",
    "videoPath" : "6067f760a10c875dcdb8d7c7/Startup-1619670657",
    "category" : "Business",
    "": ""
  },
  {
    "view" : 0,
    "userId" : "608f972268578764370cab9a",
    "title" : "Building Company I - Forming Team โดย บิ๊ก SkillLane",
    "description" : "Building Company I - Forming Team โดย บิ๊ก SkillLane",
    "price" : 0,
    "status" : "completed",
    "videoName" : "Startup",
    "videoPath" : "6067f760a10c875dcdb8d7c7/Startup-1619670657",
    "category" : "Business",
    "": ""
  },
  {
    "view" : 0,
    "userId" : "608f972268578764370cab9a",
    "title" : "Building Company II - Growing Company โดย ยอด Wongnai",
    "description" : "Building Company II - Growing Company โดย ยอด Wongnai",
    "price" : 0,
    "status" : "completed",
    "videoName" : "Startup",
    "videoPath" : "6067f760a10c875dcdb8d7c7/Startup-1619670657",
    "category" : "Business",
    "": ""
  },
  {
    "view" : 0,
    "userId" : "608f972268578764370cab9a",
    "title" : "From SME to Startup โดย แจ๊ค ClaimDi",
    "description" : "From SME to Startup โดย แจ๊ค ClaimDi",
    "price" : 0,
    "status" : "completed",
    "videoName" : "Startup",
    "videoPath" : "6067f760a10c875dcdb8d7c7/Startup-1619670657",
    "category" : "Business",
    "": ""
  },
  {
    "view" : 0,
    "userId" : "608f972268578764370cab9a",
    "title" : "Fail-to-Success โดย แม็กซ์ StockRadars",
    "description" : "Fail-to-Success โดย แม็กซ์ StockRadars",
    "price" : 0,
    "status" : "completed",
    "videoName" : "Startup",
    "videoPath" : "6067f760a10c875dcdb8d7c7/Startup-1619670657",
    "category" : "Business",
    "": ""
  },
  {
    "view" : 0,
    "userId" : "608f972268578764370cab9a",
    "title" : "Raising Fund โดย กั๊ก Computerlogy",
    "description" : "Raising Fund โดย กั๊ก Computerlogy",
    "price" : 0,
    "status" : "completed",
    "videoName" : "Startup",
    "videoPath" : "6067f760a10c875dcdb8d7c7/Startup-1619670657",
    "category" : "Business",
    "": ""
  },
  {
    "view" : 0,
    "userId" : "608f972268578764370cab9a",
    "title" : "Incubators and Accelerators โดย กั๊ก Piggipo & กฤต FlowAccount & ทอม SellSuki",
    "description" : "Incubators and Accelerators โดย กั๊ก Piggipo & กฤต FlowAccount & ทอม SellSuki",
    "price" : 0,
    "status" : "completed",
    "videoName" : "Startup",
    "videoPath" : "6067f760a10c875dcdb8d7c7/Startup-1619670657",
    "category" : "Business",
    "": ""
  },
  {
    "view" : 0,
    "userId" : "608f972268578764370cab9a",
    "title" : "Social Enterprise โดย อาชว์ Social Giver",
    "description" : "Social Enterprise โดย อาชว์ Social Giver",
    "price" : 0,
    "status" : "completed",
    "videoName" : "Startup",
    "videoPath" : "6067f760a10c875dcdb8d7c7/Startup-1619670657",
    "category" : "Business",
    "": ""
  }
]

videos.forEach((video) => {
  postRequest('http://localhost:4000/videos', video)
  .then(data => console.log(data)) // Result from the `response.json()` call
  .catch(error => console.error(error))
})

function postRequest(url, data) {
  return fetch(url, {
    // credentials: 'same-origin', // 'include', default: 'omit'
    method: 'POST', // 'GET', 'PUT', 'DELETE', etc.
    body: JSON.stringify(data), // Coordinate the body type with 'Content-Type'
    headers: new Headers({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MDhmOTcyMjY4NTc4NzY0MzcwY2FiOWYiLCJlbWFpbCI6Imluc3RydWN0b3I0QHRlc3QudGVzdCIsInVzZXJuYW1lIjoiaW5zdHJ1Y3RvcjQiLCJpYXQiOjE2MjAyODQxNDEsImV4cCI6MTYyMDM3MDU0MSwiaXNzIjoibGVybW8ifQ.aZis4KzQXPsZGAUbbkAjKHdrogrSvQWWM4YkpRtppb7RkJ1lsxeVVxwMJZkPr4Ns8msUpZO6RRYtCRhBQ-b-e-FRHIDMLs-9hlT8Y6g_o3pJQY3Filw5Sd5u5euFsi_1LcQYpxTRdy-PX44t5MPPbEXlLYrW0grBo6iFwDdrimQxsrJf51LPnjY5AdtqRWYh8ko8mQGOIAfukas1rcD948oEilU_F-D2g77kuqx85kxxTKNUaPXhHELZCcSSt_DNoMlshxW1weh4B2TOmytJFKnkKDfH4LleL8HK6spBk7uoOwh2tvZ5KMVbHp0N94g3cDtChqoe5d26laq86jbjIg'
    }),
  })
  .then(response => response.json())
}