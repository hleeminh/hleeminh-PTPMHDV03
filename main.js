const puppeteer = require('puppeteer');
const express = require("express");
const bodyParser = require('body-parser');
const req = require('express/lib/request');
const pptr = require('puppeteer-core');
const app = express();
const port = 3000;

app.set('view engine', 'pug'); //sử dụng pug làm view engine
app.use(bodyParser.urlencoded({ extended: true }));

var n = [];
app.get("/", async(req, res, next) => { // tạo route get 
    res.render('index', { n })
});

app.post("/", async(req, res, next) => {
    console.log(req.body.name); // log ra màn hình dữ liệu đầu vào

    try {
        var k = req.body.name.split(","); //khai báo biến đầu vào sử dụng req.body
        (async() => {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto("https://diemthi.vnexpress.net/", {
                waitUntil: 'networkidle2',
            });
            //khai báo trường nhập 
            var textfield = await page.waitForXPath(`//*[@id="keyword"]`); //waitForXPath: xác định vị trí phần tử trên trang
            await textfield.click()
            await textfield.type(k);
            //khai báo button 
            var button = await page.waitForXPath(`//*[@id="result"]/div[2]/div[1]/div/div[1]/div/button`);
            await Promise.all([
                button.click(),
                //waitForSelector:thực hiện việc chờ đến khi selector chỉ định được tìm thấy.
                page.waitForSelector(`#warpper > div.section-content.clearfix > div.section_main.width_common > div.section-body.width_common > div > div.o-detail-thisinh`)
            ]);
            //khai báo bảng điểm
            const result = await page.evaluate(() => {
                // document.querySelector : trả về phần tử đầu tiên được tìm thấy bởi CSS Selector
                var list = document.querySelector("#warpper > div.section-content.clearfix > div.section_main.width_common > div.section-body.width_common > div > div.o-detail-thisinh").innerHTML;
                return list;
            });

            const ketqua = {
                bangdiem: result,
            }
            n.unshift(ketqua);
            n.length = 1;
            res.redirect('/');
            await browser.close();
        })();

    } catch (error) {
        console.log(error);
        res.status(500).send("ERROR");
    }

});
app.listen(port, () => {
    console.log(`app is running on port: ${port}`);
});