
# TPP Open Banking - WSO2 Demo

![Screenshot of the demo's first screen](https://raw.githubusercontent.com/RenanMartorelli/tpp-demo-wso2-openbanking/master/demo-images/first_screen.png)

This demo consists of a CDN Vue.js webapp and a Node.js Backend acting as a sample  third party provider to demonstrate some of the WSO2 Open Banking functionalities.

## Demo scope

This demo can be used to test/demonstrate capabilities of WSO2 Open Banking such
- OAuth/OIDC Hybrid flow and API Security compliant with CIBA and FAPI specifications of the Australian Consumer Data Standards.
- Third Party Provider access grant and revokation for user accounts.

## Prerequisites
* Docker & Docker-compose (both  frontend and backend applications are set to be run in docker)
* A Working WSO2 Open Banking 2.0 environment with configurations following "OB Configs Session" on this readme.

## Configuration and Installation

The environment parameters are all set in a `.env`  file on `backend` folder. After cloning the repository, create a copy of `.env-example` file and rename it to `.env`.

Proceed with the configuration of the parameters:

```php
### Parameters that don't need to be changed by default
CORS_ALLOW_ORIGINS=*
REDIRECT_URL=http://localhost:8081

### Parameters that need to be configured
# from the application created on WSO2 OB APIM
CLIENT_ID=              
                
# WSO2 OB APIM Token url
AUDIENCE=https://localhost:8243/token  

# WSO2 OB APIM url, accessible from the node.js server
WSO2_API_BASE_URL=https://host.docker.internal:8243

# WSO2 OB APIM url, accessible from the web browser
WSO2_PORTAL_BASE_URL=https://localhost:8243

# translation file to be used on the frontend. 
#Check `translations` folder for options
TRANSLATIONS_FILE=en.json

# this is a static JWT token that has to be generated 
#for use in the authentication flow,check session below to generate it.
REQUEST_AUTH_TOKEN=
````

### Obtaining REQUEST_AUTH_TOKEN
After configuring all other parameters besides `REQUEST_AUTH_TOKEN`, run the server once:
```bash
$ docker-compose --build && docker-compose up -d
```
Now run the following curl command to generate the token.
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
## OB Configs Session
This session describes the configs that have to be done on the WSO2 OB Servers in order to run the demo with all its features.
This Demo was prepared with WSO2 OB 2.0, using the Australian CDA Model

Go through this step-by-step guide to configure the OB Servers with de Au Model.

(https://docs.wso2.com/display/OB200/Try+Local+Setup#1f05ff99aaaa46f1b153a62484e4e8b5)

Make sure you create a sample "Consumer Data Standards API v1.3" using the artifacts referenced in the documentation.

After publishing the API, create a sample application to subscribe to this API and add the public PEM certificate* created for this demo at `backend/tpp-cert.pem`.

> * The keys contained in this repository are self-signed and should be used solely for trying out this demonstration.


## Changing Images/CSS
CSS customizations can be directly done on `css/styles.css` file.
Bank and TPP logos can be overrided by adding a new image on `images` folder with the same name/extension.

## Changing labels/translations
To add a new translation or change labels of an existing one, go to `frontend/translation` folder and create a new json file copying the same json structure of `en.json` file and make changes as necessary. Remember to change the name of the translation file to be used in `.env` file accordingly.

## License
[MIT](https://choosealicense.com/licenses/mit/)