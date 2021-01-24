const express=require("express");
const app=express();
const path=require('path');
const port=process.env.PORT||3000;
const connectDB=require("./config/db");
app.use(express.json());
app.use(express.static("public"));
connectDB();
// app.set('views',path.join(__dirname,'/views')); 
app.set("view engine","ejs");
app.use('/api/files',require('./routes/files')); 
app.use('/files',require('./routes/show'));
app.use('/files/download',require('./routes/download'));
app.listen(port,function(){
    console.log("server is running on 3000");
}); 