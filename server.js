
const express=require('express')
const http=require('http')
const fs=require('fs')
const {Server}=require('socket.io')
const app=express()
const server=http.createServer(app)
const io=new Server(server)
app.get('/',(req,res)=>res.sendFile(__dirname+'/index.html'))
if(!fs.existsSync('./users.json'))fs.writeFileSync('./users.json','{}')
const load=()=>JSON.parse(fs.readFileSync('./users.json'))
const save=(d)=>fs.writeFileSync('./users.json',JSON.stringify(d))
let online=0
io.on('connection',s=>{
online++;io.emit('online',online)
s.on('register',d=>{
let u=load()
if(u[d.username]) return s.emit('err','الاسم مستخدم')
u[d.username]={password:d.password,money:500000,bank:200000,loan:0,job:'تاجر'}
save(u);s.username=d.username;s.emit('ok',u[d.username])
})
s.on('login',d=>{
let u=load()
if(!u[d.username]||u[d.username].password!==d.password) return s.emit('err','بيانات خاطئة')
s.username=d.username;s.emit('ok',u[d.username])
})
s.on('salary',()=>{
let u=load(),me=u[s.username]
let sal=50000
if(me.loan>0){let cut=Math.min(5000,me.loan);me.loan-=cut;sal-=cut}
me.money+=sal;save(u);io.emit('upd',{username:s.username,user:me})
})
s.on('loan',()=>{
let u=load(),me=u[s.username]
me.loan+=100000;me.money+=100000;save(u);io.emit('upd',{username:s.username,user:me})
})
s.on('chat',m=>io.emit('chat',{user:s.username,msg:m,time:new Date().toLocaleTimeString('ar-SA')}))
s.on('disconnect',()=>{online--;io.emit('online',online)})
})
server.listen(process.env.PORT||3000)
