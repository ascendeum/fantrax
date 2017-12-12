/* Load GPT & Prebid - ONLY IF NOT POSSIBLE TO LOAD IN <head> */
/*(function() {
            var gads = document.createElement('script');
            gads.async = true;
            gads.type = 'text/javascript';
            var useSSL = 'https:' == document.location.protocol;
            gads.src = (useSSL ? 'https:' : 'http:') +
                '//www.googletagservices.com/tag/js/gpt.js';
            var node = document.getElementsByTagName('script')[0];
            node.parentNode.insertBefore(gads, node);
        })();
(function() {
            var gads = document.createElement('script');
            gads.async = true;
            gads.type = 'text/javascript';
            var useSSL = 'https:' == document.location.protocol;
            gads.src = (useSSL ? 'https:' : 'http:') +
                '//ascendeum.github.io/fantrax/prebid.js';
            var node = document.getElementsByTagName('script')[0];
            node.parentNode.insertBefore(gads, node);
        })();  */      

/*
** Ads' Functionality
*/
    
var adsStart = (new Date()).getTime();

/* Some settings */
var TIMEOUT = 2000;
var EXCHANGE_RATE = 1.3;
var dfpNetwork = '28498787';

/* Global Ads Variables */
var googletag = googletag || {};
    googletag.cmd = googletag.cmd || [];
var pbjs = pbjs || {};
    pbjs.que = pbjs.que || [];
var adUnits = adUnits || [];
pbjs.timeStart = adsStart;
pbjs.exchangeRate = EXCHANGE_RATE;

/* SizeMapping Helper */
function detectWidth() {
        return window.screen.width || window.innerWidth || window.document.documentElement.clientWidth || Math.min(window.innerWidth, window.document.documentElement.clientWidth) || window.innerWidth || window.document.documentElement.clientWidth || window.document.getElementsByTagName('body')[0].clientWidth;
    }
/* SizeMapping */
var sizeMappingTop = [[728, 90], [970, 250], [970, 90]];
var sizeMappingBottom = [[728, 90], [970, 250], [970, 90]];
var sizeMappingRight = [[300, 250], [300, 600], [336, 280], [160, 600]];
if(detectWidth() < 992) {
    // Table SizeMapping
    sizeMappingTop = [[728, 90]];
    sizeMappingBottom = [[728, 90]];
    sizeMappingRight = [[160, 600]];
}
if(detectWidth() < 768) {
    // Mobile SizeMapping
    sizeMappingTop = [[320, 50],[320, 100]];
    sizeMappingBottom = [[320, 50],[320, 100]];
    sizeMappingRight = [[300, 250]];
}

/* Device detection */
var device = (detectWidth() >= 768) ? "Desktop" : "Mobile";

/* DFP Config */
googletag.cmd.push(function() {
        // Disable Initial Load
        googletag.pubads().disableInitialLoad();

        // Set targeting
        googletag.pubads().setTargeting("device", (detectWidth() < 768) ? "mobile" : "desktop");
        googletag.pubads().setTargeting("spa", "1");

        // Init DFP
        googletag.pubads().enableSingleRequest();
        googletag.pubads().collapseEmptyDivs();
        googletag.enableServices();
    });

/* Define an adunit 
adunit (string) : Name of adunit
sizes (array) : List of sizes
*/
function defineAd(adunit, sizes)
{
    var adunitTarget = {};
    var adunitExists = false;

    // Check if adunit was already defined
    for (var i = adUnits.length - 1; i >= 0; i--) {
        if(adUnits[i].adunit == adunit) {
            adunitTarget = adUnits[i];
            adunitExists = true;
        }
    }
    
    // If it was not defined, define it
    if(!adunitExists){
        var randomId = Math.floor(Math.random() * 1000000);
        var divId = 'div-gpt-ad-'+randomId;
        adunitTarget = {
                network: dfpNetwork,
                adunit: adunit,
                size: sizes,
                code: divId
                };
        // Define it to DFP
         googletag.cmd.push(function() {
            adunitTarget.dfp = googletag.defineSlot('/'+adunitTarget.network+'/'+adunitTarget.adunit, adunitTarget.size, adunitTarget.code).addService(googletag.pubads());
         });

        // Store it in adUnit variable
         adUnits.push(adunitTarget);
    }

    // Check if element exists
    if(document.getElementById(adunitTarget.code) !== null) return document.getElementById(adunitTarget.code);

    // If it doesn't exits, create the div element
    var newDiv = document.createElement( "div" );
        newDiv.id = adunitTarget.code;
        newDiv.name = adunitTarget.adunit;
	return newDiv;
}

/*
Get ad from adUnit Variable based on the div element
div (object) : the div element
*/
function getAdByDiv(div)
{
    for (var i = adUnits.length - 1; i >= 0; i--) {
        if(adUnits[i].code == div.id) {
            return adUnits[i];
        }
    }    
}

