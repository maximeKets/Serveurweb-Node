const express = require('express')
const fs = require('fs/promises')
const path = require('path')
const app = express()
const port = 3000

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
