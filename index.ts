require('dotenv').config();

const fs = require('fs');
const path = require('path');
const url = require('url');
const Jimp = require('jimp');
const express =require('express');

const app = express()

//middleware
const cors = require('cors')
const corsOptions = {
    origin: process.env.APP_ORIGIN && process.env.APP_ORIGIN != '*' ? process.env.APP_ORIGIN.split(',') : '*',
    optionSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use((err, req, res, next)=> {
    const filePath = path.join(__dirname, process.env.DEFAULT_IMAGE);
    res.sendFile(filePath);
});

app.get('*', async (req, res) => {
    res.removeHeader('Transfer-Encoding');
    res.removeHeader('X-Powered-By');

    const query = url.parse(req.url, true).query;
    let file = url.parse(req.url).pathname;
    let filePath = path.join(__dirname, `public/images/${file}`);

    if(!fs.existsSync(filePath)){
            file = process.env.DEFAULT_IMAGE;
            filePath = path.join(__dirname, `public/images/${file}`)
    }

    const height = parseInt(query.h) || 0;
    const width = parseInt(query.w ) || 0;
    const quality = parseInt(query.q) < 100 ? parseInt(query.q as string) : 99;

    const folder = `q${quality}_h${height}_w{width}`;
    const out_file = `public/thumb/${folder}/${file}`;
    if(!fs.existsSync(path.resolve(out_file))) {
        res.sendFile(path.resolve(out_file))
        return;
    }
    if(!height || !width ){
        res.sendFile(path.resolve(`public/images/${file}`));
        return;
    }

    Jimp.read(path.resolve(`public/images/${file}`))
        .then(lenna => {
                    lenna.resize(width, height);
                    lenna.quality(quality);

                    lenna.write(path.resolve(out_file), () =>{
                        fs.createReadStream(path.resolve(out_file)).pipe(res);
                    })
        })
        .catch(err => {
            res.sendFile(path.resolve(`public/images/${file}`))
        });

        app.listen(process.env.PORT)

})