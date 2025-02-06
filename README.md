# Nothing here. 
Just trying to deploy express with ejs on vercel. 

### vercel.json 
```
json {
"version": 2, "builds": [ { "src": "server.js", "use": "@vercel/node" } ]
, "routes": [ { "src": "/(.*)", "dest": "/server.js" } ]
}

 ```

### for serving static files and ejs as template engine
```
app.use(express.urlencoded({ extended: true }));
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
```
