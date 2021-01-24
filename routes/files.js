const router=require('express').Router();
const multer=require('multer');
const path=require('path');
const { v4: uuidv4 } = require('uuid');

const File=require('../models/file')
let storage=multer.diskStorage({
    destination:(req,file,cb)=>cb(null,'uploads/'),
    filename:(req,file,cb)=>{
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null,uniqueName);
    }
});
let upload=multer({
    storage:storage,
    limit: {fileSize:1000000*100}
}).single('myfile');

router.post('/',(req,res)=>{
    // Validate Request;
    // store files
    upload(req,res,async (err)=>
    {
        if(!req.file){
            return res.json({error:'Please upload file'});
        }
        if(err){
            return res.status(500).send({error:err.message});
        }
        // store Database
        const file=new File({
            filename:req.file.filename,
            uuid:uuidv4(),
            path: req.file.path,
            size:req.file.size

             
        });
        const response=await file.save();
        return res.json({ file: `${process.env.APP_BASE_URL}/files/${response.uuid}` });
             
            // used to get link for downloads
        

    });
      

});
router.post('/send',async (req,res)=>{
    console.log(req.body);
    const {uuid,emailto,emailfrom}=req.body;
    if(!uuid||!emailto||!emailfrom){
        return res.status(422).send({error:"all fields are required"});
    }
    const file=await File.findOne({uuid:uuid});
    if(file.sender){
        return res.status(422).send({error:"email already sent"});
    }
    file.sender=emailfrom;
    file.receiver=emailto;
    const response =await file.save();
    // send email
    const sendmail=require('../services/services');
    sendmail({
        from:emailfrom,
        to:emailto,
        subject:"Eshare file sharing",
        text:`${emailfrom} share a file with you`,
        html:require('../services/emailservices')({
            emailfrom:emailfrom,
            downloadLink:`${process.env.APP_BASE_URL}/files/${file.uuid}`,
            size:parseInt(file.size/1000)+'KB',
            expires:'24 hours'

        })
         
    });
    return res.send({success:true});

});

module.exports=router;