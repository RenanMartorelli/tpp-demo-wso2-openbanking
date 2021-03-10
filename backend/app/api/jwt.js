var jose = require('node-jose');
const https = require('https')
const axios = require('axios');
const fs = require('fs');
const p12 = require('p12-pem')
const { pemKey } = p12.getPemFromP12('./tpp1.p12', 'changeit');
require('dotenv').config()

const instance = axios.create({
  baseURL: process.env.WSO2_API_BASE_URL,
  httpsAgent: new https.Agent({
    pfx: fs.readFileSync('tpp1.p12'),
    rejectUnauthorized: false,
    passphrase: "changeit"
  })
});

module.exports = (app) => {

  app.get("/sign-token", async (req, res) =>  {

    // Builts JWT Payload
    var bodyCnt = {
      aud: process.env.AUDIENCE,
      response_type: "code id_token",
      client_id: process.env.CLIENT_ID,
      redirect_uri: process.env.REDIRECT_URL,
      state: "af0ifjsldkj",
      nonce: "n-0S6_WzA2Mj",
      claims: {
        sharing_duration: "7200",
        id_token: {
          acr: {
            essential: true,
            values: [
              "urn:cds.au:cdr:3"
            ]
          }
        },
        userinfo: {
          given_name: null,
          family_name: null
        }
      }
    };

    const privateKeyPEM = pemKey

    jose.JWK.asKey(privateKeyPEM, "pem", {"alg" : "PS256"}).then(function(jwk) {
    
    // Process JWT signing and creation
    jose.JWS.createSign({ alg: 'PS256', compact: true }, jwk)
      .update(JSON.stringify(bodyCnt), "utf8")
      .final()
      .then(function(generatedToken) {
        res.json({"signed_request_auth_token" : generatedToken})
      })
    })
  })

  app.post("/token", async (req, res) =>  {

            // Builts JWT Payload
            var bodyCnt = {
              sub: process.env.CLIENT_ID,
              aud: process.env.AUDIENCE,
              iss: process.env.CLIENT_ID,
              exp: Math.floor(Date.now() / 1000) + (60 * 60),
              jti: Math.floor(Date.now() / 1000) + (60 * 60) + "",
              iat: Math.floor(Date.now() / 1000) - 30
            };

            const privateKeyPEM = pemKey
            jose.JWK.asKey(privateKeyPEM, "pem", {"alg" : "PS256"}).then(function(jwk) {
            
            // Process JWT signing and creation
            jose.JWS.createSign({ alg: 'PS256', compact: true }, jwk)
              .update(JSON.stringify(bodyCnt), "utf8")
              .final()
              .then(function(generatedToken) {

                // ## ACCESS_TOKEN /token request
                // Builds request Parameters
                const params = new URLSearchParams()
                params.append('client_id', process.env.CLIENT_ID)
                params.append('grant_type', 'authorization_code')
                params.append('code', req.body.authorizationCode)
                params.append('client_assertion_type', 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer')
                params.append('scope', 'openid bank:accounts.basic:read bank:accounts.detail:read bank:transactions:read')
                params.append('redirect_uri', process.env.REDIRECT_URL)
                params.append('client_assertion', generatedToken)

                console.log(generatedToken)

                // Builds request headers
                const config = {
                  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }


                process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
                instance.post('/token', params, config).then(response => {
                  console.log(response)
                  res.status(200)
                  response.data.client_assertion = generatedToken
                  res.json(response.data)
                  
                }).catch(error => {

                  console.log(error)
                  res.status(400)
                  res.json({"error": true})

                })   
              }, function(error) {
                  console.log(error);
              });
            });
  })


    app.get("/accounts", (req, res) =>  {
      const config = {
        headers: { 
          'x-v': '1',
          'Authorization': req.header('Authorization')
        }
      }
      
      instance.get("/cds-au/v1/banking/accounts", config).then(response => {
        res.status(200)
        res.json(response.data)
      }).catch(error => {
        console.log(error)
        res.status(400)
        res.json({"error": true})

      })
    })
  
    app.get("/balance", (req, res) => {

      console.log(req.header('Authorization'));

      const body = {"data":{"accountIds":["30080012343456","30080098763459"]},"meta":{}};
      const config = {
        headers: { 
          'Content-Type': 'application/json',
          'x-v': '1',
          'Authorization': req.header('Authorization')
        }
      }

      instance.post('/cds-au/v1/banking/accounts/balances', body, config).then(response => {
        console.log(response)
        res.status(200)
        res.json(response.data)
      }).catch(error => {
        console.log(error)
        res.status(400)
        res.json({"error": true})
        
      })
    })


    app.get("/environment-variables", async (req, res) =>  {
      const envVariables = {
        CLIENT_ID: process.env.CLIENT_ID,
        REDIRECT_URL: process.env.REDIRECT_URL,
        REQUEST_AUTH_TOKEN: process.env.REQUEST_AUTH_TOKEN,
        WSO2_PORTAL_BASE_URL: process.env.WSO2_PORTAL_BASE_URL,
        TRANSLATIONS_FILE: process.env.TRANSLATIONS_FILE
      }
      res.status(200)
      res.json(envVariables)
    })
  }