// const axios = require("axios");
const { default: axios } = require("axios");
const fs = require("fs");
const { Parser } = require("json2csv");
const json2csvParser = new Parser();

let products = [];
let flag = true;
let i = 201;

const shop = "shoclef-gold.myshopify.com";
const accessToken = "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";
let cursor = "";
let query = "";
async function getCollections() {
  while (flag) {
    if (cursor != "") {
      let filter = `first:1,after:"${cursor}"`;
      query = JSON.stringify({
        query: `{
        collections(${filter})
        {
          edges{
            cursor
            node {
              title
              description
              image {
                id
                originalSrc
              }
            }
          }
        }
      }`,
      });
    } else {
      query = JSON.stringify({
        query: `{
          collections(first:1)
          {
            edges{
              cursor
              node {
                title
                description
                image {
                  id
                  originalSrc
                }
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
        if (responseJson.data.data.collections.edges.length > 0) {
          products.push(responseJson.data.data.collections.edges[0]);
          cursor = responseJson.data.data.collections.edges[0].cursor;
          console.log(responseJson.data.data.collections.edges[0].node.title);
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
