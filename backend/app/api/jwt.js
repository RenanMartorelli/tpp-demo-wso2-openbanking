var jose = require('node-jose');
const https = require('https')
const axios = require('axios');
const fs = require('fs');
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

  app.post("/sign-token", async (req, res) =>  {

            // Builts JWT Payload
            var bodyCnt = {
              sub: process.env.CLIENT_ID,
              aud: process.env.AUDIENCE,
              iss: process.env.CLIENT_ID,
              exp: Math.floor(Date.now() / 1000) + (60 * 60),
              jti: Math.floor(Date.now() / 1000) + (60 * 60) + "",
              iat: Math.floor(Date.now() / 1000) - 30
            };

            const privateKeyPEM = '-----BEGIN RSA PRIVATE KEY-----\n\
                                MIIEowIBAAKCAQEAig92T7YC6tzZvFb6JHjlbTFRmuhTML8RQKt7RooI2cHxSyZi\n\
                                1Sho9/ntrE9G5zOI42JUgdFmM9Gf5jPLdsbpy02/yaLJNo/HUHFMszHy0+1wZH04\n\
                                KjE4wBlqHi+hijIKFzOpgYy2axYCcEDgL8VJ75OK71iNBG3TALU/K0YfJ4juzt+9\n\
                                0zS+UTrcFKkQ3HIp5fRyblswksgpFahzp3d0mgSKyh98bnIYdND9T44w95/UzZqn\n\
                                T/PlMta7+YJPvQYTGd+l+sw32bM5tFokTgmJGI/4y0GJk3rQWlFf9U50Iz5GTP4z\n\
                                8HEBVWJkF6HPyzdNAIFWiWbJhvJ3BBgRjDBnTwIDAQABAoIBAFD/tVga3ydQH2bC\n\
                                WMvhKimgD9Kkj3o//y1D7nV6MqsfgCOpB78rkDo8pda8REsNDzjozc/EPQQV7owu\n\
                                wyaSmUQv/1+bZBXg0P0/G9LecSspWRF77eHDMxpxTrMbGtlrdkQaiU56cePt68xU\n\
                                I7OjOjeXBqJZ/5IjpPH7ZG5NG6YjbzMit9dzStZxVMOY+ePMnW6wnec3Rl+qck7K\n\
                                3Y6qBq3/AAu/CS/QWkacNIKvA9AW5N2rDUPQ7HUgZCH98SIM1NzNmX8hG/kkvKvm\n\
                                DgHUqo/owitqR7k56cm0gO6AcxjI/1EIBSt32WvJgQl5VhDHieLVEuPBy3CPoWpO\n\
                                49vF4sECgYEA3AcdCKJGmmFm/RvaRWJSwM4HDStn3JIxU8Wua9lnoq2o6KLDjsnf\n\
                                Pc62TuTBjAtZb063xKrxLHTpJPJISYMgvHUwzYtOpRQXBjX1UAZ9TwUfWmcgyEoo\n\
                                jknO+nVZrvRYwUd9EieKNSrrELAv6xgRUDvBpfjG5UnSPcEsqqCpuNECgYEAoKG+\n\
                                dBaOmKBsWCr78+mdOaPPwA0UV1oG+xF9fznUtvVO9NCBRgCM3+b5/xReUWJlfwuY\n\
                                0Mg0G92nihiJdcY4VLpsyGXwXPk+ryROa0UzHRVLnPBDMif0L+dtdaHSpN7QRECX\n\
                                hzPqWNM9fSt7ASsrB5r08TVkY0H3PLlWLo/0Jh8CgYEAldmaYnjykM3pcFR50Wtn\n\
                                ZLxsfQGk2MoQIjet1PHZ7SdMtDO18Bd4nQWdkBmn35MTNAVujtjFLDvrVShVJwvR\n\
                                TcialkJcK32FOMui6P+idCDO+6jk4MPw3wdRma42iDsN/4SKn8SiEhfKxDDaUciw\n\
                                ce5gsoK+Iwal0z0vCH4nWSECgYAedW0SwDA72reQpF3wK00n39sF9LT1t1l5hCCC\n\
                                3mlqY+ub2mmY54PO9RJUfv0/e2P5ii5o8H2JBye8tNhj37lQv6Te/w1r48syFLVV\n\
                                ++IsUpxq3tgvC4pvBvgnhQ7XOnTNbF4PQhXez/dp47PITfIz1/s4PcKSW7DQ7+fa\n\
                                nmtSSwKBgG+jyGV2QT6hG1EkoBDWb6Qi5y+0MK1p+qB4Wx/1mEgLjq88m819t+Zp\n\
                                DDmzcaB7xxGRzO3u70oNnTxW9uHx9DZiUiHRWAaYFatrGdE+jhuwR9IiSGXLDLlP\n\
                                +Om0opERCiqu3sRmbgvTbc40856Z+EoqwOKeevT3N7j1mz1bu4V/\n\
                                -----END RSA PRIVATE KEY-----'
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
                })   
              }, function(error) {
                  console.log(error);
              });
            });
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
      })
    })


    app.get("/environment-variables", async (req, res) =>  {
      const envVariables = {
        CLIENT_ID: process.env.CLIENT_ID,
        AUDIENCE: process.env.AUDIENCE,
        REDIRECT_URL: process.env.REDIRECT_URL,
        REQUEST_AUTH_TOKEN: process.env.REQUEST_AUTH_TOKEN,
        WSO2_PORTAL_BASE_URL: process.env.WSO2_PORTAL_BASE_URL
      }
      res.status(200)
      res.json(envVariables)
    })
  }