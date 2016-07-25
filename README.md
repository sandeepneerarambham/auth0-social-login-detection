# auth0-social-login-detection
Auth0 social login detection solution to detect if a user is already logged in to Google or Facebook and take appropriate action when clicking Login or show the Auth0 Lock instead.

This project makes use of the [Auth0 + NodeJS Seed](https://github.com/auth0/node-auth0/tree/master/examples/nodejs-regular-webapp) and builds upon it.This is the seed project you need to use if you're going to create regular NodeJS web application.

## Contents

- [Pre-Requisites](#pre-requisites)
- [Running the example](#running-the-example)
- [Initialize](#initialize) 
- [Social Login Detection](#social-login-detection)
- [Processing the Callback](#processing-the-callback)
- [Linking Accounts](#linking-accounts)

##Pre-requisites
1.Register at Auth0 and create an app as shown in the video in the link - [Auth0 - how it works](https://auth0.com/how-it-works)

2.Once the app is created, [Connect your app to Google](https://auth0.com/docs/connections/social/google) and [Connect your app to Facebook](https://auth0.com/docs/connections/social/facebook)



You also need to set the ClientSecret, ClientId, Domain, Callback url for your Auth0 app as environment variables with the following names respectively: `AUTH0_CLIENT_SECRET`, `AUTH0_CLIENT_ID` , `AUTH0_DOMAIN` and `AUTH0_CALLBACK_URL`.

For that, if you just create a file named .env in the directory and set the values like the following, the app will just work:

````bash
# .env file
AUTH0_CLIENT_SECRET=myCoolSecret
AUTH0_CLIENT_ID=myCoolClientId
AUTH0_DOMAIN=myCoolDomain
AUTH0_CALLBACK_URL=http://localhost:3000/callback
````

Once you've set those 4 environment variables, just run `npm start` and try calling [http://localhost:3000/](http://localhost:3000/)

[Demo app](http://soc-login.herokuapp.com) and [Demo Video](https://youtu.be/UVbY9EP_V6Q) available.

Note:Similar login detection for G+ and Twitter can be done as below -
```html
window.checkGooglePlusStatus = checkServiceStatus("https://plus.google.com/up/?continue=https://www.google.com/intl/en/images/logos/accounts_logo.png&type=st&gpsrc=ogpy0");
window.checkTwitterStatus = checkServiceStatus("https://twitter.com/login?redirect_after_login=%2Fimages%2Fspinner.gif");
```

##Running the example
In order to run the example you need to have npm and NodeJS installed.

Now, run `npm install` to install the dependencies.

## Initialize

Construct a new instance of the Auth0 client as follows:

```html
<script src="https://cdn.auth0.com/w2/auth0-6.7.js"></script>
<script type="text/javascript">
  var auth0 = new Auth0({
    domain:       'mine.auth0.com',
    clientID:     'dsa7d77dsa7d7',
    callbackURL:  'http://my-app.com/callback'
    // callbackOnLocationHash not set (defaults to false)
  });

  //...
</script>
```

Construct a new instance of the Auth0 Lock as follows:

```html
<script src="https://cdn.auth0.com/js/lock-9.0.js"></script>
<script type="text/javascript">
  var lock = new Auth0Lock({
    domain:       'mine.auth0.com',
    clientID:     'dsa7d77dsa7d7'
  });

  //...
</script>
```

## Social Login Detection
Upon click of the login button, intention is to check if the user is already logged in to Google/Facebook.

For **Google** the approach is to try & load the below image from google through the [url](https://accounts.google.com/CheckCookie?continue=https%3A%2F%2Fwww.google.com%2Fintl%2Fen%2Fimages%2Flogos%2Faccounts_logo.png&followup=https%3A%2F%2Fwww.google.com%2Fintl%2Fen%2Fimages%2Flogos%2Faccounts_logo.png&chtml=LoginDoneHtml&checkedDomains=youtube&checkConnection=youtube%3A291%3A1)

![accounts_logo](https://cloud.githubusercontent.com/assets/19296842/16840546/9fd62524-4a18-11e6-9c76-ac1328acb75d.png)

The below logic helps us determine whether the use is logged in to google.

```html
<script type="text/javascript">
(function () {
                var checkServiceStatus = function (image, success, error) {
                    return function (success, error) {
                        var img = new Image();
                        img.src = image;
                        img.onload = success || function () {
                                };
                        img.onerror = error || function () {
                                };
                    };
                };
                window.checkGoogleStatus = checkServiceStatus("https://accounts.google.com/CheckCookie?continue=https%3A%2F%2Fwww.google.com%2Fintl%2Fen%2Fimages%2Flogos%2Faccounts_logo.png&followup=https%3A%2F%2Fwww.google.com%2Fintl%2Fen%2Fimages%2Flogos%2Faccounts_logo.png&chtml=LoginDoneHtml&checkedDomains=youtube&checkConnection=youtube%3A291%3A1");
            }());

            checkGoogleStatus(function () {
                //image load successful
                //trigger login with google

            }, function () {
                //image load error
                //trigger login with lock
            });
</script>
```
If the user is not logged in, the img.onload comes back with an error with 400 response status code.

Based on success/error of the image onload, we now have 2 paths - trigger login with google,trigger login with lock
```html
<script type="text/javascript">
 checkGoogleStatus(function () {
                //trigger login with google
                {
                    auth0.login({
                        connection: 'google-oauth2'
                    }, function (err) {
                        if (err) alert("something went wrong: " + err.message);
                    });

                }
            }, function () {
                lock.show({
                    callbackURL: '#{env.AUTH0_CALLBACK_URL}'
                    , responseType: 'code'
                });
            });
</script>
```
For trigger login with google,we will be using the  Auth0 client as shown in the [Initialize](#initialize) section above.

For **Facebook**, the approach taken is to get the login status from FB.getLoginStatus.
Below code helps us to get the Facebook login status of a user.

```html
window.fbAsyncInit = function () {
    FB.init({
        appId: '1745991308982353',
        xfbml: true,
        status: true,
        cookie: true,
        oauth: true,
        version: 'v2.7'
    });
    fbApiInit = true; //init flag
};

(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function fbEnsureInit(callback) {
    if (!window.fbApiInit) {
        setTimeout(function () {
            fbEnsureInit(callback);
        }, 50);
    } else {
        if (callback) {
            callback();
        }
    }
}

fbEnsureInit(function () {
                    console.log("this will be run once FB is initialized");
                    FB.getLoginStatus(function (response) {
                        if (response.status === 'connected') {
                            // the user is logged in and has authenticated your
                            // app, and response.authResponse supplies
                            // the user's ID, a valid access token, a signed
                            // request, and the time the access token
                            // and signed request each expire
                            auth0.login({
                                connection: "facebook"
                            }, function (err) {
                                if (err) alert("something went wrong: " + err.message);
                            });
                        } else {
                            // the user isn't logged in to Facebook.
                            lock.show({
                                callbackURL: '#{env.AUTH0_CALLBACK_URL}'
                                , responseType: 'code'
                            });
                        }
                    });
                });
  ```              


## Processing the Callback
The following call to `login` using the `google-oauth2` social connection would result in a redirect to a Google login page and then a redirect back to `http://my-app.com/callback` if successful:
The mode used here is the default one - redirect mode.

```js
auth0.login({
  connection: 'google-oauth2'
});
```

The Auth0 client in [Initialize](#initialize) section above had // callbackOnLocationHash not set (defaults to false).
In a regular web application (HTML pages rendered on the server), the `callbackURL` should point to a server-side endpoint that will process the successful login, primarily to set some sort of session cookie.  In this scenario the `callbackOnLocationHash` option is set `false` (or just not specified) when the Auth0 client is created:
On successful login, Auth0 will redirect to your `callbackURL` with an appended authorization `code` query parameter.The `code` value should get processed completely server-side.
> Note: Server-side processing of the `code` looks something like this: Using whichever [Auth0 server-side SDK](https://auth0.com/docs/quickstart/webapp) necessary, the endpoint on the server should exchange the `code` for an `access_token` and `id_token` and optionally a full user profile.  It should then set some kind of local session cookie, which is what enables a user to be "logged in" to the website and usually contains data from the user profile.  It should finally redirect the user back to a meaningful page.

The middleware here being our router processes the call back and upon successful login routes to the user view.
```js
router.get('/callback',
    passport.authenticate('auth0', { failureRedirect: '/url-if-something-fails' }),
    function(req, res) {
      res.redirect(req.session.returnTo || '/user');
    });
```
```html
block content
  img(src="#{user.picture}")
  h2 Welcome #{user.nickname}!
  br
  a(href='/logout') Logout
```

## Linking Accounts

The user can login with Database Connection(username-password authentication) and a "Link" button will be presented. This button will not appear if they did not login with Database Connection  or if they are already linked to a Google/Facebook Account.
A rule is setup as below in [Application Settings -> Rules](https://manage.auth0.com/#/rules)

```html
function (user, context, callback) {
  user.current_login = context.connection;
  
  callback(null, user, context);
}
```
Below code helps us detect if the user is already linked to google/facebook. 
The actual linking sample examples can be found [here](https://github.com/auth0-samples/auth0-link-accounts-sample) 

```html
 if (user.current_login == 'Username-Password-Authentication')
    button(onclick="linkAccounts()") Link
  else if (user.identities.length > 1)
      each identity in user.identities
        if (identity.provider !== 'google-oauth2' || identity.provider !== 'facebook')
          button(onclick="linkAccounts()") Link
```
