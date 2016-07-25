
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

/*
 * Link Accounts.
 */
function linkPasswordAccount(connection) {
    localStorage.setItem('primary_user_id', user_id);
    localStorage.setItem('primaryIdToken', primaryIdToken);
    localStorage.setItem('linking','linking');

    var opts = {
        rememberLastLogin: false,
        dict: {
            signin: {
                title: 'Link another account'
            }
        }
    };
    if (connection) {
        opts.connections = [connection];
    }
    //open lock in signin mode, with the customized options for linking
    lockagain.showSignin(opts);
}

/*
 * Link account
 */
function linkAccount(secondaryJWT) {
    // At this point you could fetch the secondary account's user_metadata for merging with the primary account.
    // Otherwise, it will be lost after linking the accounts
    var primaryUserId = localStorage.getItem('primary_user_id');
    var primaryJWT = localStorage.getItem('primaryIdToken');
    $.ajax({
        type: 'POST',
        url: 'https://' + auth0_domain +'/api/v2/users/' + primaryUserId + '/identities',
        data: {
            link_with: secondaryJWT
        },
        headers: {
            'Authorization': 'Bearer ' + primaryJWT
        }
    }).then(function (identities) {
        alert('linked!');
        showLinkedAccounts(identities);
        //reloadProfile();
    }).fail(function (jqXHR) {
        alert('Error linking Accounts: ' + jqXHR.status + " " + jqXHR.responseText);
    });
}

/*
 * Unlink account
 */
function unlinkAccount(secondaryProvider, secondaryUserId) {
    localStorage.setItem('primary_user_id', user_id);
    localStorage.setItem('primaryIdToken', primaryIdToken);
    var primaryUserId = localStorage.getItem('primary_user_id');
    var primaryJWT = localStorage.getItem('primaryIdToken');
    $.ajax({
        type: 'DELETE',
        url: 'https://' + auth0_domain +'/api/v2/users/' + primaryUserId +
        '/identities/' + secondaryProvider + '/' + secondaryUserId,
        headers: {
            'Authorization': 'Bearer ' + primaryJWT
        }
    }).then(function (identities) {
        alert('unlinked!');
        showLinkedAccounts(identities);
    }).fail(function (jqXHR) {
        alert('Error unlinking Accounts: ' + jqXHR.status + ' ' + jqXHR.responseText);
    });
}

/*
 * Returns true if the identity is the same of the root profile
 */
function isRootIdentity(identity) {
    var user_id = localStorage.getItem('primary_user_id');
    return identity.provider === user_id.split('|')[0] && identity.user_id === user_id.split('|')[1];
}

