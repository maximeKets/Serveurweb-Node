
import express from 'express';
import fs from 'fs/promises'
const port = 3000 ;
import fileUpload from 'express-fileupload';
const app = express()

app.use(fileUpload());



app.use(express.static('../frontend'))

app.get('/api/drive/', (req, res) => {

    readDriections('./Data')
        .then((alpsItems) => res.send(alpsItems))
        .catch(err => {
            console.log(err)
        })
})

app.get('/api/drive/:name', (req, res) => {

    fs.stat('./Data/' + req.params.name)
        .then((stats) => stats.isDirectory())
        .then((isDirectory) => {
            if (isDirectory) {
                readDriections('./Data/' + req.params.name)
                    .then((alpsItems) => res.status(200).send(alpsItems))
                    .catch(err => res.status(404).send(err))
            } else {
                return fs.readFile('./Data/' + req.params.name)
                    .then((file) => res.status(200).send(file))
                    .catch(err => res.status(404).send(err))
            }
        })
})

app.post('/api/drive', (req, res) => {
    let folder = req.query.name
    if (regex(folder)) {
        return fs.mkdir('./Data/' + folder)
            .then(() => res.status(201).redirect('back'))
            .catch(() => res.status(404).send('Ce fichier existe deja'))
    } else {
        res.status(400).send("Format fichier non Valide")
    }


})

app.post('/api/drive/:name', async function (req, res) {

    let folder = req.params.name
    let name = req.query.name
    /*  let result = await fs.stat('./Data/' + folder)

              if (!result.isDirectory()){
                  res.status(404).send("Format fichier non Valide")
                  return
              }
              else */
    if (!regex(name)) {
        res.status(400).send("Format fichier non Valide")
        return
    } else {
        return fs.mkdir('./Data/' + folder + '/' + name)
            .then(() => res.status(201).send())
            .catch(() => res.status(404).send("votre fichier exite de"))

    }

})

app.delete('/api/drive/:name', async function  (req, res) {
    let item = req.params.name
    let result = await fs.stat('./Data/' + item)

    if (result.isDirectory()) {
        if (regex(item)) {
            return fs.rm('./Data/' + item, {recursive: true})
                .then(() => res.status(200).send('Fichier supprimé'))
        }
    }
    if (result.isFile()){
        return fs.rm('./Data/' + item, {recursive: true})
            .then(() => res.status(200).send('Fichier supprimé'))
    }
    else{
        res.status(400).send('Format fichier non valide')
    }
})

app.delete('/api/drive/:folder/:name' ,   function(req, res){
    let folder = req.params.folder
    let name = req.params.name

    if (!regex(name)){
        res.status(404).send("fichier au mauvais format")
    }

return fs.rm("./Data/" + folder + '/' + name , {recursive: true})
    .then(() => res.status(200).send('Fichier supprimé'))
    .catch(() => res.status(404).send("le fichier n'existe pas"))

})

app.put ("/api/drive/", function (req, res)  {
    let sampleFile;
    let uploadPath;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    sampleFile = req.files.file;
    uploadPath ='./Data/' + sampleFile.name;

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv(uploadPath, function(err) {
        if (err)
            return res.status(500).send(err);

         return res.send('File uploaded!');
    });
})

app.put ("/api/drive/:name", function (req, res)  {
    let sampleFile;
    let folder = req.params.name;
    let uploadPath;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    sampleFile = req.files.file;
    uploadPath ='./Data/' + folder +"/" + sampleFile.name;

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv(uploadPath, function(err) {
        if (err)
            return res.status(500).send(err);

        return res.send('File uploaded!');
    });
})


app.listen(port, () => {
    console.log(`You can now open http://localhost:${port} in your browser`)
})

function formatItems(items) {
    const alpsItems = []
    for (const item of items) {
        alpsItems.push({
            name: item.name,
            isFolder: item.isDirectory(),
        });
    }
    return alpsItems
}

async function readDriections(path) {
    // const readDirPromise = fs.readdir(path, {withFileTypes: true})
    // const formatItemsPromise = readDirPromise.then((dirents) => formatItems(dirents))
    // return formatItemsPromise;

    const dirents = await fs.readdir(path, {withFileTypes: true});
    return formatItems(dirents)

    // return fs.readdir(path, {withFileTypes: true})
    //     .then((dirents) => {
    //         return formatItems(dirents)
    //     })
}

function regex(input) {
    let regx = new RegExp("^[a-zA-Z]+$", "gm")
    return regx.test(input)
}
