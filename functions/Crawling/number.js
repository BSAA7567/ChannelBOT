const functions = require('firebase-functions');
const admin = require('firebase-admin');
const puppeteer = require('puppeteer');

const op = {
    timeoutSeconds: 60,
    memory: '512MB'
}
exports.number = functions
    .runWith(op)
    .region('asia-northeast1')
    .https
    .onRequest(() => {
        try {
            const getData = async () => {
                const browser = await puppeteer.launch({
                    args: [
                        '--no-sandbox', '--disable-setuid-sandbox', '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHT' +
                                'ML, like Gecko) Chrome/86.0.4240.111 Safari/537.36'
                    ]
                });
                const page = await browser.newPage();
                await page.setDefaultNavigationTimeout(0);
                const ID = "";
                const PW = "";
                await page.goto('https://everytime.kr/login', {waitUntil: "domcontentloaded"});
                await page.evaluate((id, pw) => {
                    document
                        .querySelector('#container > form > p:nth-child(1) > input')
                        .value = id;
                    document
                        .querySelector('#container > form > p:nth-child(2) > input')
                        .value = pw;
                    document
                        .querySelector('#container > form > p.submit > input')
                        .click();
                }, ID, PW);
                console.log('login success');

                await page.waitForNavigation();
                await page.goto(
                    'https://everytime.kr/389111/v/79312283',
                    {waitUntil: "domcontentloaded"}
                );
                await page.waitForSelector('#container > div.wrap.articles > article > a > p');
                const info = await page.$eval(
                    '#container > div.wrap.articles > article > a > p',
                    e => e.outerText
                );
                await browser.close();
                return info;
            }
            getData().then(res => {
                console.log(res);
                admin
                    .database()
                    .ref('School_Number')
                    .set({info: res});
            });
        } catch (error) {
            console.log('WTF : ', error);
        }
    });