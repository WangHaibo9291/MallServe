
const express = require("express");
//session对象
const session = require("express-session");
//mysql驱动
const mysql =require("mysql");
const multer = require('multer')
const path=require("path");
//跨域
const cors=require("cors");
//3:创建数据库连接池
var pool = mysql.createPool({
    host:"127.0.0.1",
    user:"root",
    password:"",
    database:"sc",
    port:3306,
    connectionLimit:15
});
//4:配置跨域模块:允许脚手架访问服务器
var server = express();
server.use(cors({
  //允许:脚手架访问服务器
  origin:["http://127.0.0.1:8080","http://localhost:8080"],
  //每次请求加验证
  credentials:true
}))
//5:配置session !!!
//6:创建服务器对象
//6.1:配置静态目录
server.use(express.static("public"));
//6.2:配置session对象
server.use(session({
  secret:"128位安全字符串",//加密条件
  resave:true,//请求更新数据
  saveUninitialized:true //保存初始数据
}))
//7:为服务器对象绑定端口 4000
server.listen(4000);



//功能一:用户登录验证
server.get("/login",(req,res)=>{
//(1)获取用户名和密码
 var u = req.query.uname;
 var p = req.query.upwd;
//(2)创建sql
var sql = "SELECT uid FROM user WHERE uname=? AND upwd=md5(?)";
//(3)返回结果
 pool.query(sql,[u,p],(err,result)=>{
    if(err)throw err;
    if(result.length==0){
     res.send({code:-1,msg:"用户名或密码有误"});
    }else{
     var uid = result[0].uid;
     req.session.uid = uid;
     console.log(req.session);
     res.send({code:1,msg:"登录成功"});
    }
 })
})
//注册
server.get("/register",(req,res)=>{
   var u= req.query.uname;
   var p= req.query.upwd;
   var ph= req.query.phone;
   var em= req.query.email;
   var ra= req.query.gender;
   var sql = "INSERT INTO user(uname,upwd,email,phone,gender)VALUES (?,md5(?),?,?,?)";
   pool.query(sql,[u,p,ph,em,ra],(err,result)=>{
      if(err)throw err;
      if(result.length==0){
       res.send({code:-1,msg:"注册失败"});
      }else{
       res.send({code:1,msg:"注册成功"});
      }
   })
  }
  )
//商品列表
server.get("/index",(req,res)=>{
  var pno = req.query.pno;
  var ps = req.query.pageSize;
  if(!pno){pno=1}
  if(!ps){ps=12}
  var sql = "SELECT lid,title,price,img_url FROM sc_index LIMIT ?,?";
  var offset = (pno-1)*ps;
  ps = parseInt(ps);
  pool.query(sql,[offset,ps],(err,result)=>{
       if(err)throw err;
       res.send({code:1,msg:"查询成功",data:result});
  })
  })
  //功能四:查询购物车信息
server.get("/findcart",(req,res)=>{
   //1:获取用户登录凭证uid
   var uid = req.session.uid;
   //2:没有uid 请登录
   if(!uid){
     res.send({code:-2,msg:"请登录",data:[]});
     return;
   }
   //3:创建sql语句
   var sql = "SELECT id,lid,uname,price,ddr,color,imgs,count FROM car WHERE uid = ?";
   //4:发送sql语句
   pool.query(sql,[uid],(err,result)=>{
     if(err)throw err;
     res.send({code:1,msg:"查询成功",data:result})
   })
   //5:将服务器返回结果发送脚手架 
 })