/* Request Ads */
function requestAds(requestAdunits)
{
    var toRequestAdunits = [];
    if(typeof requestAdunits === "undefined")
    {
        toRequestAdunits = adUnits;
    }
    else {
        for (var i = requestAdunits.length - 1; i >= 0; i--) {
            toRequestAdunits.push(getAdByDiv(requestAdunits[i]));
        }
    }

    // pbjs.request ads
    pbjs.initAdserverSet = false;
    pbjs.que.push(function() { pbjs.requestAds(toRequestAdunits,displayAds,TIMEOUT); });
    pbjs.timeout = setTimeout(displayAds, TIMEOUT);

}

function setAds()
{
 // Calling display gpt ads
    googletag.cmd.push(function() {
        for (var i = adUnits.length - 1; i >= 0; i--) {
            googletag.display(adUnits[i].code);
        }
    });   
}

/*
Helper function to refresh individual ads
toRefreshAdunit (object) : DFP Adslot object
*/
function doRefreshIndividual(toRefreshAdunit) {
    googletag.pubads().refresh([toRefreshAdunit]);
}

/*
It will actually display the ads on page
displayAdunits (array) : list of adunits to refresh, if not defined use all from adUnits variable
*/
function displayAds(displayAdunits)
{
    if (pbjs.initAdserverSet) return;

    var toDisplayAdunits = [];
    if(typeof displayAdunits === "undefined")
    {
        toDisplayAdunits = adUnits;
    }
    else {
        for (var i = displayAdunits.length - 1; i >= 0; i--) {
            toDisplayAdunits.push(getAdByDiv(displayAdunits[i]));
        }
    }

    googletag.cmd.push(function() {
            pbjs.que.push(function() {

                pbjs.setTargetingForGPTAsync();

                // Get All DFP adunits
                var dfpAdunits = googletag.pubads().getSlots();
                for (var i = dfpAdunits.length - 1; i >= 0; i--) {
                    for (var y = toDisplayAdunits.length - 1; y >= 0; y--) {
                        if(dfpAdunits[i].getSlotElementId() == toDisplayAdunits[y].code) doRefreshIndividual(dfpAdunits[i]);
                    }
                }
             
            });
        });

    pbjs.initAdserverSet = true;
}



/*
** Page Functionality
*/

/* Just generating some random content */
var loremContents = (function() {
    var lorem = new Lorem(); 
    lorem.type = Lorem.TEXT; 
    lorem.query = '3p'; 
    return lorem.createLorem();
  	})();

/* Top Menu Functions */
$("#newPage").click(function(){

    // Clean Page Content
    $("#content").html("");

    // Start defining ads
    var ad1 = defineAd('Fantrax_'+device+'_Top_Horizontal',sizeMappingTop);
    var ad2 = defineAd('Fantrax_'+device+'_Right_Sidebar_A',sizeMappingRight);
    var ad3 = defineAd('Fantrax_'+device+'_Right_Sidebar_B',sizeMappingRight);

    // Finish Defining Ads & Request Ads
    requestAds([ad1,ad2,ad3]);

    // Render content
        // Add top ad
        $("#content").append(ad1);
        // Add content
        $("#content").append(loremContents);
        // Add Sidebar Ad 1
        $('#sidebarAd1').append(ad2);
        // Add Sidebar Ad 2
        $('#sidebarAd2').append(ad3);

    // Set ads in content
    setAds();

});

$("#addAdUnit").click(function(){
    // Start defining ads
    var ad1 = defineAd('Fantrax_'+device+'_Bottom_Horizontal',sizeMappingBottom);

    // Finish Defining Ads & Request Ads
    requestAds([ad1]);

    // Render content
        // Add Message
        $("#content").append("<h2>Adding bottom ad</h2>");
        // Add top ad
        $("#content").append(ad1);

    // Set ads in content
    setAds([ad1]);    
});

$("#refreshAds").click(function(){
    // Request Ads
    requestAds();

    // Set ads in content
    setAds();
});

$("#pageWithoutAds").click(function(){
// No Ad Functions, just clearing page

    // Clean Page Content
    $("#content").html("");
    $("#content").append(loremContents);

    // Clear Sidebar Ads
    $("#sidebarAd1").html("");
    $("#sidebarAd2").html("");
});

/* HOMEPAGE (initial load page) - Sidebar insert Ads */
$(document).ready(function(){
    // Start defining ads
    var ad1 = defineAd('Fantrax_'+device+'_Right_Sidebar_A',sizeMappingRight);
    var ad2 = defineAd('Fantrax_'+device+'_Right_Sidebar_B',sizeMappingRight);

    requestAds([ad1,ad2]);

    // Add Sidebar Ad 1
    $('#sidebarAd1').append(ad1);
    // Add Sidebar Ad 2
    $('#sidebarAd2').append(ad2);

    setAds([ad1,ad2]);
});
