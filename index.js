// const axios = require("axios");
const { default: axios } = require("axios");
const fs = require("fs");
const { Parser } = require("json2csv");
const json2csvParser = new Parser();

let products = [];
let flag = true;
let i = 201;

const shop = "shoclef-blue.myshopify.com";
const accessToken = "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";
let cursor = "";
let query = "";
async function getCollections() {
  while (flag) {
    if (cursor != "") {
      let filter = `first:1,after:"${cursor}"`;
      query = JSON.stringify({
        query: `{
          products(${filter}) {
            edges {
              cursor
              node {
                id
                title
                productType
              }
            }
          }
        }`,
      });
    } else {
      query = JSON.stringify({
        query: `{
          products(first:1) {
            edges {
              cursor
              node {
                id
                title
                productType
              }
            }
          }
        }`,
      });
    }
    await axios
      .post(`https://${shop}/admin/api/2020-10/graphql.json`, query, {
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
      })
      .then(async (responseJson) => {
        if (responseJson.data.data.products.edges.length > 0) {
          let temp = [...products];
          const t = await temp.filter(
            (item, index) =>
              item.node.productType ==
              responseJson.data.data.products.edges[0].node.productType
          );
          console.log(responseJson.data.data.products.edges[0].node.id);
          console.log(
            responseJson.data.data.products.edges[0].node.productType
          );

          cursor = responseJson.data.data.products.edges[0].cursor;
          if (t.length > 0) {
            console.log("-The product type already saved");
            return;
          }
          products.push(responseJson.data.data.products.edges[0]);
          if (cursor == "") {
            flag = false;
          }
        } else {
          flag = false;
        }
      });
  }
  PushCsv(111);
}

async function PushCsv(fileIndex) {
  const jsonString = JSON.stringify(products);

  await fs.writeFile(`./collections${fileIndex}.json`, jsonString, (err) => {
    if (err) {
      console.log("Error writing file", err);
    } else {
      console.log("Successfully wrote file", fileIndex);
    }
  });
}

getCollections();
