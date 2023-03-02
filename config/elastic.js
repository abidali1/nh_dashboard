const fs = require('fs');
const { Client } = require('@elastic/elasticsearch');
// const client = new Client(
//     {
//         node: 'https://localhost:9200',
//         auth: {
//             apiKey: 'Z2NzSWI0WUJrb01lRkZhWF9VZGc6MklLd1VLMndTMXFxaDA5TkdfTkU0QQ=='
//         },
//         tls: {
//             ca: fs.readFileSync('./config/certs/http_ca.crt'),
//             rejectUnauthorized: false
//         }
//     }
// );


const client = new Client({
    cloud: { 
        id: 'My_deployment:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvJGUzN2E2YjUxOTJiMzRlMTVhYzJhMTNhNTcyOWFkOWU1JDI1MDdlMjVkNmQ5ODQwMzZiMTM0YjA3ZmM0MjQ1YTVm' 
    },
    auth: {
        username : "elastic",
        password : "yBHo5JLkIwcRnHLcHWjrYMs6"       
     }
  });





module.exports=client;