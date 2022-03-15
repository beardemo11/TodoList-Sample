const http = require('http');
const { join } = require('path');
const { v4: uuidv4 } = require('uuid');
const errHandle = require('./errorHandle');
const config = require('./config');
const todos = [];

const requestListener = (req, res)=>{
    let body = "";
    req.on('data', chunk=>{
        body+=chunk;
    })
    
    if(req.url=="/todos" && req.method == "GET"){
        res.writeHead(200,config.headers);
        res.write(JSON.stringify({
            "status": "success",
            "data": todos,
        }));
        res.end();
    }else if(req.url=="/todos" && req.method == "POST"){
        req.on('end',()=>{
            try{
                const title = JSON.parse(body).title;
                if(title !== undefined){
                    const todo = {
                        "title": title,
                        "id": uuidv4()
                    };
                    todos.push(todo);
                    res.writeHead(200,config.headers);
                    res.write(JSON.stringify({
                        "status": "success",
                        "data": todos,
                    }));
                    res.end();
                }else{
                    errHandle(res,"錯誤:找不到title");
                }
                
            }catch(error){
                errHandle(res,error.message);
            }
            
        })
    }else if(req.url=="/todos" && req.method == "DELETE"){
        todos.length=0;
        res.writeHead(200,config.headers);
        res.write(JSON.stringify({
            "status": "success",
            "data": todos,
        }));
        res.end();
    }else if(req.url.startsWith("/todos/") && req.method == "DELETE"){
        const id = req.url.split('/').pop();
        const index= todos.findIndex(element =>element.id==id);
        if(index !== -1){
            todos.splice(index,1);
            res.writeHead(200,config.headers);
            res.write(JSON.stringify({
                "status": "success",
                "data": todos,
            }));
            res.end();
        }
        else{
            errHandle(res,"找不到ID");
        }
    }else if(req.url.startsWith("/todos/") && req.method == "PATCH"){
            req.on("end",()=>{
                try {
                    const todo =JSON.parse(body).title;
                    const id = req.url.split('/').pop();
                    const index=todos.findIndex(element=> element.id==id);
                    if(todo !== undefined && index !== -1){
                        todos[index].title=todo;
                        res.writeHead(200,config.headers);
                        res.write(JSON.stringify({
                            "status": "success",
                            "data": todos,
                        }));
                        res.end();
                    }else{
                        errHandle(res,"找不到ID");
                    }
                } catch (error) {
                    errHandle(res,error.message);
                }
            })
    }else if(req.method == "OPTIONS"){
        res.writeHead(200,config.headers);
        res.end();
    }else{
        res.writeHead(404,config.headers);
        res.write(JSON.stringify({
            "status": "false",
            "message": "無此網站路由"
        }));
        res.end();
    }
}

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3005);