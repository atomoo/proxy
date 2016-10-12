# proxy
```
var httpProxy = require('./httpProxy');
var app = express();
app.use(function(req, res, next){
    httpProxy({
        '/cf/':{
            target: 'http://127.0.0.1:5000'
        }
    })(req, res, next);
});
```
