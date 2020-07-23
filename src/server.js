const express = require("express")
const server = express()

// pegar o banco de dados
const db = require("./database/db")

// Configurar pasta public
server.use(express.static("public"))

// habilitar o uso do req.body (que não vem por padrão no express) na nossa aplicação
server.use(express.urlencoded({ extended: true }))

// Utilizando template engine
const nunjucks = require("nunjucks")
const { query } = require("express")
nunjucks.configure("src/views", {
    express: server,
    noCache: true
})


// Configurar caminhos da minha aplicação

// req: requisição ao servidor
// res: resposta do servidor

// página inicial (a barra '/')
server.get("/", function(req, res) {
    return res.render("index.html", { title: "Agora a paǵina está mais próxima de ser dinâmica"})
})





// página de create-point
server.get("/create-point", function(req, res) {

    // req.query: Query Strings da nossa url
    // console.log(req.query)

    return res.render("create-point.html")
})


server.post("/savepoint", (req, res) => {

    // req.body: o corpo do formulário
    // console.log(req.body)

    // inserir dados no banco de dados
    const query = `
        INSERT INTO places (
            image,
            name,
            address,
            address2,
            state,
            city,
            items
        ) VALUES (?,?,?,?,?,?,?);
    `
    const values = [
        req.body.image,
        req.body.name,
        req.body.address,
        req.body.address2,
        req.body.state,
        req.body.city,
        req.body.items
    ]
    function afterInsertData(err) {
        if(err) {
            console.log(err)
            return res.send("Erro no cadastro")
        }

        console.log("Cadastrado com sucesso")
        console.log(this)

        return res.render("create-point.html", {saved: true})
    }

    db.run(query, values, afterInsertData)
})


// página de search-results
server.get("/search", (req, res) => {

    const search = req.query.search

    if(search == "") {
        // pesquisa vazia
        return res.render("search-results.html", {total: 0})
    }



    // consultar os dados no banco de dados
    db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function(err, rows) {
        if(err) {
            return console.log(err)
        }
        const total = rows.length

        // mostrar a página html com os d`s do banco de dados
        return res.render("search-results.html", { places: rows, total: total })
    })
})


//Ligar o servidor
server.listen(3000)