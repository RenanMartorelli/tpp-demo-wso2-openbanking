
# TPP Open Banking - WSO2 Demo

![Screenshot of the demo's first screen](https://raw.githubusercontent.com/RenanMartorelli/tpp-demo-wso2-openbanking/master/demo-images/first_screen.png)

This demo can be used to test/demonstrate capabilities of WSO2 Open Banking such as:
- OAuth/OIDC Hybrid flow and API security compliant FAPI specifications of the australian Consumer Data Standards.
- Third party provider access grant and revokation for user accounts.

This demo consists of a CDN Vue.js webapp and a Node.js backend acting as a sample third party provider application.


## Prerequisites
* Docker & Docker-compose (both  frontend and backend applications are set to be run in docker)
* A Working WSO2 Open Banking 2.0 environment with configurations following "WSO2 OB Configs" on this readme.


## Configuration and Installation

The environment parameters are all set in a `.env`  file on `backend` folder. After cloning the repository, create a copy of `.env-example` file and rename it to `.env`.

Proceed with the configuration of the parameters:

```php
### Parameters that DO NOT need to be changed by default ###

CORS_ALLOW_ORIGINS=*
REDIRECT_URL=http://localhost:8081


### Parameters that DO need to be configured ###

CLIENT_ID=       # From the application created on WSO2 OB APIM       
                
# WSO2 OB APIM Token url
AUDIENCE=https://localhost:8243/token  

# WSO2 OB APIM url, accessible from the node.js server
WSO2_API_BASE_URL=https://host.docker.internal:8243

# WSO2 OB APIM url, accessible from the web browser
WSO2_PORTAL_BASE_URL=https://localhost:8243

# Translation file to be used on the frontend. 
# Check `translations` folder for options
TRANSLATIONS_FILE=en.json

# This is a static JWT token that has to be generated 
# for use in the authentication flow,check session below to generate it.
REQUEST_AUTH_TOKEN=
````


### Obtaining REQUEST_AUTH_TOKEN
After configuring all other parameters besides `REQUEST_AUTH_TOKEN`, run the server once:
```bash
$ docker-compose --build && docker-compose up -d
```
Run the following curl command to generate the token.
```bash
$ curl --location --request GET 'http://localhost:8001/sign-token'
```
You will get a response like this:
```javascript
{"signed_request_auth_token":"eyJhbGciOiJQUzI1NiIsImtpZCI6IkZncjN ... full token"}
```
Copy the full JWT token as paste it on `REQUEST_AUTH_TOKEN` parameter

> Note: If you forget to fill the other environment variables, this call might
> result in an error or the token might be generated improperly.


#### Now you're ready to run the demo!
Run the following command to rebuild the containers.
```bash
$ docker-compose down && docker-compose --build && docker-compose up -d
```
Finally, access application on default port: http://localhost:8081

> Note: frontend code modifications will take effect immediately, but node.js backend modifications will require rebuilding the containers.



## WSO2 OB Configs
This session describes the configuration that has to be done on the WSO2 OB Servers in order to run the demo with all its features.
This Demo was prepared with WSO2 OB 2.0 using the Australian Consumer Data Standards (CDS) Model.

Go through this step-by-step guide to configure the OB Servers with the AU CDS Model:

https://docs.wso2.com/display/OB200/Try+Local+Setup

Make sure you create a sample "Consumer Data Standards API v1.3" using the artifacts as referenced in the above documentation.

After publishing the API, create a sample application to subscribe to this API and add the public PEM certificate created for this demo at `backend/tpp-cert.pem`.

> The keys contained in this repository are self-signed and should be used solely for trying out this demonstration.

For any debugging purposes, all authentication flows and API requests for this demo were built following the specification descripted in:
https://docs.wso2.com/display/OB200/Consumer+Data+Standards+API+v1.3.0

## Changing Images/CSS
CSS customizations can be directly done on `css/styles.css` file.
Bank and TPP logos can be overrided by adding a new image on `images` folder with the same name/extension.


## Changing labels/translations
To add a new translation or change labels of an existing one, go to `frontend/translation` folder and create a new json file copying the same json structure of `en.json` file and make changes as necessary. Remember to change the name of the translation file to be used in `.env` file accordingly.


## License
[MIT](https://choosealicense.com/licenses/mit/)
