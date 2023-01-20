const express = require('express')
const { ChartJSNodeCanvas } = require('chartjs-node-canvas')
const {writeFileSync} = require('fs')
const {PDFDocument} = require('pdf-lib')
const fetch = require('cross-fetch')
const app = express()
const port = 3000


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/chart', async (req, res) => {
    const width = 400; //px
    const height = 400; //px
    const backgroundColour = 'white'; // Uses https://www.w3schools.com/tags/canvas_fillstyle.asp
    const chartJSNodeCanvas = new ChartJSNodeCanvas({width, height, backgroundColour});

    //Generacion de la grafica
    await (async () => {
        const configuration = {
            type: 'bar',
            data: {
                labels: ["Africa", "Asia", "Europe", "Latin America", "North America"],
                datasets: [
                    {
                        label: "Population (millions)",
                        backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"],
                        data: [2478,5267,734,784,433]
                    }
                ]
            },
            options: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Predicted world population (millions) in 2050'
                }
            }
        };

        //Guardar tipos de imagenes
        //Imagen normal
        const image = await chartJSNodeCanvas.renderToBuffer(configuration, 'image/jpeg');
        //Base64
        const jpgImageBytes = await chartJSNodeCanvas.renderToDataURL(configuration, 'image/jpeg');
        //Stream
        const stream = chartJSNodeCanvas.renderToStream(configuration, 'image/jpeg');

        //Se crea pagina PDF
        const pdfDoc = await PDFDocument.create()

        //En caso de obtener la imagen a travez de una URL, se convierte a Base64
        const jpgUrl = 'https://pdf-lib.js.org/assets/cat_riding_unicorn.jpg'
        //const jpgImageBytes = await fetch(stream).then((res) => res.arrayBuffer())

        //Se inserta la imagen en el pdf
        const jpgImage = await pdfDoc.embedJpg(jpgImageBytes)

        //Se escala la imagen
        const jpgDims = jpgImage.scale(1)

        //Genera la pagina con la imagen
        const page = pdfDoc.addPage()

        //Ajustes de la imagen
        page.drawImage(jpgImage, {
            x: page.getWidth() / 2 - jpgDims.width / 2,
            y: page.getHeight() / 2 - jpgDims.height / 2 + 250,
            width: jpgDims.width,
            height: jpgDims.height,
        })

        //Se guarda en el server
        writeFileSync("blank.pdf", await pdfDoc.save());

        //Respuesta endpoint
        res.type("image/png")
        res.send(image)
    })();


})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})