// 商品上传
server.use(express.static('./public'));
const storage = multer.diskStorage({
  destination: function(req,fill,cd){
    cd(null,path.resolve('./public'));
  },
  filename:function(req,fill,cb){
    cb(null,Date.now()+path.extname(fill.originalname));
  }
});
const upload = multer({storage:storage});
server.post('/public',upload.single('uname'),function(req,res,next){
  res.header('Access-Control-Allow-Origin',"*");
  res.send({
    err:null,
    filePath:'/public'+path.basename(req.file.path)
  });

  var u = req.body.name;
  var p = req.body.price;
  var i = req.file.path;
  var ss = i.substr(i.length-17,17);
  
  var sql = "INSERT INTO sc_index(uname,price,imgs)VALUES (?,?,?)";
  pool.query(sql,[u,p,ss],(err,result)=>{
    if(err)throw err;  
  });
  
});
server.listen(5100,function(){
  console.log('app is listening 5100 port');
  
});
// 上传详情页轮播图
server.post('/imgs',upload.single('aaa'),function(req,res,next){
  res.header('Access-Control-Allow-Origin',"*");
  res.send({
    err:null,
    filePath:'/public'+path.basename(req.file.path)
  });

  var u = req.body.fid;
  var i = req.file.path;
  var ss = i.substr(i.length-17,17);
  
  var sql = "INSERT INTO imgs(tid,img)VALUES (?,?)";
  pool.query(sql,[u,ss],(err,result)=>{
    if(err)throw err;  
  });
  
});
server.listen(6000,function(){
  console.log('app is listening 6000 port');
  
});
//商品查询
server.get("/product",(req,res)=>{
  //1:参数 页码
  //一页几行 12
  var pno = req.query.pno;
  var ps = req.query.pageSize;
  //1.1:为参数设置默认值
  if(!pno){pno=1}
  if(!ps){ps=40}
  //2:sql
  var sql = "SELECT lid,uname,price,imgs FROM sc_index LIMIT ?,?";
  //2.1:启始记录数
  var offset = (pno-1)*ps;
  //2.2:一行几条记录
  ps = parseInt(ps);
  //3:返回值
    pool.query(sql,[offset,ps],(err,result)=>{
       if(err)throw err;
       res.send({code:1,msg:"查询成功",data:result});
  })
  })
  // 详情页
    server.get("/details",(req,res)=>{ 
      var fid = req.query.lid;
      var sql = "SELECT lid,fid,uname,title,price,ddr,colour,imgs FROM laptop WHERE fid = ?";
      pool.query(sql,[fid],(err,result)=>{
        if(err)throw err;   
        res.send({code:1,msg:"查询成功",data:result});
      })
    })
    server.get("/img",(req,res)=>{
      var fid = req.query.lid;
      var sql = "SELECT lid,tid,img FROM imgs WHERE tid = ?"
      pool.query(sql,[fid],(err,result)=>{
        if(err)throw err;   
        res.send({code:1,msg:"查询成功",data:result});
      })
    })
  // 商品上传
  server.post('/det',upload.single('sss'),function(req,res,next){
    res.header('Access-Control-Allow-Origin',"*");
    res.send({
      err:null,
      filePath:'/public'+path.basename(req.file.path)
    });
  
    var f = req.body.uid;
    var u = req.body.name;
    var p = req.body.price;
    var t = req.body.title;
    var c = req.body.color;
    var d = req.body.ddr;
    var i = req.file.path;
    var ss = i.substr(i.length-17,17);   
    console.log(f,u,t,p,c,d);
    
    var sql = "INSERT INTO laptop(fid,uname,title,price,colour,ddr,imgs)VALUES (?,?,?,?,?,?,?)";
    pool.query(sql,[f,u,t,p,c,d,ss],(err,result)=>{
      if(err)throw err;  
    });
    
  });
  server.listen(7000,function(){
    console.log('app is listening 7000 port');
    
  });
server.get('/det',(req,res)=>{
  var f = req.query.uid;
  var u = req.query.name;
  var p = req.query.price;
  var t = req.query.title;
  var c = req.query.color;
  var d = req.query.ddr;
  console.log(f,u,t,p,c,d);
  var sql = "INSERT INTO laptop(fid,uname,title,price,colour,ddr)VALUES (?,?,?,?,?,?)";
  pool.query(sql,[f,u,t,p,c,d],(err,result)=>{
    if(err)throw err;  
    res.send({code:1,msg:"上传成功",data:result});
  });
});
server.get('/add',(req,res)=>{
  var uid = req.session.uid;
  console.log(uid);
  
  if(!uid){
    res.send({code:-2,msg:"请登录"});
    return;    
  }
  var o = req.query.sel;
  var i = o.toString();
  var p = req.query.price;
  var d = req.query.ddr;
  var c = req.query.color;
  var u = req.query.uname;
  var ss = req.query.imgs;
  var lid =req.query.lid;
  console.log(i,p,d);
  var sql = "SELECT id FROM car WHERE uid = ? AND lid=?";
  pool.query(sql,[uid,lid],(err,result)=>{
    if(err)throw err;
    if(result.length==0){
      var sql = `INSERT INTO car(lid,uname,site,ddr,color,price,imgs,uid,count)VALUES ('${lid}','${u}','${i}','${d}','${c}','${p}','${ss}','${uid}',1)`;
    }else{
      var sql = `UPDATE car SET count=count+1 WHERE uid=${uid}   AND lid=${lid}`;
    } 
    pool.query(sql,(err,result)=>{
      if(err)throw err;
      res.send({code:1,msg:"添加成功"})
    }); 
  });
})
server.get("/del",(req,res)=>{
  console.log( req.query.id);
  
  var id = req.query.id;
  var sql = "DELETE FROM car WHERE id = ?";
  pool.query(sql,[id],(err,result)=>{
    if(err)throw err;
    res.send({code:1,msg:"删除成功"})
  })
})
server.get("/sou",(req,res)=>{
  var u = req.query.uname;
  var sql = "SELECT lid,uname,price,imgs FROM sc_index WHERE uname = ?";
  pool.query(sql,[u],(err,result)=>{
    if(err)throw err;
    res.send({code:1,msg:"查询成功",data:result})
  })
})
server.get("/ind",(req,res)=>{
  var sql = "SELECT * FROM sc_imgs";
  pool.query(sql,(err,result)=>{
    if(err)throw err;
    res.send({code:1,msg:"查询成功",data:result})
  })
})
server.get("/show",(req,res)=>{
  var sql = "SELECT * FROM sc_index";
  pool.query(sql,(err,result)=>{
    if(err)throw err;
    res.send({code:1,msg:"查询成功",data:result})
  })
})
server.get("/topshow",(req,res)=>{
  var sql = "SELECT * FROM xz_show";
  pool.query(sql,(err,result)=>{
    if(err)throw err;
    res.send({code:1,msg:"查询成功",data:result})
  })
})